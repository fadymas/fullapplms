// src/pages/TeacherProfilePage.jsx
import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import '../styles/teacher-profile.css'
import { profileService } from '../api/profiles.service'

const TeacherProfilePage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load Dark Mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Fetch user profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await profileService.getUserProfile()
        setUserProfile(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className={`teacher-profile-page ${darkMode ? 'dark-mode' : ''}`}>
      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} darkMode={darkMode} />
      <div
        className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
      >
        <div className="container-fluid py-4">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: '400px' }}
            >
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: '3rem', height: '3rem' }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-4">
                <ProfileSidebar darkMode={darkMode} userProfile={userProfile} />
              </div>
              <div className="col-lg-8">
                <ProfileTabs
                  darkMode={darkMode}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
    </div>
  )
}

export default TeacherProfilePage
