import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Roles from './pages/Roles'
import Courses from './pages/Courses'
import Lectures from './pages/Lectures'
import CourseDetails from './pages/CourseDetails'
import ExamList from './pages/ExamList'
import ExamAdd from './pages/ExamAdd'
import Reports from './pages/Reports'
import TeacherProfile from './pages/TeacherProfile'
import TeacherCodes from './pages/TeacherCodes'
import TeacherRequests from './pages/TeacherRequests'
import TeacherNotifications from './pages/TeacherNotifications'
import 'bootstrap/dist/css/bootstrap.rtl.min.css'
import './App.css'
import useAuthStore from './store/authStore'
import SectionsManagement from './pages/Sections'
import LecturesManagement from './pages/Lectures'
import QuizDetail from './pages/ExamDetail'
import QuizList from './pages/ExamList'
import Wallets from './pages/Wallets'
import Purchases from './pages/Purchases'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute requiredRole="admin">
            <Roles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute requiredRole="admin">
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <ProtectedRoute requiredRole="admin">
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lectures"
        element={
          <ProtectedRoute requiredRole="admin">
            <LecturesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sections"
        element={
          <ProtectedRoute requiredRole="admin">
            <SectionsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams"
        element={
          <ProtectedRoute requiredRole="admin">
            <QuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/add"
        element={
          <ProtectedRoute requiredRole="admin">
            <ExamAdd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/:quizId"
        element={
          <ProtectedRoute requiredRole="admin">
            <QuizDetail />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <Reports />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute requiredRole="admin">
            <TeacherProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/codes"
        element={
          <ProtectedRoute requiredRole="admin">
            <TeacherCodes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/wallets"
        element={
          <ProtectedRoute requiredRole="admin">
            <Wallets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/purchases"
        element={
          <ProtectedRoute requiredRole="admin">
            <Purchases />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requiredRole="admin">
            <TeacherNotifications />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses/:id"
        element={
          <ProtectedRoute requiredRole="teacher">
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/lectures"
        element={
          <ProtectedRoute requiredRole="teacher">
            <LecturesManagement />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/teacher/wallets"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Wallets />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/teacher/purchases"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Purchases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/sections"
        element={
          <ProtectedRoute requiredRole="teacher">
            <SectionsManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/exams"
        element={
          <ProtectedRoute requiredRole="teacher">
            <QuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exams/add"
        element={
          <ProtectedRoute requiredRole="teacher">
            <ExamAdd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exams/:quizId"
        element={
          <ProtectedRoute requiredRole="teacher">
            <QuizDetail />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/teacher/reports"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Reports />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/notifications"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherNotifications />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
