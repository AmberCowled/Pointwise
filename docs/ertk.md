# ERTK (Easy RTK) - Creating New API Endpoints

ERTK lets you define an API endpoint in **one file**. The codegen script (`pnpm generate`) then produces:

- RTK Query hooks for the client
- Next.js route handlers for the server
- Store and cache invalidation wiring

## Quick Start

1. Create a file in `src/endpoints/`
2. Run `pnpm generate` (or let the dev server watcher handle it)
3. Import the generated hook from `@pointwise/generated/api`

## File Location = Route Path

The directory structure determines the API URL. Directory names are used **as-is** (no automatic pluralization).

```
src/endpoints/tasks/get.ts          → GET  /api/tasks
src/endpoints/tasks/create.ts       → POST /api/tasks
src/endpoints/tasks/[id]/update.ts  → PATCH /api/tasks/:id
src/endpoints/tasks/[id]/like.ts    → POST /api/tasks/:id/like
```

### CRUD filenames (no URL segment added)

These filenames map to HTTP methods without adding a URL segment:

| Filename | Typical method |
|----------|---------------|
| `get.ts`, `list.ts` | GET |
| `create.ts`, `send.ts` | POST |
| `update.ts` | PATCH |
| `delete.ts`, `remove.ts`, `cancel.ts` | DELETE |

### Other filenames add a segment

Any filename not in the list above becomes a URL segment:

```
tasks/[id]/like.ts    → /api/tasks/:id/like
tasks/[id]/unlike.ts  → /api/tasks/:id/unlike
```

### Route grouping

Multiple endpoints at the same URL with different HTTP methods are grouped into one `route.ts`:

```
tasks/[id]/like.ts    (POST)   ─┐
tasks/[id]/unlike.ts  (DELETE) ─┘→ src/app/api/tasks/[id]/like/route.ts (if same path)
```

## Endpoint File Format

Every endpoint file has one default export using the `endpoint` factory:

```typescript
import { endpoint } from "@pointwise/lib/ertk";

export default endpoint.get<ResponseType, ArgsType>({
  name: "endpointName",       // unique name, becomes the hook: useEndpointNameQuery
  protected: true,             // requires authentication (default: true)
  request: ZodSchema,          // optional: Zod schema for body/query validation
  tags: { ... },               // optional: cache tags
  query: (args) => "...",      // client-side: URL the browser fetches
  handler: async (ctx) => {},  // server-side: business logic
});
```

### Methods

```typescript
endpoint.get(...)    // → builder.query,  useXxxQuery hook
endpoint.post(...)   // → builder.mutation, useXxxMutation hook
endpoint.patch(...)  // → builder.mutation
endpoint.put(...)    // → builder.mutation
endpoint.delete(...) // → builder.mutation
```

### Type parameters

```typescript
endpoint.get<TResponse, TArgs>({ ... })
//           ^          ^
//           |          └── Hook argument type (use `void` for no args)
//           └── Response type (what the hook returns)
```

## Examples

### Simple query (no args)

```typescript
import { endpoint } from "@pointwise/lib/ertk";
import type { GetUserResponse } from "@pointwise/lib/validation/users-schema";
import { getUser } from "@pointwise/lib/api/users";

export default endpoint.get<GetUserResponse, void>({
  name: "getUser",
  tags: { provides: ["User"] },
  protected: true,
  query: () => "/user",
  handler: async ({ user }) => {
    const userData = await getUser(user.id);
    return { user: userData };
  },
});
```

### Query with args

```typescript
import { endpoint } from "@pointwise/lib/ertk";
import { GetTasksRequestSchema } from "@pointwise/lib/validation/tasks-schema";
import type { GetTasksRequest, GetTasksResponse } from "@pointwise/lib/validation/tasks-schema";
import { getTasks, serializeTask } from "@pointwise/lib/api/tasks";

export default endpoint.get<GetTasksResponse, GetTasksRequest>({
  name: "getTasks",
  request: GetTasksRequestSchema,
  tags: { provides: ["Tasks"] },
  protected: true,
  query: ({ projectId }) => `/tasks?projectId=${projectId}`,
  handler: async ({ user, query }) => {
    const q = query as GetTasksRequest;
    const tasks = await getTasks(q.projectId, user.id);
    return { tasks: tasks.map((t) => serializeTask(t, user.id)) };
  },
});
```

### Mutation

```typescript
import { endpoint } from "@pointwise/lib/ertk";
import type { CreateProjectRequest, CreateProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { createProject, serializeProject } from "@pointwise/lib/api/projects";

export default endpoint.post<CreateProjectResponse, CreateProjectRequest>({
  name: "createProject",
  tags: { invalidates: ["Projects"] },
  protected: true,
  query: (body) => ({ url: "/projects", method: "POST", body }),
  handler: async ({ user, body }) => {
    const project = await createProject(body, user.id);
    return { project: serializeProject(project, user.id) };
  },
});
```

### Mutation with dynamic route

