# Notification System

## Overview

The notification system delivers real-time, type-safe notifications from server to client through a three-layer pipeline:

```
EventRegistry (unified event + notification definitions)
  -> dispatch() (validate + persist + publish)
    -> DB (Prisma/MongoDB) + Ably (realtime)
      -> Frontend (RealtimeProvider → RTK Query cache)
```

**Key design principle:** The **EventRegistry** (`src/lib/realtime/registry.ts`) is the single source of truth. All event names, notification types, schemas, renderers, push categories, cache invalidation tags, menu routing, and action buttons are defined in one place.

**Realtime design principle:** Events update *state* (RTK Query cache). Components read state. Components have zero realtime awareness — `RealtimeProvider` centrally maps every Ably event to cache operations so no consumer component needs to subscribe to events directly.

## Adding a New Notification Type

Only 2 steps are needed:

### 1. Add to the EventRegistry

```typescript
// src/lib/realtime/registry.ts
export const EventRegistry = {
  // ... existing entries
  YOUR_NEW_TYPE: {
    tags: null,                        // null = intentionally no extra cache tags (never use [])
    notification: {
      schema: z.object({               // Zod schema for the notification data payload
        projectId: z.string(),
        projectName: z.string(),
        actorId: z.string(),           // always include actor ID for profile linking
        actorName: z.string().nullable(),
      }),
      pushCategory: "pushProjectActivity" as const,  // push toggle category
      menu: "notifications" as const,   // "notifications" or "messages"
      renderer: {
        getMessage(data) {
          const d = data as { actorName: string | null; projectName: string };
          return `${d.actorName ?? "Someone"} did something in ${d.projectName}.`;
        },
        getUser(data) {
          const d = data as { actorName: string | null };
          return { name: d.actorName ?? "User", image: null };
        },
        getUserId(data) {              // expected on all renderers
          return (data as { actorId?: string }).actorId;
        },
        getHref(data) {                // optional
          const d = data as { projectId: string };
          return `/projects/${d.projectId}`;
        },
      } satisfies NotificationRenderer,
      // Optional: co-located action buttons
      actions(data) {
        const d = data as { projectId: string };
        return [
          { label: "Accept", variant: "accept", getPayload: () => ({ id: d.projectId }) },
          { label: "Reject", variant: "reject", getPayload: () => ({ id: d.projectId }) },
        ];
      },
    },
  },
};
```

This automatically:
- Adds the type to the `NotificationType` union
- Adds the schema to `NotificationDataSchemas`
- Enables type-safe `dispatch()` calls
- Registers the renderer for `NotificationMenu` display
- Maps to a push category for OS-level push notifications
- Configures cache invalidation tags for `RealtimeProvider`
- Routes to the correct menu ("notifications" or "messages")
- Registers action buttons (if provided)

### 2. Send the Notification

```typescript
import { dispatch } from "@pointwise/lib/realtime/publish";

await dispatch("YOUR_NEW_TYPE", {
  projectId: "...",
  projectName: "My Project",
  actorId: user.id,
  actorName: user.name,
}, recipientUserIds);
```

`dispatch` inspects the registry and routes accordingly:
- If the entry has a `notification` block → validates, persists to DB, publishes via Ably with push
- If the entry has only an `event` block → publishes to Ably (realtime-only, no DB record)

No database migration needed. No codegen needed (unless you add a new endpoint).

`RealtimeProvider` is a generic engine that reads from the registry — it never needs editing when events are added. Unhandled events are logged in development via `console.info`.

## Registry Reference

Each entry in `EventRegistry` can have:

