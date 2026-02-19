# Pointwise

> A gamified productivity platform built with Next.js, React, and TypeScript. Manage projects, collaborate with teams, chat in real time, and earn XP for completing tasks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://pointwise-sepia.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## Live Demo

**Try it now:** [https://pointwise-sepia.vercel.app/](https://pointwise-sepia.vercel.app/)

## Features

### Project Management

- **Create & Organize Projects** - Projects with descriptions, goals, and visibility settings (Public/Private)
- **Team Collaboration** - Role-based access control (Admin, User, Viewer) with granular permissions
- **Project Invites** - Admins can invite users with specific roles; invitees accept/reject inline from notifications
- **Join Requests** - Public projects allow users to request access; admins approve/reject with role selection from notifications
- **Leave Projects** - Users can leave projects (with validation to prevent orphaned projects)

### Task Management

- **Create & Organize Tasks** - Tasks with descriptions, categories, and due dates
- **Task Status Tracking** - Track tasks as pending or completed
- **Date & Time Management** - Start dates, due dates, and optional times
- **Task Filtering** - Filter by project, status, and date ranges
- **Task Likes** - Like tasks to show appreciation
- **AI XP Suggestions** - Choose "AI Suggested" or "Manual" when creating/editing tasks; Google Gemini evaluates task impact against the project goal and suggests XP

### Task Comments

- **Threaded Discussions** - Comment on tasks with nested reply threads
- **Edit & Delete** - Modify or remove your own comments and replies
- **Comment Likes** - Like comments to surface useful discussion
- **Real-Time Updates** - Comments, edits, and deletions sync instantly via Ably

### Friends & Social

- **Friend Requests** - Send, accept, decline, and cancel friend requests
- **Friend List** - View and manage your friends
- **Friendship Status** - See relationship status on user cards throughout the app
- **Real-Time Sync** - Friend request events update across browsers instantly

### Messaging

- **Direct Messages** - 1-on-1 conversations with friends
- **Group Conversations** - Add multiple users to conversations
- **Real-Time Chat** - Messages delivered instantly via Ably WebSockets
- **Read Tracking** - Unread message counts and per-conversation read state
- **Conversation Management** - Archive, leave, and update conversations

### Notification System

- **Registry-Driven Architecture** - Adding a new notification type requires only 3 steps
- **7 Notification Types** - Friend requests, messages, project invites, join requests, and more
- **Inline Action Buttons** - Accept/reject invites and approve/reject join requests directly from notifications
- **Real-Time Delivery** - Notifications arrive instantly via Ably and are optimistically inserted into the UI
- **Scoped Read Tracking** - Opening the notification bell doesn't mark message notifications as read
- **Cursor-Based Pagination** - Efficient loading for users with many notifications

### Gamification

- **XP System** - Earn experience points for completing tasks
- **Level Progression** - Level up as you accumulate XP
- **Progress Tracking** - Visual XP bar in the navbar

### User Experience

- **Dark Theme** - Modern dark UI with gradient accents and role-based color coding
- **Responsive Design** - Works on desktop and mobile
- **Search** - Search for public projects and users
- **Authentication** - Sign in with email/password, Google, or GitHub OAuth
- **Custom UI Components** - Comprehensive component library (buttons, cards, modals, menus, tabs, inputs, and more)

## Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features and hooks
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Headless UI** - Accessible component primitives
- **Redux Toolkit Query** - Data fetching, caching, and tag-based cache invalidation
- **Ably** - Real-time WebSocket subscriptions for notifications, messages, comments, and friend events

### Backend

- **Next.js API Routes** - 61 serverless API endpoints
- **[ERTK](https://npmjs.com/package/ertk)** - Code generation for RTK Query endpoints; defines endpoint, route handler, query, and cache tags in a single file
- **Prisma** - Type-safe database ORM
- **MongoDB** - NoSQL database
- **NextAuth.js** - Authentication with credentials and OAuth
- **Zod** - Schema validation for all request/notification payloads
- **Ably (server)** - REST client for publishing real-time events
- **Google Gemini** - LLM API for AI XP suggestions

### Development Tools

- **Biome** - Fast linter and formatter
- **ERTK Codegen** - Auto-generates RTK Query API slice, Redux store, and cache invalidation helpers from endpoint definitions
- **simple-git-hooks** - Pre-commit hooks for codegen and lint

## Project Structure

```
pointwise/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # Auto-generated route handlers (via ERTK)
│   │   ├── components/             # Shared React components
│   │   │   ├── auth/               # Auth forms (signin, signup)
│   │   │   ├── providers/          # Context providers (Session, Redux, Ably)
│   │   │   └── ui/                 # Reusable UI library (Button, Card, Modal, Menu, etc.)
│   │   └── dashboard/              # Dashboard pages and features
│   │       ├── [id]/               # Individual project page
│   │       ├── navbar/             # Navbar, NotificationMenu, MessagesMenu, FriendRequestsMenu
│   │       ├── modals/             # All modal dialogs (project, task, invite, message, join request)
│   │       ├── projectCard/        # Project card components
│   │       ├── taskCard/           # Task card with comments, likes, status
│   │       │   └── comments/       # Comment list, input, replies, likes
│   │       ├── search/             # Project and user search
│   │       └── userCard/           # User profile cards with friend actions
│   ├── endpoints/                  # ERTK endpoint definitions (single source of truth)
│   │   ├── conversations/          # Messaging endpoints
│   │   ├── friends/                # Friend system endpoints
│   │   ├── invites/                # Invite accept/reject endpoints
│   │   ├── notifications/          # Notification list, dismiss, delete endpoints
│   │   ├── projects/               # Project CRUD, invite, join request endpoints
│   │   ├── tasks/                  # Task CRUD, likes, comments endpoints
│   │   └── user/                   # User profile and XP endpoints
│   ├── generated/                  # Auto-generated by ERTK codegen
│   │   ├── api.ts                  # RTK Query API slice (61 endpoints)
│   │   ├── store.ts                # Redux store configuration
│   │   └── invalidation.ts         # Cache invalidation helpers
│   └── lib/                        # Shared libraries
│       ├── ably/                   # Ably client (browser) and server (REST) setup
│       ├── api/                    # Service functions (projects, tasks, friends, messages, etc.)
│       ├── notifications/          # Notification registry, renderers, and send service
│       ├── realtime/               # Real-time layer: channels, events, subscription hooks
│       │   └── hooks/              # useSubscribeConversation, FriendUpdates, ProjectUpdates, etc.
│       ├── redux/                  # Redux hooks
│       └── validation/             # Zod schemas for all data types
├── prisma/
│   └── schema.prisma               # Database schema (MongoDB)
├── docs/                           # Documentation
│   └── notification-system.md      # Notification system developer guide
└── scripts/
    └── create-text-index.mjs       # MongoDB text index creation
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database (local or cloud)
- Ably API key (free tier available at [ably.com](https://ably.com))
- Google/GitHub OAuth credentials (optional, for social auth)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AmberCowled/pointwise.git
   cd pointwise
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="mongodb://localhost:27017/pointwise"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Real-time features (free key from https://ably.com)
   ABLY_API_KEY="your-ably-api-key"

   # AI features (free key from https://aistudio.google.com/apikey)
   GEMINI_API_KEY="your-gemini-api-key"

   # Optional: OAuth providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Set up the database**

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

   This starts both the Next.js dev server and ERTK codegen in watch mode.

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm dev` - Start dev server + ERTK codegen watcher
- `pnpm generate` - Run ERTK codegen once
- `pnpm build` - Generate + build for production
- `pnpm start` - Start production server
- `pnpm check` - Run Biome check (lint + format)
- `pnpm check:fix` - Run Biome check and auto-fix
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm audit` - Run security audit (high severity)
- `pnpm db:push` - Push Prisma schema changes to database
- `pnpm db:create-text-index` - Create MongoDB text indexes for search

## Architecture Highlights

- **ERTK Codegen** - Each endpoint is defined once in `src/endpoints/` with its handler, query, request schema, and cache tags. ERTK generates the RTK Query API slice, route handlers, Redux store, and invalidation helpers automatically.
- **Registry-Driven Notifications** - The notification registry is the single source of truth for types, Zod schemas, and Ably channel routing. Adding a new notification type is 3 steps: add to registry, call `sendNotification()`, add a renderer.
- **Declarative Action Buttons** - Notification renderers can define `getActions()` to render inline Accept/Reject buttons. The UI handles mutation dispatch, optimistic removal, and cache invalidation automatically.
- **Real-Time Layer** - Ably channels are organized per user (`user:{id}:friend-requests`, `user:{id}:messages`, `user:{id}:projects`) and per entity (`conversation:{id}`, `task:{id}:comments`). Subscription hooks handle connect/disconnect lifecycle.
- **Optimistic Updates** - Real-time events are inserted directly into RTK Query cache before server confirmation. Lightweight Ably events (not tied to notifications) handle cross-user cache invalidation for actions like rejections.
- **Type Safety End-to-End** - Prisma-generated types, Zod validation on all inputs and notification payloads, TypeScript strict mode, and generated RTK Query types.
- **Role-Based Access Control** - Admin, User, and Viewer roles with permission checks in service functions and UI components.

## Deployment

The project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `ABLY_API_KEY`, `GEMINI_API_KEY`, and OAuth credentials (optional)
4. Deploy

The live demo is hosted at: [https://pointwise-sepia.vercel.app/](https://pointwise-sepia.vercel.app/)

## License

© 2026 Amber Cowled. All rights reserved.

---

**Made with Next.js, React, and TypeScript**