```typescript
import { endpoint } from "@pointwise/lib/ertk";
import type { UpdateTaskRequest, UpdateTaskResponse } from "@pointwise/lib/validation/tasks-schema";
import { updateTask, serializeTask } from "@pointwise/lib/api/tasks";

export default endpoint.patch<UpdateTaskResponse, { taskId: string; data: UpdateTaskRequest }>({
  name: "updateTask",
  tags: { invalidates: ["Tasks"] },
  protected: true,
  query: ({ taskId, data }) => ({ url: `/tasks/${taskId}`, method: "PATCH", body: data }),
  handler: async ({ user, body, params }) => {
    const task = await updateTask(params.id, body, user.id);
    return { task: serializeTask(task, user.id) };
  },
});
```

## Cache Tags

Tags control when RTK Query refetches data.

### Static tags

```typescript
tags: { provides: ["Tasks"] }           // query: data is tagged as "Tasks"
tags: { invalidates: ["Tasks"] }        // mutation: refetch all "Tasks" queries
tags: { invalidates: ["Tasks", "XP"] }  // mutation: refetch multiple tag types
```

### Dynamic tags

```typescript
tags: {
  provides: (_result, _err, { taskId }) => [{ type: "Comments", id: taskId }],
}

tags: {
  invalidates: (_result, _err, { taskId, parentCommentId }) => {
    const tags = [{ type: "Comments", id: taskId }];
    if (parentCommentId) tags.push({ type: "Replies", id: parentCommentId });
    return tags;
  },
}
```

### Available tag types

`Tasks`, `Comments`, `Replies`, `Projects`, `Friends`, `FriendRequests`, `FriendshipStatus`, `Conversations`, `Conversation`, `Messages`, `Notifications`, `Invites`, `JoinRequests`, `XP`, `User`, `Users`

To add a new tag type, update `TagType` in `src/lib/ertk/types.ts`.

## Optimistic Updates

For mutations where you want instant UI feedback before the server responds.

### Single target

```typescript
optimistic: {
  target: "getTasks",                                    // query endpoint to patch
  args: (params) => ({ projectId: params.projectId }),   // args to identify which cache entry
  update: (draft, params) => {                           // immer-style mutation
    const d = draft as { tasks: Array<{ id: string; likeCount?: number }> };
    const task = d.tasks.find((t) => t.id === params.taskId);
    if (task) task.likeCount = (task.likeCount ?? 0) + 1;
  },
},
```

### Multi-target

```typescript
optimistic: {
  updates: [
    {
      target: "getComments",
      args: (params) => ({ taskId: params.taskId, projectId: params.projectId }),
      update: (draft, params) => { /* ... */ },
    },
    {
      target: "getReplies",
      args: (params) => ({ taskId: params.taskId, commentId: params.parentCommentId ?? "" }),
      condition: (params) => !!params.parentCommentId, // only apply when condition is true
      update: (draft, params) => { /* ... */ },
    },
  ],
},
```

The codegen generates `onQueryStarted` with automatic undo on failure.

## Handler Context

The `handler` function receives:

```typescript
handler: async ({ user, body, query, params, req }) => {
  // user    - authenticated user: { id, email, name, image }
  // body    - parsed request body (POST/PATCH/PUT)
  // query   - parsed query params (GET/DELETE)
  // params  - URL params from dynamic segments: { id: "...", commentId: "..." }
  // req     - raw Request object (for manual URL parsing if needed)
}
```

`params` keys come from the `[bracket]` directory names. For `tasks/[id]/comments/[commentId]/like.ts`, params will have `id` and `commentId`.

## Using Generated Hooks

After running `pnpm generate`:

```typescript
// In a React component
import { useGetTasksQuery, useCreateTaskMutation } from "@pointwise/generated/api";

function TaskList({ projectId }: { projectId: string }) {
  const { data, isLoading } = useGetTasksQuery({ projectId });
  const [createTask] = useCreateTaskMutation();
  // ...
}
```

## Cache Invalidation from Components

For cases where you need to manually invalidate cache (e.g., after a real-time event):

```typescript
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import { invalidateTags } from "@pointwise/generated/invalidation";

function MyComponent() {
  const dispatch = useAppDispatch();

  const handleRealtimeEvent = () => {
    dispatch(invalidateTags(["Notifications", { type: "Messages", id: conversationId }]));
  };
}
```

## Development Workflow

```bash
pnpm dev       # runs codegen + watch mode + next dev
pnpm generate  # one-shot codegen
pnpm build     # codegen + next build
```

The watcher re-runs codegen when files in `src/endpoints/` change.

## Checklist for Adding a New Endpoint

1. **Create the endpoint file** in the right directory under `src/endpoints/`
2. **Name the directory** to match the desired URL segment (directories are used as-is)
3. **Set the `query` function** to return a URL matching the route derived from the file location
4. **Add cache tags** (`provides` for queries, `invalidates` for mutations)
5. **Run `pnpm generate`** and verify the output
6. **Import the hook** from `@pointwise/generated/api` in your component