| Field | Type | Description |
|-------|------|-------------|
| `event` | `string` | (Optional) Ably event name for realtime delivery |
| `schema` | `ZodObject` | (If `event` present) Zod schema for the realtime event payload |
| `tags` | `TagDescription[] \| TagResolver \| null` | RTK Query tags to invalidate on event arrival. Use `null` for intentionally no tags — never use `[]` |
| `notification` | `object` | (Optional) If present, this entry is a DB-persisted notification |
| `notification.schema` | `ZodObject` | Zod schema for the notification's `data` payload |
| `notification.pushCategory` | `PushCategory` | Push notification toggle category |
| `notification.menu` | `"notifications" \| "messages" \| "friends"` | Which navbar menu shows this notification type |
| `notification.renderer` | `NotificationRenderer` | getMessage/getPushMessage/getUser/getUserId/getHref for display |
| `notification.actions` | `(data) => NotificationActionDefinition[]` | (Optional) Accept/reject button definitions |

### Dual Entries

Some entries like `FRIEND_REQUEST_RECEIVED` and `NEW_MESSAGE` have both a top-level `schema` (lightweight, for cache invalidation via realtime events) and a `notification.schema` (richer, for display/persistence). The top-level schema is used by `emitEvent` for realtime-only broadcasting, while the notification schema is used by `sendNotification` for DB persistence and push.

### Tags Convention

- `null` — intentionally no extra cache tags beyond the optimistic notification insert
- `TagDescription[]` — static list of RTK Query tags to invalidate
- `(data) => TagDescription[]` — dynamic resolver for context-dependent tags
- Never use `[]` (empty array) — use `null` instead for clarity

### NotificationRenderer Interface

| Method | Required | Description |
|--------|----------|-------------|
| `getMessage(data)` | Yes | Human-readable message for in-app display |
| `getPushMessage(data)` | No | Push-specific copy; falls back to `getMessage` |
| `getUser(data)` | Yes | `{ name, image }` for avatar display |
| `getUserId(data)` | Expected | Actor user ID for profile linking (expected on all renderers) |
| `getHref(data)` | No | Navigation URL for click-through |

Derived exports:
- `NotificationType` — Union type of all notification registry keys (e.g., `"FRIEND_REQUEST_ACCEPTED" | "NEW_MESSAGE" | ...`)
- `notificationTypeValues` — Array of all notification type strings (for validation)
- `NotificationDataSchemas` — Map of notification type → Zod data schema
- `NotificationData<T>` — Generic type that infers the notification data shape for a given type
- `RealtimeEventKey` — Union type of all keys with an `event` field
- `RealtimeEvents` — Event key → event name string map
- `RealtimeEventData<K>` — Generic type that infers the realtime event payload for a given key
- `NOTIFICATION_RENDERERS` — Map of notification type → renderer (extracted from registry)
- `FALLBACK_RENDERER` — Default renderer for unknown notification types
- `getCategoryForNotificationType(type)` — Reverse lookup from notification type to push category
- `getNotificationMenu(type)` — Reverse lookup from notification type to menu ("notifications" or "messages")
- `getRegistryActions(type, data)` — Get co-located action definitions from the registry
- `dispatch(key, payload, userIds)` — Unified dispatch function
- `DispatchPayload<K>` — Inferred payload type for dispatch

## Channel Routing

All realtime events are published to a single user-scoped Ably channel: `user:{userId}`. The event name (e.g., `new-notification`, `friend-request:received`, `comment:created`) distinguishes event types within that channel. There is no per-category channel splitting — `RealtimeProvider` subscribes to one channel and routes events by name.

The `RealtimeChannels` helper in `src/lib/realtime/registry.ts` builds channel names:

```typescript
RealtimeChannels.user(userId) // => "user:{userId}"
```

The `EventRegistry` in the same file defines all events declaratively — entries with an `event` field have an Ably event name string, `schema` (Zod payload schema), and `tags` (RTK Query tags to invalidate). The `RealtimeEvents` object is derived from the registry for backwards compatibility.

Server-side, use `dispatch()` as the primary API for all endpoints. It routes to `sendNotifications` (DB + push + realtime) for notification entries, or `emitEvent` (realtime-only) for event-only entries. The specialized helpers (`publishNewMessage`, `publishCommentEvent`, `publishPostCommentEvent`) handle events with complex recipient lookup logic.

