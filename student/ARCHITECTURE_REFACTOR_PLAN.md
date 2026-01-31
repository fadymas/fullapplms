# Production# Architecture Refactor Plan - Status: COMPLETED

## Summary of Changes
- **Core Architecture**: Migrated from prop-drilling to **Zustand** for state management.
- **Routing**: Implemented **AuthGuard** and **GuestGuard** for robust route protection.
- **Component Cleanup**:
    - `Navbar.js`: Removed dynamic CSS injection, centralized logic.
    - `DashboardPage.js`: Removed local state duplication.
    - `ProfilePage.js`: Reduced by ~70% size, extracted `BalanceSection` and `mockData`.
    - `Sidebar.js`: Integrated with global UI store.
- **Tech Stack**: Added **Axios** and **Zustand**.
- **Organization**: Created `features/` directory and `constants/` for cleaner data management.

## Completed Tasks
- [x] Phase 1: Architectural Assessment (Status: DONE)
- [x] Phase 2: State Management (Status: DONE)
- [x] Phase 3: Directory Structure (Status: DONE)
- [x] Phase 4: Protected Routes (Status: DONE)
- [x] Phase 5: Prop-Drilling Removal (Status: DONE)
- [x] Phase 6: API Layer (Status: DONE)
- [x] Phase 7: Auth Persistence (Status: DONE)
- [x] Phase 8: Mock Data Extraction (Status: DONE)
- [x] Phase 9: Global Theme Context (Status: DONE)
- [x] Phase 10: Documentation (Status: DONE)

## 🔴 Phase 1: Codebase Audit & Problem List

### 1. Critical Issues (🔴)
- **Lack of Authentication Security**: No real backend integration for Auth. `LoginPage` and `RegisterPage` only log to console or show alerts. No JWT/Token management.
- **No Protected Routes**: All routes are accessible without login. Any user can access `/dashboard` or `/profile` by typing the URL.
- **In-Component Data Mocking**: Large datasets are hardcoded directly inside page components (e.g., `ProfilePage.js`, `CourseDetailsPage.js`), making them extremely difficult to maintain and violating separation of concerns.
- **No API layer**: Components "talk" to nothing. There is no centralized axios/fetch configuration or service layer.

### 2. High Issues (🟠)
- **Monolithic Page Components**: Page files are excessively large (up to 700+ lines), containing UI, business logic, mock data, and local state management.
- **Duplicated Logic**: Dark mode and sidebar state logic are repeated across multiple components instead of using a global store or custom hooks.
- **Anti-patterns in Component Design**: `Navbar.js` dynamically injects raw CSS strings into the DOM via `useEffect`.
- **Prop Drilling**: UI state (like `darkMode`) is passed manually to child components in every page.

### 3. Medium Issues (🟡)
- **Folder Structure**: Lacks specialized directories for `api`, `hooks`, `store`, `constants`, and `types`.
- **Naming Inconsistencies**: Mix of kebab-case and PascalCase in file naming.
- **State Management**: `zustand` is installed but completely unused. Everything relies on `useState` and local state.

### 4. Low Issues (🟢)
- **Fragile Layout Logic**: Sidebar height calculations depend on DOM queries in `useEffect`, which can be unreliable.
- **Environment Safety**: No `.env` configuration.

---

## 🛠 Refactoring Roadmap

### Phase 1: Foundation & Global State (Architecture)
1.  **Restructure Folders**: Introduce `src/api`, `src/store`, `src/hooks`, `src/services`, and `src/constants`.
2.  **Global UI Store (Zustand)**: Centralize `darkMode`, `sidebarCollapsed`, and notification state.
3.  **Global Auth Store (Zustand)**: Implement `user`, `token`, and `isAuthenticated` state with persistence.

### Phase 2: Routing & Protection
1.  **Implement Auth Guards**: Create `PrivateRoute` and `PublicOnlyRoute` wrappers.
2.  **Refactor App.js**: Use the new wrappers to protect sensitive pages.
3.  **Handle Redirects**: Proper logic for "unauthorized" and "refresh" scenarios.

### Phase 3: API & Service Layer
1.  **Axios Configuration**: Standardize base URL, headers, and interceptors for token attachment/refresh.
2.  **Service Extraction**: Move all data fetching logic from components to dedicated services.

### Phase 4: Component Refactoring (Slimming Down)
1.  **Extract Data**: Move mock data to `src/constants` (temporary until backend is ready).
2.  **Decompose Pages**: Break down large pages (like `ProfilePage`) into smaller, focused sub-components.
3.  **Custom Hooks**: Extract shared logic (like form handling, timer, or specific UI interactions).

### Phase 5: Security & Performance
1.  **Sanitization**: Ensure all inputs are properly validated and outputs encoded.
2.  **Lazy Loading**: Implement React.lazy for route components to optimize bundle size.
3.  **Cleanup**: Remove raw CSS injections and unused dependencies.

### Phase 6: Documentation (Final)
1.  Full developer guide for maintaining and extending the app.
