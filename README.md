# Pointwise

> A gamified productivity dashboard built with Next.js, React, and TypeScript. Transform your task management into an engaging experience with XP, levels, and team collaboration.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://pointwise-sepia.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## 🚀 Live Demo

**Try it now:** [https://pointwise-sepia.vercel.app/](https://pointwise-sepia.vercel.app/)

## ✨ Features

### Project Management

- **Create & Organize Projects** - Create projects with descriptions, visibility settings (Public/Private)
- **Team Collaboration** - Role-based access control (Admin, User, Viewer) with granular permissions
- **Project Invites** - Admins can invite users to projects with specific roles
- **Join Requests** - Public projects allow users to request access
- **Leave Projects** - Users can leave projects (with validation to prevent orphaned projects)
- **Project Analytics** - Track task completion and team productivity per project

### Task Management

- **Create & Organize Tasks** - Add tasks with descriptions, categories, and due dates
- **Task Status Tracking** - Track tasks as pending or completed
- **Date & Time Management** - Set start dates, due dates, and optional times
- **Task Filtering** - Filter tasks by project, status, and date ranges
- **Recurring Tasks** - Automated daily recurring task generation via cron jobs
- **Task XP Rewards** - Assign experience points to tasks upon completion

### Gamification

- **XP System** - Earn experience points for completing tasks
- **Level Progression** - Level up as you complete more tasks
- **Progress Tracking** - Visual progress bars and XP tracking

### User Experience

- **Modern UI** - Beautiful dark theme with gradient accents and role-based color coding
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Toast Notifications** - Instant feedback with success, error, and info notifications
- **Authentication** - Sign in with email/password, Google, or GitHub OAuth
- **Custom UI Components** - Comprehensive component library with reusable components
- **Modal System** - Advanced modal system for project and task management
- **Search Functionality** - Search for public projects

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features and hooks
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Headless UI** - Accessible component primitives
- **Redux Toolkit Query** - Data fetching and caching
- **React Redux** - State management

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **MongoDB** - NoSQL database
- **NextAuth.js** - Authentication with credentials and OAuth
- **bcrypt** - Secure password hashing
- **Zod** - Schema validation

### Development Tools

- **Biome** - Fast linter and formatter
- **TypeScript** - Static type checking

## 📁 Project Structure

```
pointwise/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/          # Authentication endpoints (NextAuth, signup)
│   │   │   ├── projects/      # Project management endpoints
│   │   │   │   ├── [id]/      # Single project operations (GET, PATCH, DELETE)
│   │   │   │   │   └── join-request/ # Join request endpoints
│   │   │   │   └── public/    # Public project search
│   │   │   ├── tasks/         # Task management endpoints
│   │   │   │   └── [taskId]/  # Single task operations (PATCH, DELETE)
│   │   │   └── user/          # User endpoints (XP management)
│   │   ├── components/         # React components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── general/       # General components (BrandHeader, etc.)
│   │   │   ├── providers/     # Context providers (Session, Notifications)
│   │   │   └── ui/            # Reusable UI components
│   │   │       ├── menu/      # Menu system
│   │   │       ├── modal/     # Modal system
│   │   │       └── ...        # Buttons, Cards, Inputs, etc.
│   │   ├── dashboard/         # Dashboard pages and components
│   │   │   ├── [id]/          # Individual project page
│   │   │   ├── modals/        # Project and task modals
│   │   │   ├── navbar/        # Navigation bar components
│   │   │   ├── projectCard/   # Project card components (refactored)
│   │   │   ├── projectsOverview/ # Projects overview page
│   │   │   ├── search/        # Project search page
│   │   │   ├── taskCard/      # Task card components
│   │   │   └── tasksOverview/ # Tasks overview and filtering
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home/landing page
│   │   └── globals.css        # Global styles
│   ├── lib/                    # Utility libraries
│   │   ├── api/               # API client and helpers
│   │   │   ├── route-handler.ts # Route handler utilities
│   │   │   ├── projects.ts    # Project API functions
│   │   │   ├── tasks.ts       # Task API functions
│   │   │   └── ...           # Other API helpers
│   │   ├── redux/             # Redux store and services
│   │   │   ├── services/      # RTK Query API services
│   │   │   └── store.ts       # Redux store configuration
│   │   ├── validation/        # Zod validation schemas
│   │   ├── auth.ts            # Authentication config
│   │   ├── prisma.ts          # Prisma client instance
│   │   └── categories.ts      # Task categories
│   └── hooks/                  # Custom React hooks
│       ├── useUserId.ts       # User ID hook with auth redirect
│       ├── useSignin.ts       # Sign in hook
│       └── useSignup.ts       # Sign up hook
├── prisma/
│   └── schema.prisma          # Database schema (MongoDB)
├── scripts/
│   └── create-text-index.mjs  # MongoDB text index creation
├── docs/                      # Documentation
│   └── private/               # Private documentation
└── public/                    # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and pnpm (recommended) or npm/yarn
- MongoDB database (local or cloud)
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

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome
- `pnpm check` - Run Biome check (lint + format)
- `pnpm check:fix` - Run Biome check and fix issues
- `pnpm db:push` - Push Prisma schema changes to database
- `pnpm db:create-text-index` - Create MongoDB text indexes for search

## 🎨 UI Component Library

Pointwise includes a comprehensive UI component library:

### Core Components

- **Buttons** - Multiple variants (primary, secondary, ghost, danger), sizes, and states (loading, disabled)
- **Cards** - Flexible container components with title, label, and action support
- **Container & Grid** - Layout components with responsive spacing
- **Input Components** - Input, InputArea, InputSelect with validation support
- **Modals** - Modal system for dialogs and forms
- **Menus** - Dropdown menu system with sections, options, and icons
- **Tabs** - Accessible tab navigation
- **Notifications** - Toast notification system with variants (success, error, info)
- **Spinners & Skeletons** - Loading states for better UX
- **Progress Bars** - Visual progress indicators
- **Tags** - Badge/tag components with variants
- **Date & Time Pickers** - Date and time selection components
- **And more...**

## 🏗️ Architecture Highlights

- **Server Components** - Leveraging Next.js App Router for optimal performance
- **Type Safety** - End-to-end TypeScript with Prisma-generated types and Zod validation
- **Component Composition** - Reusable, composable UI components with clear separation of concerns
- **Redux Toolkit Query** - Efficient data fetching, caching, and automatic cache invalidation
- **Custom Hooks** - Encapsulated business logic (useUserId, useSignin, useSignup)
- **API Routes** - RESTful endpoints with type-safe route handlers and error handling
- **Authentication** - Secure auth with NextAuth.js supporting credentials, Google, and GitHub OAuth
- **Project-Based Architecture** - Tasks organized within projects for better collaboration
- **Role-Based Access Control** - Admin, User, and Viewer roles with granular permissions
- **Invite System** - Project invites with role assignment and join request workflow

## 📚 Documentation

- [WebSocket Implementation Plan](./docs/private/websocket-implementation-plan.md) - Planned real-time features architecture

## 🚢 Deployment

The project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables (DATABASE_URL, NEXTAUTH_SECRET, OAuth credentials)
4. Deploy!

### Vercel Configuration

The live demo is hosted at: [https://pointwise-sepia.vercel.app/](https://pointwise-sepia.vercel.app/)

## 📄 License

© 2025 Amber Cowled. All rights reserved.

## 🙏 Acknowledgments

Built with modern web technologies and best practices. Special thanks to the open-source community for the amazing tools and libraries that made this project possible.

---

**Made with ❤️ using Next.js, React, and TypeScript**