## Frontend Consumption

### Centralized Event Handling (RealtimeProvider)

`RealtimeProvider` (`src/lib/realtime/RealtimeProvider.tsx`) is a generic engine that maps Ably events to RTK Query cache operations using the declarative `EventRegistry` in `src/lib/realtime/registry.ts`. It:

1. Subscribes to the user's Ably channel on mount
2. For `NEW_NOTIFICATION`: performs an optimistic insert into the cache (with staleness guard), then resolves notification-type-specific tags via the unified `EventRegistry`
3. For all other events: looks up the event in `EventRegistry` and resolves the `tags` field (static array or dynamic function)

The provider never needs editing when events are added — just add an entry to `EventRegistry`.

**Staleness guard:** Before inserting a `NEW_NOTIFICATION` into the cache, the provider checks if the incoming notification's `createdAt` is more than 30 seconds older than the newest cached notification. If so, the insert is skipped (the notification was likely already included in a refetch).

**Event-to-action mapping** (defined in `EventRegistry.tags`):

| Event | Cache Action |
|-------|-------------|
| `NEW_NOTIFICATION` | Optimistic insert into `getNotifications` cache (dedup by ID, staleness guard). Additional tags resolved via `EventRegistry[type].tags` by notification type. |
| `NEW_MESSAGE` | Invalidate `[Conversations, { Messages, id: conversationId }]` |
| `NOTIFICATIONS_READ` | Invalidate `[Notifications]` — syncs read status across tabs/devices |
| `FRIENDSHIP_REMOVED`, `FRIEND_REQUEST_RECEIVED`, `FRIEND_REQUEST_DECLINED`, `FRIEND_REQUEST_CANCELLED` | Invalidate `[Friends, FriendRequests, FriendshipStatus]` |
| `JOIN_REQUEST_*`, `INVITE_*`, `MEMBER_ROLE_UPDATED`, `MEMBER_REMOVED` | Invalidate `[Projects, Invites, JoinRequests]` |
| `COMMENT_CREATED`, `COMMENT_EDITED`, `COMMENT_DELETED` | If `taskId` → invalidate `[{ Comments, id: taskId }]` (+ `[{ Replies, id }]` if reply). If `postId` → invalidate `[{ PostComments, id: postId }]` (+ `[{ PostReplies, id }]` if reply). |

**Consumer components are pure state readers.** They use RTK Query hooks (`useGetNotificationsQuery`, `useGetPendingRequestsQuery`, etc.) and react to cache updates automatically — no `useRealtimeEvent` or dispatch calls needed.

### Menu Routing

Each notification entry has a `menu` field (`"notifications"` or `"messages"`) that determines which navbar menu displays it. `NotificationMenu.tsx` filters to `menu === "notifications"` and `MessagesMenu.tsx` filters to `menu === "messages"` using the `getNotificationMenu()` helper.

### Optimistic Updates

When a `NEW_NOTIFICATION` Ably event arrives, the notification is inserted directly into the RTK Query cache:

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

`NotificationMenu.tsx` uses `NOTIFICATION_RENDERERS` (derived from the EventRegistry) to render notifications:

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

Delete old read notifications for the current user.

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

The `Conversation` component marks conversations as read (debounced at 500ms) and scrolls to the bottom automatically whenever `messages.length` changes — no realtime subscription needed since `RealtimeProvider` invalidates the Messages cache, which triggers a refetch, which updates `messages.length`.

## Push Notifications

OS-level push notifications are delivered via Ably's Web Push (VAPID/FCM) when users aren't on the site.

### Architecture

```
Server publishes to Ably channel with `extras: { push: { notification: {...} } }`
  -> Ably forwards to FCM (Chrome) or APNs (Safari)
    -> Browser service worker receives push event
      -> OS notification displayed
```

### How It Works

