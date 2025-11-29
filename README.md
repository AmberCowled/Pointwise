# Pointwise

> A gamified productivity dashboard built with Next.js, React, and TypeScript. Transform your task management into an engaging experience with XP, levels, and analytics.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://pointwise-sepia.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## 🚀 Live Demo

**Try it now:** [https://pointwise-sepia.vercel.app/](https://pointwise-sepia.vercel.app/)

## ✨ Features

### Task Management

- **Create & Organize Tasks** - Add tasks with descriptions, categories, and due dates
- **Recurring Tasks** - Set up daily, weekly, or monthly recurring tasks
- **Task Board View** - Visualize tasks by status (upcoming, today, overdue, completed)
- **Task Analytics** - Track completion rates and productivity trends

### Gamification

- **XP System** - Earn experience points for completing tasks
- **Level Progression** - Level up as you complete more tasks
- **Streaks** - Maintain daily productivity streaks
- **Achievements** - Unlock titles and rewards

### User Experience

- **Modern UI** - Beautiful dark theme with gradient accents
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Updates** - Instant feedback with toast notifications
- **Social Authentication** - Sign in with Google or GitHub
- **Custom UI Components** - Reusable component library with 20+ components

### Analytics Dashboard

- **Productivity Metrics** - Track tasks completed, XP earned, and more
- **Visual Charts** - Interactive line charts for trend analysis
- **Date Filtering** - View analytics for specific time periods
- **Summary Cards** - Quick overview of your productivity stats

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features and hooks
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Headless UI** - Accessible component primitives

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **MongoDB** - NoSQL database
- **NextAuth.js** - Authentication with credentials and OAuth
- **bcrypt** - Secure password hashing

### Development Tools

- **Vitest** - Fast unit testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
pointwise/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── components/         # React components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   └── showcase/      # Component showcase pages
│   │   └── dashboard/         # Dashboard pages
│   ├── lib/                    # Utility libraries
│   │   ├── analytics.ts       # Analytics calculations
│   │   ├── auth.ts            # Authentication config
│   │   ├── datetime.ts        # Date/time utilities
│   │   ├── tasks.ts           # Task utilities
│   │   └── validation/       # Validation schemas
│   └── hooks/                  # Custom React hooks
├── prisma/
│   └── schema.prisma          # Database schema
└── docs/                      # Documentation
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
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
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests with Vitest

## 🎨 UI Component Library

Pointwise includes a comprehensive UI component library with showcase pages:

- **Buttons** - Multiple variants and sizes
- **Cards** - Flexible container components
- **Inputs** - Text, textarea, and select inputs
- **Modals** - Full-featured modal system with animations
- **Notifications** - Toast notification system
- **Tabs** - Accessible tab navigation
- **Spinners & Skeletons** - Loading states
- **Progress Bars** - Visual progress indicators
- **And more...**

Visit `/showcase/[component]` routes to see all components in action.

## 🏗️ Architecture Highlights

- **Server Components** - Leveraging Next.js App Router for optimal performance
- **Type Safety** - End-to-end TypeScript with Prisma-generated types
- **Component Composition** - Reusable, composable UI components
- **Custom Hooks** - Encapsulated business logic
- **API Routes** - RESTful endpoints with proper error handling
- **Authentication** - Secure auth with NextAuth.js and session management

## 📚 Documentation

- [Task Validation Rules](./docs/validation.md) - API validation constraints and rules

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

## 🚢 Deployment

The project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy!

The live demo is hosted at: [https://pointwise-sepia.vercel.app/](https://pointwise-sepia.vercel.app/)

## 📄 License

© 2025 Amber Cowled. All rights reserved.

## 🙏 Acknowledgments

Built with modern web technologies and best practices. Special thanks to the open-source community for the amazing tools and libraries that made this project possible.

---

**Made with ❤️ using Next.js, React, and TypeScript**
