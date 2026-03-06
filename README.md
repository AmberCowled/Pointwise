# Pointwise

**Full-stack collaborative project management platform with real-time social features, gamification, and AI-powered workflows.**

Built as an exploration of end-to-end system design — how authentication, real-time event distribution, data fetching, caching, code generation, and AI integration compose cleanly within a single architecture.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pointwise.dev-000000?style=for-the-badge&logo=vercel)](https://pointwise.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

**[Try the live demo](https://pointwise.dev/)**

---

## Overview

Pointwise is a production-grade platform where teams manage projects, track tasks, communicate in real time, and earn XP for their contributions. It combines structured project management with a social layer (friends, messaging, notifications) and a gamification system that uses AI to evaluate task impact.

The platform serves 77 API endpoints — all generated from declarative endpoint definitions via a custom code-generation tool — with real-time synchronisation across clients, multi-layered authentication, and end-to-end type safety from database to UI.

---

## Engineering Challenges

### Custom Code Generation with ERTK

The most significant architectural decision was building [ERTK](https://npmjs.com/package/ertk), a code-generation layer that bridges Next.js App Router API routes with Redux Toolkit Query. Each of the 77 endpoints is defined once in `src/endpoints/` as a single file containing its route handler, RTK Query configuration, Zod request schema, and cache tag declarations.

From these definitions, ERTK generates:
- **Next.js route handlers** in `src/app/api/` with automatic request validation, auth gating, and error handling
- **A complete RTK Query API slice** (`src/generated/api.ts`) with typed hooks for every endpoint
- **A configured Redux store** (`src/generated/store.ts`) with middleware and type exports
- **Cache invalidation helpers** (`src/generated/invalidation.ts`) for cross-endpoint tag management

The result is zero hand-written boilerplate for data fetching. Adding a new endpoint — complete with route handler, typed hook, validation, and cache invalidation — requires writing a single definition file. The pre-commit hook runs codegen automatically, so generated code never drifts from its source definitions.

### Real-Time State Synchronisation

Pointwise uses Ably WebSockets to synchronise state across clients in real time. The challenge was designing a channel architecture that scales without coupling the UI to transport-level details.

**Channel hierarchy:** Channels are scoped per-user (`user:{id}:friend-requests`, `user:{id}:messages`, `user:{id}:projects`) and per-entity (`conversation:{id}`, `task:{id}:comments`). Token generation grants capabilities per-channel pattern, so clients can only subscribe to their own event streams.

**Subscription presets:** Rather than having components subscribe to raw channels, a registry layer (`src/lib/realtime/config.ts`) defines named presets — `friend-notifications`, `general-notifications`, `message-notifications`, `project-notifications` — that map to filtered event sets. UI components consume these presets through React hooks (`useSubscribeUserNotifications`, `useSubscribeConversation`, etc.), keeping real-time logic decoupled from rendering.

**Optimistic cache integration:** When real-time events arrive, they're injected directly into RTK Query's normalised cache rather than triggering refetches. This means a friend request accepted on one client appears instantly on the other — no polling, no stale data, no loading spinners.

### Multi-Layered Authentication

Authentication is not a single concern but a stack of complementary security layers, each enforced at a different boundary:

1. **Identity** — NextAuth v4 with three providers (credentials with bcrypt hashing, Google OAuth, GitHub OAuth) and JWT session strategy
2. **Second factor** — WebAuthn/passkey-based 2FA via SimpleWebAuthn. On login, if 2FA is enabled, the session is flagged `pendingTwoFactor` and all API access is blocked until the passkey challenge completes
3. **Device sessions** — Each login generates a unique `jti` claim stored as a `DeviceSession` record. Users can view active sessions (with browser, OS, and IP metadata) and revoke any session, which immediately invalidates that JWT
4. **Rate limiting** — Upstash Redis enforces 250 requests per 10-minute window per user, applied uniformly at the ERTK handler layer before any business logic executes
5. **Middleware gating** — Next.js middleware enforces auth redirects and 2FA challenge routing at the edge

All five layers compose through the centralised ERTK request handler (`src/lib/ertk-handler.ts`), so every generated endpoint inherits the full security stack without per-route configuration.

### Optimistic Updates at Scale

Social interactions demand instant feedback. Pointwise implements optimistic updates across likes, comments, friend requests, project invites, and notifications — every mutation updates the local RTK Query cache immediately, then reconciles with the server response.

The coordination problem is cross-user invalidation: when User A rejects User B's friend request, User B's cache must update too. This is solved through lightweight Ably events (distinct from the notification system) that trigger targeted cache invalidations on the receiving client, avoiding full refetches while keeping data consistent.

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, React Compiler (`babel-plugin-react-compiler`) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS v4 with custom design token system (`StyleTheme`) |
| **UI** | 41 custom components, Headless UI, react-icons (Ionicons 5), Recharts |
| **State & Data** | Redux Toolkit (RTK Query), ERTK code generation |
| **Database** | MongoDB via Prisma ORM |
| **Auth** | NextAuth v4, SimpleWebAuthn, bcrypt, Prisma adapter |
| **Real-Time** | Ably (WebSocket pub/sub) |
| **AI** | Google Gemini (`@google/genai`) |
| **Validation** | Zod v4 (end-to-end, API to client) |
| **Rate Limiting** | Upstash Redis |
| **Email** | Resend |
| **File Uploads** | UploadThing |
| **Tooling** | Biome, pnpm, simple-git-hooks + lint-staged |

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19)                        │
│                                                                 │
│  RTK Query Hooks (generated) ◄── Real-Time Subscription Hooks   │
│         │                              │                        │
│         ▼                              ▼                        │
│  Redux Store (generated)         Ably Client (WebSocket)        │
└────────┬───────────────────────────────┬────────────────────────┘
         │ HTTP                          │ Token Auth
         ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                           │
│                                                                 │
│  API Routes (generated by ERTK)    Ably Token Endpoint          │
│         │                                                       │
│         ▼                                                       │
│  ERTK Handler Layer                                             │
│  ┌─ Rate Limit (Upstash) ──► Auth (NextAuth) ──► 2FA Gate  ─┐   │
│  │  ──► Device Session Check ──► Zod Validation ──► Handler │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                          │                            │
│         ▼                          ▼                            │
│  Service Functions            Ably REST (publish)               │
│         │                                                       │
│         ▼                                                       │
│  Prisma ORM ──► MongoDB                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
pointwise/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # Generated route handlers (via ERTK) + manual auth routes
│   │   ├── components/
│   │   │   ├── ui/                 # 41 custom components (Button, Card, Modal, DatePicker, etc.)
│   │   │   ├── auth/               # Auth forms (sign-in, sign-up)
│   │   │   ├── providers/          # Context providers (Session, Redux, Ably, DeviceSession)
│   │   │   └── analytics/          # Chart components (Recharts)
│   │   ├── dashboard/              # Core app: projects, tasks, comments, search, messaging
│   │   ├── settings/               # Account settings, device sessions, 2FA management
│   │   └── two-factor/             # 2FA challenge page
│   ├── endpoints/                  # ERTK endpoint definitions (single source of truth)
│   │   ├── conversations/          # Messaging (create, list, send, read tracking, archive)
│   │   ├── friends/                # Friend system (request, accept, decline, remove)
│   │   ├── projects/               # Project CRUD, members, invites, join requests
│   │   ├── tasks/                  # Task CRUD, likes, comments, threading
│   │   ├── user/                   # Profile, XP, device sessions, account management
│   │   ├── notifications/          # List, dismiss, delete with cursor pagination
│   │   └── llm/                    # AI endpoints (XP suggestion, task expansion, suggestions)
│   ├── generated/                  # Auto-generated by ERTK (never manually edited)
│   │   ├── api.ts                  # RTK Query API slice (77 endpoints)
│   │   ├── store.ts                # Redux store with middleware
│   │   └── invalidation.ts         # Cache tag invalidation helpers
│   └── lib/
│       ├── ably/                   # Ably client singleton + server REST publisher
│       ├── realtime/               # Channel registry, subscription presets, React hooks
│       ├── api/                    # Service layer (business logic per domain)
│       ├── llm/                    # Gemini client and prompt engineering
│       ├── notifications/          # Notification registry, renderers, send service
│       ├── validation/             # Zod schemas for all data types
│       ├── email/                  # Resend client and email templates
│       ├── auth.ts                 # NextAuth configuration
│       └── ertk-handler.ts         # Centralised request handler (auth, rate limit, validation)
├── prisma/
│   └── schema.prisma               # MongoDB schema (14 models)
└── ertk.config.mjs                 # ERTK code generation configuration
```

---

## Key Features

**Project Management** — Workspaces with role-based access (owner, admin, member, viewer), task boards with categories and due dates, team invitations and join request workflows with inline notification actions.

**Real-Time Social Layer** — Friend system with stateful request lifecycle, direct and group messaging with read tracking, user search and public profiles, 7 notification types delivered instantly via WebSocket with cursor-based pagination.

**Gamification** — Exponential XP curve (base 100, power 1.5, 100 levels), immutable XP event log for auditability, AI-powered XP evaluation where Gemini scores task impact against project goals on a 0–1,000,000 scale.

**AI Workflows** — Gemini-powered task generation (suggest tasks from project goals), task expansion (enrich summaries into detailed descriptions), and XP suggestion (evaluate task difficulty and impact).

**Threaded Comments** — Markdown-rendered with syntax highlighting, nested reply threads, likes, real-time creation/edit/delete synchronisation across clients.

**Registry-Driven Notifications** — The notification registry is the single source of truth for types, Zod schemas, and Ably channel routing. Adding a new notification type is three steps: add to registry, call `sendNotification()`, add a renderer. Renderers can declare inline action buttons (accept/reject) that dispatch mutations and optimistically update the cache.

---

## Game Development Influence

My background in game programming (Advanced Diploma) directly influenced several architectural decisions:

- **XP and leveling** — The progression system uses an exponential curve with precomputed thresholds and binary search for level resolution, the same pattern used in RPG character systems.
- **State machines for relationships** — Friendship status transitions (none → pending → accepted, with cancellation and rejection branches) are modelled as a finite state machine, ensuring invalid transitions are structurally impossible.
- **Event-driven architecture** — The real-time layer follows the publish/subscribe pattern common in game engines, where gameplay events propagate through decoupled systems. In Pointwise, a single user action (e.g., accepting a friend request) publishes events that independently update notifications, friend lists, and UI state across multiple clients.
- **Optimistic simulation** — Games routinely predict outcomes locally before server confirmation (client-side prediction). Pointwise applies this to every social interaction — likes, comments, friend requests — so the UI never waits for the network.

---

## Why I Built This

Pointwise started as a question: *how do you architect a platform where authentication, real-time events, data fetching, caching, and code generation all compose cleanly?*

Most full-stack projects demonstrate CRUD. I wanted to build something that forced me to solve coordination problems — real-time cache consistency across clients, multi-layered security that composes without per-route wiring, a code-generation pipeline that eliminates an entire category of boilerplate while preserving type safety end-to-end.

The result is a system where adding a feature (a new API endpoint, a new notification type, a new real-time event) follows a consistent, minimal-surface-area pattern. The architecture carries its own weight: ERTK generates the plumbing, the notification registry routes events, subscription presets decouple transport from UI, and Zod schemas enforce contracts at every boundary.

Building ERTK as a [standalone npm package](https://npmjs.com/package/ertk) was the natural endpoint — if the abstraction is good enough for one project, it should be extractable.

---

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB instance (local or Atlas)
- Ably API key ([free tier](https://ably.com))

### Setup

```bash
git clone https://github.com/AmberCowled/pointwise.git
cd pointwise
pnpm install
```

Create a `.env` file:

```env
DATABASE_URL="mongodb://localhost:27017/pointwise"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Real-time (required)
ABLY_API_KEY="your-ably-api-key"

# AI features (optional — free key from https://aistudio.google.com/apikey)
GEMINI_API_KEY="your-gemini-api-key"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email — required for password reset
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# File uploads (optional)
UPLOADTHING_TOKEN=""
```

```bash
pnpm prisma generate && pnpm prisma db push
pnpm dev  # Starts Next.js + ERTK codegen in watch mode
```

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server + ERTK codegen watcher |
| `pnpm generate` | Run ERTK codegen once |
| `pnpm build` | Generate + production build |
| `pnpm check` | Biome lint + format check |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm db:push` | Push Prisma schema to database |

---

## Deployment

Configured for Vercel. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ABLY_API_KEY`, and any optional provider keys as environment variables.

**Live at [pointwise.dev](https://pointwise.dev/)**

---

## License

&copy; 2026 Amber Cowled. All rights reserved.