1. **Device registration** — `RealtimeProvider` registers the service worker, calls `client.push.activate()`, then subscribes the device to the user's channel
2. **Server-side injection** — `publishNotification()` in `src/lib/realtime/publish.ts` calls `buildPushExtras()` which checks the recipient's `NotificationSettings` and includes a push payload if their category toggle is enabled
3. **Service worker** — `public/service_worker.js` handles the `push` event (shows OS notification) and `notificationclick` event (navigates to the relevant URL)

### Push Copy

By default, push notification text uses `getMessage()` from the renderer. To provide push-specific copy (shorter, more urgent), implement `getPushMessage()` on the renderer — it will be preferred over `getMessage()` when building push payloads.

### Batch Publishing

When publishing to 2+ users, `publishToUsers` uses Ably's `POST /messages` batch API to send a single request instead of N individual publishes. For single-user publishes, it falls back to the standard channel publish.

### Retry Logic

Both `publishAblyEvent` and `publishAblyBatch` retry once (with a 200ms delay) on failure. If the batch API fails twice, `publishAblyBatch` falls back to individual `Promise.allSettled` publishes per channel — ensuring delivery even when the batch API is unavailable. The DB notification is always saved first, so users will see it on next page load even if the realtime push fails.

### Per-User Settings

`NotificationSettings` is a composite type on the User model (`prisma/schema.prisma`):

| Field | Default | Controls |
|-------|---------|----------|
| `pushEnabled` | `true` | Master toggle — disables all push when `false` |
| `pushMessages` | `true` | `NEW_MESSAGE` |
| `pushFriendRequests` | `true` | `FRIEND_REQUEST_RECEIVED`, `FRIEND_REQUEST_ACCEPTED` |
| `pushProjectActivity` | `true` | All project invite/join/role/removal types |
| `pushTaskAssignments` | `true` | `TASK_ASSIGNED` |
| `pushComments` | `true` | `TASK_COMMENT_RECEIVED`, `POST_COMMENT_RECEIVED` |

Category mappings are defined on each notification entry's `pushCategory` field in the `EventRegistry`.

### Key Files

| File | Purpose |
|------|---------|
| `public/service_worker.js` | Push event handler + notification click navigation |
| `src/lib/realtime/registry.ts` | Unified EventRegistry with event names, notification schemas, renderers, push categories, menu routing, actions, and tag mappings |
| `src/lib/realtime/publish.ts` | Server-side publish functions (`dispatch`, `emitEvent`, `publishNotification`, `publishNewMessage`, etc.) |
| `src/lib/realtime/RealtimeProvider.tsx` | Ably connection, centralized event→cache mapping, push activation, staleness guard |
| `src/lib/notifications/service.ts` | `sendNotification()` / `sendNotifications()` — validate, persist, batch-resolve push, publish |
| `src/lib/notifications/push.ts` | `buildPushPayload()`, `buildPushExtras()`, `buildPushExtrasForUsers()` (batch variant) |
| `src/lib/realtime/log.ts` | `logDispatchError()` — structured error logging for dispatch failures |
| `src/lib/notifications/actions.ts` | `getNotificationActions()` — derives from registry's co-located action definitions |
| `src/lib/ably/server.ts` | `publishAblyEvent` / `publishAblyBatch` with retry-once logic |
| `src/endpoints/user/notification-settings/get.ts` | GET settings endpoint |
| `src/endpoints/user/notification-settings/update.ts` | PATCH settings endpoint |
| `src/app/settings/NotificationSettings.tsx` | Settings UI with toggles |

### Ably Dashboard Setup

1. Go to Ably dashboard → app → **Configuration** → **Rules**
2. Add a rule for namespace `user`
3. Enable **Push notifications enabled**
4. Configure **Firebase Cloud Messaging** with a service account JSON (required for Chrome — Chrome routes Web Push through FCM)

### Adding Push to a New Notification Type

Push is automatic — just set the `pushCategory` on your notification entry in the EventRegistry. `buildPushExtras()` will include push payloads based on the user's category toggle.
