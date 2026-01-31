// src/components/ProfileSidebar.jsx
import React from 'react'

const ProfileSidebar = ({ darkMode, userProfile }) => {
  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    }
    return userProfile?.email?.slice(0, 2).toUpperCase() || 'U'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
      <div className="card-body text-center p-4">
        {/* Profile Avatar */}
        <div className="mb-4">
          <div
            className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            {getInitials()}
          </div>
        </div>

        {/* User Name */}
        <h4 className="mb-1">
          {userProfile?.full_name ||
            (userProfile?.first_name && userProfile?.last_name
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : 'User Profile')}
        </h4>

        {/* Email */}
        <p className={`mb-3 ${darkMode ? 'text-light' : 'text-muted'}`}>
          <i className="bi bi-envelope me-2"></i>
          {userProfile?.email || 'N/A'}
        </p>

        {/* Role Badge */}
        <div className="mb-4">
          <span
            className={`badge ${userProfile?.role === 'admin' ? 'bg-danger' : 'bg-primary'} px-3 py-2`}
          >
            <i className="bi bi-person-badge me-1"></i>
            {userProfile?.role?.toUpperCase() || 'USER'}
          </span>
        </div>

        {/* Divider */}
        <hr className={darkMode ? 'border-secondary' : ''} />

        {/* User Info */}
        <div className="text-start">
          <div className="mb-3">
            <small className={`d-block mb-1 ${darkMode ? 'text-light' : 'text-muted'}`}>
              <i className="bi bi-telephone me-2"></i>Phone
            </small>
            <span>{userProfile?.phone || 'Not provided'}</span>
          </div>

          <div className="mb-3">
            <small className={`d-block mb-1 ${darkMode ? 'text-light' : 'text-muted'}`}>
              <i className="bi bi-shield-check me-2"></i>Account Status
            </small>
            <span className={`badge ${userProfile?.is_active ? 'bg-success' : 'bg-danger'}`}>
              {userProfile?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mb-3">
            <small className={`d-block mb-1 ${darkMode ? 'text-light' : 'text-muted'}`}>
              <i className="bi bi-envelope-check me-2"></i>Email Status
            </small>
            <span
              className={`badge ${userProfile?.email_verified ? 'bg-success' : 'bg-warning text-dark'}`}
            >
              {userProfile?.email_verified ? 'Verified' : 'Not Verified'}
            </span>
          </div>

          <div className="mb-3">
            <small className={`d-block mb-1 ${darkMode ? 'text-light' : 'text-muted'}`}>
              <i className="bi bi-calendar-check me-2"></i>Member Since
            </small>
            <span className="small">{formatDate(userProfile?.date_joined)}</span>
          </div>

          <div className="mb-3">
            <small className={`d-block mb-1 ${darkMode ? 'text-light' : 'text-muted'}`}>
              <i className="bi bi-clock-history me-2"></i>Last Login
            </small>
            <span className="small">{formatDate(userProfile?.last_login)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 d-grid gap-2">
          <button className="btn btn-primary">
            <i className="bi bi-pencil me-2"></i>Edit Profile
          </button>
          {!userProfile?.email_verified && (
            <button className="btn btn-outline-warning">
              <i className="bi bi-envelope me-2"></i>Verify Email
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileSidebar
