# Notification System

## Overview

The notification system delivers real-time, type-safe notifications from server to client through a three-layer pipeline:

```
Registry (type definitions)
  -> Service (validate + persist + publish)
    -> DB (Prisma/MongoDB) + Ably (realtime)
      -> Frontend (RTK Query cache + optimistic updates)
```

**Key design principle:** The **Notification Registry** (`src/lib/notifications/registry.ts`) is the single source of truth. All types, schemas, channel mappings, and validation are derived from it.

## Adding a New Notification Type

Only 3 steps are needed:

### 1. Add to the Registry

```typescript
// src/lib/notifications/registry.ts
export const NotificationRegistry = {
  // ... existing types
  PROJECT_INVITE_RECEIVED: {
    channel: "projects",           // Ably channel suffix
    schema: z.object({             // Zod schema for the data payload
      projectId: z.string(),
      projectName: z.string(),
      inviterName: z.string().nullable(),
    }),
  },
};
```

This automatically:
- Adds the type to the `NotificationType` union
- Adds the schema to `NotificationDataSchemas`
- Maps the type to the correct Ably channel
- Enables type-safe `sendNotification()` calls

### 2. Send the Notification

```typescript
import { sendNotification } from "@pointwise/lib/notifications/service";

await sendNotification(recipientId, "PROJECT_INVITE_RECEIVED", {
  projectId: "...",
  projectName: "My Project",
  inviterName: "Alice",
});
```

### 3. Add a Frontend Renderer

```typescript
// src/lib/notifications/renderers.ts
NOTIFICATION_RENDERERS["PROJECT_INVITE_RECEIVED"] = {
  getMessage(data) {
    const d = data as { inviterName: string | null; projectName: string };
    return `${d.inviterName ?? "Someone"} invited you to ${d.projectName}.`;
  },
  getUser(data) {
    const d = data as { inviterName: string | null };
    return { name: d.inviterName ?? "User", image: null };
  },
  getHref(data) {
    const d = data as { projectId: string };
    return `/projects/${d.projectId}`;
  },
};
```

No database migration needed. No codegen needed (unless you add a new endpoint).

## Registry Reference

Each entry in `NotificationRegistry` contains:

| Field | Type | Description |
|-------|------|-------------|
| `channel` | `string` | Ably channel suffix: `"friend-requests"`, `"messages"`, or `"projects"` |
| `schema` | `ZodObject` | Zod schema that validates the notification's `data` payload |

Derived exports:
- `NotificationType` — Union type of all registry keys (e.g., `"FRIEND_REQUEST_ACCEPTED" | "NEW_MESSAGE" | ...`)
- `notificationTypeValues` — Array of all type strings (for validation)
- `NotificationDataSchemas` — Map of type string to Zod schema
- `NotificationData<T>` — Generic type that infers the data shape for a given type
- `NotificationChannelMap` — Map of type string to Ably channel suffix

## Channel Routing

Notifications are published to user-scoped Ably channels based on the `channel` field in the registry:

| Channel Suffix | Ably Channel | Notification Types |
|---------------|-------------|-------------------|
| `friend-requests` | `user:{userId}:friend-requests` | `FRIEND_REQUEST_ACCEPTED`, `FRIEND_REQUEST_RECEIVED` |
| `messages` | `user:{userId}:messages` | `NEW_MESSAGE` |
| `projects` | `user:{userId}:projects` | `PROJECT_INVITE_RECEIVED`, `PROJECT_INVITE_ACCEPTED`, `PROJECT_JOIN_REQUEST_RECEIVED`, `PROJECT_JOIN_REQUEST_APPROVED` |

The `publishNotification()` function in `src/lib/realtime/publish.ts` resolves channels automatically from the registry.

## Frontend Consumption

### Subscription Presets

Presets simplify subscribing to the right channel with the right filters:

| Preset | Channel | Filters |
|--------|---------|---------|
| `GENERAL_NOTIFICATIONS` | `friend-requests` | Excludes `NEW_MESSAGE` |
| `FRIEND_NOTIFICATIONS` | `friend-requests` | Only `FRIEND_REQUEST_ACCEPTED`, `FRIEND_REQUEST_RECEIVED` |
| `MESSAGE_NOTIFICATIONS` | `messages` | Only `NEW_MESSAGE` |
| `PROJECT_NOTIFICATIONS` | `projects` | All project types |

Usage:
```typescript
useSubscribeUserNotifications(userId, {
  preset: RealtimePreset.GENERAL_NOTIFICATIONS,
  onEvent: handleNotification,
});
```

### Optimistic Updates

When an Ably event arrives, the notification is inserted directly into the RTK Query cache:

```typescript
dispatch(
  api.util.updateQueryData("getNotifications", {}, (draft) => {
    if (!draft.notifications.some(n => n.id === payload.id)) {
      draft.notifications.unshift(payload);
    }
  }),
);
```

This provides instant UI feedback without a network round-trip.

### Renderer Map

`NotificationMenu.tsx` uses `NOTIFICATION_RENDERERS` to render notifications:

```typescript
const renderer = NOTIFICATION_RENDERERS[notification.type] ?? FALLBACK_RENDERER;
const message = renderer.getMessage(notification.data);
const userInfo = renderer.getUser(notification.data);
```

## Endpoints

### `GET /notifications`

Cursor-based paginated list of notifications.

**Query params:**
- `cursor` (optional) — notification ID to paginate from
- `limit` (optional) — 1-50, default 20

**Response:**
```json
{
  "notifications": [...],
  "nextCursor": "abc123" | null,
  "hasMore": true | false
}
```

### `PATCH /notifications/mark-all-read`

Mark all unread notifications as read, with optional type exclusion.

**Body (optional):**
```json
{ "excludeTypes": ["NEW_MESSAGE"] }
```

### `PATCH /notifications/dismiss`

Mark notifications as read by type and data match.

**Body:**
```json
{
  "type": "PROJECT_JOIN_REQUEST_RECEIVED",
  "dataMatch": { "projectId": "abc", "userId": "def" }
}
```

### `DELETE /notifications/read`

Delete old read notifications (cleanup).

**Body (optional):**
```json
{ "olderThanDays": 30 }
```

## Pagination

The notifications endpoint uses cursor-based pagination (same pattern as messages):

1. Fetch `limit + 1` records ordered by `createdAt desc`
2. If more than `limit` records returned, `hasMore = true` and `nextCursor = lastItem.id`
3. Return the first `limit` records

Frontend can load more pages by passing `cursor` from the previous response.

## Scoped Read / Dismiss

### Scoped markAllRead

Opening the notification bell calls `markAllRead({ excludeTypes: ["NEW_MESSAGE"] })` so message notifications stay unread. The messages menu handles message notification state separately.

### Targeted Dismiss

The `PATCH /notifications/dismiss` endpoint marks notifications as read when they match a `type` and a set of `dataMatch` key-value pairs against the JSON `data` field. Use case: when one admin processes a join request, dismiss the notification for all admins.

### markConversationRead

Uses a MongoDB raw command to filter on `data.conversationId` directly in the database, avoiding the need to load all unread message notifications into memory.
