# Student System Integration Guide

This document explains the backend API integration and how to maintain/extend the student features.

## Architecture

### 1. API Layer (`src/api/`)
All API calls are centralized here. Direct `axios` calls in components are strictly forbidden.
- `axiosConfig.js`: Configures the base URL from `.env` and handles JWT token injection via interceptors.
- `auth.service.js`: Login, register, logout, and token refresh.
- `student.service.js`: Profile management, dashboard stats, and notifications.
- `course.service.js`: Course listing, details, and enrollments.
- `payment.service.js`: Wallet balance, transactions, and purchases.
- `quiz.service.js`: Quiz attempts and submissions.

### 2. State Management (`src/store/`)
- `authStore.js`: Manages JWT tokens (`accessToken`, `refreshToken`) and safe user information.
- `uiStore.js`: Manages global UI states like Dark Mode and Sidebar status.

### 3. Navigation Guards (`src/components/guards/`)
- `AuthGuard.js`: Protects routes from unauthenticated access.
- `GuestGuard.js`: Prevents authenticated users from seeing Login/Register pages.

## Authentication Flow

1.  **Register**: `RegisterPage.js` -> `authService.register` -> API POST `/api/users/auth/register/`.
2.  **Login**: `LoginPage.js` -> `authService.login` -> API POST `/api/users/auth/login/` -> `authStore.login(user, access, refresh)`.
3.  **Persistance**: The `auth-storage` in LocalStorage keeps the user logged in after a page refresh using Zustand middleware.
4.  **Token Refresh**: (Ready for implementation) `apiClient` interceptor can be extended to call `authService.refreshToken` on 401 errors.

## Adding New Features

### 1. New API Endpoint
1.  Add the method to the corresponding service in `src/api/`.
2.  If it's a new category (e.g., Reports), create `reports.service.js`.

### 2. Consuming in Components
1.  Import the service.
2.  Use `useEffect` to fetch data and store it in React state.
3.  Ensure you use the existing global stores if the data needs to be shared (e.g., updating balance).

## Security Rules
- **DO NOT** commit the `.env` file to production repositories (it's added to `.gitignore`).
- **DO NOT** console.log full API responses or tokens.
- **RESTRICT** route access using the provided Guards in `App.js`.
