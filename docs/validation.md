# Task Validation Rules

The task APIs (`POST /api/tasks`, `PATCH /api/tasks/[taskId]`) share validation helpers in `src/lib/validation/tasks.ts`. Client code should rely on the same constraints when building forms.

## Common Limits

- **Title**: required, trimmed, maximum 200 characters.
- **Category**: core list (`Work`, `Planning`, `Communication`, `Learning`, `Health`, `Personal`) or custom name ≤ 60 characters. Empty custom labels are rejected.
- **Context / notes**: optional, trimmed, maximum 5,000 characters.
- **XP value**: numeric, rounded to an integer between 0 and 1,000,000 inclusive.
- **Start / due dates**: ISO strings or `null`; when both provided, start must be on or before due date.

## Recurrence Rules

- `recurrence`: one of `none`, `daily`, `weekly`, `monthly`.
- `recurrenceDays`: integers 0–6 (Sunday–Saturday). Required when `recurrence === 'weekly'`.
- `recurrenceMonthDays`: integers 1–31. Required when `recurrence === 'monthly'`.
- `timesOfDay`: 24-hour strings (`HH:MM`), deduplicated and validated. Derived automatically from the anchor date if not provided.

## Update Semantics

- PATCH requests may send any subset of fields. Empty updates or invalid field types are rejected.
- Server responses return specific error messages (e.g. "Title must be 200 characters or fewer") that the client surfaces via the task modal.

## Testing

Unit tests for the validators live in `src/lib/validation/tasks.test.ts`. They cover success and failure scenarios for both create and update paths.
