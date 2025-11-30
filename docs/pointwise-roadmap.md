# Pointwise Project Roadmap

**Current Status:** Phase 1 Complete | Phase 2 In Progress  
**Last Updated:** December 2024

---

## ✅ Phase 1: UI Component Foundation (COMPLETE)

All foundation UI components implemented and ready for use:

- ✅ **Notification/Toast Component** - Complete
- ✅ **LoadingSpinner/Skeleton Component** - Complete
- ✅ **Modal Component Refactoring** - Complete with all improvements
- ✅ **Pagination Component** - Complete with dynamic responsive design
- ✅ **InputSelect Component** - Complete with portal/anchor positioning

---

## 🚧 Phase 2: Component Refactoring (IN PROGRESS)

### 2.1 Authentication System ✅ COMPLETE

**Completed:**

- ✅ Replaced all raw inputs with `Input`/`InputArea`/`Checkbox` components
- ✅ Integrated `Notification` for error display
- ✅ Added form state management, password visibility toggle, strength indicator
- ✅ Real-time validation, loading states, form persistence
- ✅ Replaced `AuthCard`/`AuthTabs` with generic `Card`/`Tabs` components

**Deferred:**

- ⏸️ "Forgot Password" functionality (requires backend work)

### 2.2 Task Modals ✅ COMPLETE

**TaskCreateModal:**

- ✅ Replaced all deprecated components with new UI components
- ✅ Added character count indicators
- ✅ Integrated `useNotifications` hook

**TaskManageModal:**

- ✅ Replaced `GradientButton` with `Button` component
- ✅ Maintained all existing functionality

### 2.3 TaskBoard Improvements 🚧 IN PROGRESS

**Status:** Planning phase

**Planned Improvements:**

1. **Date Navigation Enhancements:**
   - Calendar picker component (using library like `react-day-picker`)
   - Day/Week/Month view toggle (similar to Analytics range selector)
   - Keyboard shortcuts for date navigation (arrow keys, T for today)
   - Default to Day view

2. **Loading State:**
   - Add spinner to "Loading schedule…" state
   - Use existing `Spinner` component

3. **Code Quality:**
   - Extract date navigation logic into `useDateNavigation` hook
   - Extract task filtering logic into `useTaskFilters` hook
   - Better TypeScript types for task board operations
   - Extract `TaskBoardEmptyState` and `TaskBoardLoadingState` components

**Implementation Order:**

1. Loading state (quick win)
2. Code quality refactoring (foundation)
3. Date navigation improvements (larger feature)

### 2.4 Deprecated Components ✅ REMOVED

- ✅ Removed `FormField` component
- ✅ Removed `FormSelect` component
- ✅ Removed `GradientButton` component

---

## 📋 Phase 3: API Infrastructure (FUTURE)

### 3.1 Centralized API Client ⭐ HIGH PRIORITY

**Status:** Not started

**Current Issues:**

- Raw `fetch()` calls scattered across components
- Inconsistent error handling
- No request cancellation or retry logic
- Hard to add caching/optimistic updates

**Proposed Structure:**

```
src/lib/api/
  ├── client.ts          # Base API client
  ├── types.ts           # API request/response types
  ├── errors.ts          # Custom error classes
  └── endpoints/
      ├── tasks.ts       # Task-related API calls
      ├── user.ts        # User-related API calls
      └── auth.ts        # Auth-related API calls
```

**Features:**

- Centralized error handling
- Request/response interceptors
- Automatic auth header injection
- Type-safe API calls
- Request cancellation (AbortController)
- Optional retry logic

### 3.2 Custom Hooks for API Operations

**Status:** Not started

**Proposed Hooks:**

- `useTasks` - Task CRUD operations with loading/error states
- `useUserPreferences` - User preference management
- `useTaskCompletion` - Task completion with optimistic updates

**Note:** Consider React Query/SWR after API refactoring (deferred for now)

### 3.3 Error Handling Standardization

**Status:** Needs improvement

**Proposed:**

- Custom error classes (`ApiError`, `ValidationError`, `NetworkError`)
- Standardize error response format
- Automatic error notification via `Notification` component
- Error boundary for unhandled errors

---

## 📄 Phase 4: User Pages (FUTURE)

### 4.1 Profile Page ⭐ MEDIUM PRIORITY

**Status:** Not started

**Planned Features:**

- Avatar/initials, display name, level badge
- Pointwise stats (level, XP, streaks, activity graphs)
- Achievements/milestones (future)
- Profile details (bio, timezone, locale)
- Account summary (read-only)

### 4.2 Settings Page ⭐ MEDIUM PRIORITY

**Status:** Not started

**Planned Features:**

- Account & Security (email, password, OAuth management)
- Appearance (theme, density preferences)
- Notifications (email, browser notifications)
- Productivity Preferences (default XP, due times, recurrence)
- Data Management (export/import - future)
- Danger Zone (delete account, clear data)

---

## 📊 Implementation Priority

### High Priority (Do Next)

1. ✅ **Task Modals Refactoring** - COMPLETE
2. ✅ **Remove Deprecated Components** - COMPLETE
3. 🚧 **TaskBoard Improvements** - IN PROGRESS
   - Loading state improvements
   - Code quality refactoring
   - Date navigation enhancements

### Medium Priority

1. **Centralized API Client** - Foundation for all API calls
2. **Custom Hooks** - React-friendly API usage
3. **Profile Page** - User identity and progress showcase
4. **Settings Page** - User preferences and account management

### Low Priority

1. **Error Handling Standardization** - Improve consistency
2. **React Query/SWR Integration** - After API refactoring
3. **Other component improvements** - As needed

---

## ✅ Success Metrics

- [x] All new UI components have showcase pages
- [x] TaskCreateModal uses new components
- [x] All deprecated components removed
- [ ] All API calls use centralized client
- [ ] Consistent error handling across app
- [ ] All components follow same patterns
- [ ] Reduced code duplication
- [ ] Better TypeScript types throughout
- [ ] Improved accessibility

---

## 📝 Notes

- Keep existing functionality working during refactoring
- Write showcase pages for all new components
- Test thoroughly after each phase
- Backward compatibility not required - focus on clean code and functionality
- Be careful with date/time handling to avoid hydration issues

---

## 🎯 Next Steps

1. **TaskBoard Improvements** - Start with loading state, then code quality, then date navigation
2. **Plan API infrastructure** - Design the centralized client structure
3. **Begin API refactoring** - Start with one endpoint as proof of concept
4. **Profile & Settings Pages** - After core functionality is solid
