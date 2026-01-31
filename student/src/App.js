import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CourseDetailsPage from './pages/CourseDetailsPage'
import CoursesPage from './pages/CoursesPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import FawryPage from './pages/FawryPage'
import MyCoursesPage from './pages/MyCoursesPage'
import RequestsCoursesPage from './pages/requests-courses'
import CoursePlayerPage from './pages/CoursePlayerPage'

// Guards
import AuthGuard from './components/guards/AuthGuard'
import GuestGuard from './components/guards/GuestGuard'

// Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import ExamsPage from './pages/ExamsPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import useAuthStore from './store/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <HomePage />} />

        <Route
          path="/courses"
          element={
            <AuthGuard>
              <CoursesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/course/:id"
          element={
            <AuthGuard>
              <CourseDetailsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/course-details"
          element={
            <AuthGuard>
              <CourseDetailsPage />
            </AuthGuard>
          }
        />

        <Route
          path="/exams"
          element={
            <AuthGuard>
              <ExamsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/quizzes/attempt/:attemptId"
          element={
            <AuthGuard>
              <QuizAttemptPage />
            </AuthGuard>
          }
        />

        {/* Guest Only Routes */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/register"
          element={
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/my-courses"
          element={
            <AuthGuard>
              <MyCoursesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/fawry"
          element={
            <AuthGuard>
              <FawryPage />
            </AuthGuard>
          }
        />

        <Route
          path="/exams/quiz/:id"
          element={
            <AuthGuard>
              <QuizAttemptPage />
            </AuthGuard>
          }
        />
        <Route
          path="/course/:id/player"
          element={
            <AuthGuard>
              <CoursePlayerPage />
            </AuthGuard>
          }
        />
        <Route
          path="/course/:id/lecture/:lectureId"
          element={
            <AuthGuard>
              <CoursePlayerPage />
            </AuthGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={isAuthenticated ? <DashboardPage /> : <HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
