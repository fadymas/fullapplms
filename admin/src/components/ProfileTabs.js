// src/components/ProfileTabs.jsx
import React, { useState } from 'react'

const ProfileTabs = ({ darkMode, userProfile, setUserProfile }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const renderOverviewTab = () => (
    <div className="tab-content-wrapper">
      <div className="row g-4">
        {/* Profile Information Card */}
        <div className="col-12">
          <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
            <div className="card-header bg-transparent border-0 pt-4 pb-3">
              <h5 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>Profile Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Email Address
                  </label>
                  <p className="mb-0">{userProfile?.email || 'N/A'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Role
                  </label>
                  <p className="mb-0">
                    <span
                      className={`badge ${userProfile?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}
                    >
                      {userProfile?.role?.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    First Name
                  </label>
                  <p className="mb-0">{userProfile?.first_name || 'Not provided'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Last Name
                  </label>
                  <p className="mb-0">{userProfile?.last_name || 'Not provided'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Phone Number
                  </label>
                  <p className="mb-0">{userProfile?.phone || 'Not provided'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Account Status
                  </label>
                  <p className="mb-0">
                    <span
                      className={`badge ${userProfile?.is_active ? 'bg-success' : 'bg-danger'}`}
                    >
                      {userProfile?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="col-12">
          <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
            <div className="card-header bg-transparent border-0 pt-4 pb-3">
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>Account Details
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Email Verification
                  </label>
                  <p className="mb-0">
                    <span
                      className={`badge ${userProfile?.email_verified ? 'bg-success' : 'bg-warning text-dark'}`}
                    >
                      {userProfile?.email_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Profile Type
                  </label>
                  <p className="mb-0">{userProfile?.profile?.type || 'N/A'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Date Joined
                  </label>
                  <p className="mb-0">
                    {userProfile?.date_joined
                      ? new Date(userProfile.date_joined).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label
                    className={`form-label small fw-semibold ${darkMode ? 'text-light' : 'text-muted'}`}
                  >
                    Last Login
                  </label>
                  <p className="mb-0">
                    {userProfile?.last_login
                      ? new Date(userProfile.last_login).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Status Alert */}
        {userProfile?.profile && !userProfile.profile.exists && (
          <div className="col-12">
            <div
              className={`alert alert-info d-flex align-items-start ${darkMode ? 'alert-dark' : ''}`}
              role="alert"
            >
              <i className="bi bi-info-circle-fill me-3 fs-5"></i>
              <div>
                <strong>Profile Setup Required:</strong>
                <p className="mb-0 mt-1">{userProfile.profile.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="tab-content-wrapper">
      <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
        <div className="card-header bg-transparent border-0 pt-4 pb-3">
          <h5 className="mb-0">
            <i className="bi bi-gear me-2"></i>Account Settings
          </h5>
        </div>
        <div className="card-body">
          <form>
            <div className="mb-4">
              <label htmlFor="firstName" className="form-label fw-semibold">
                First Name
              </label>
              <input
                type="text"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="firstName"
                defaultValue={userProfile?.first_name || ''}
                placeholder="Enter first name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="form-label fw-semibold">
                Last Name
              </label>
              <input
                type="text"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="lastName"
                defaultValue={userProfile?.last_name || ''}
                placeholder="Enter last name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="form-label fw-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="phone"
                defaultValue={userProfile?.phone || ''}
                placeholder="Enter phone number"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="email"
                defaultValue={userProfile?.email || ''}
                disabled
              />
              <small className={`form-text ${darkMode ? 'text-light' : 'text-muted'}`}>
                Email cannot be changed
              </small>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>Save Changes
              </button>
              <button type="button" className="btn btn-outline-secondary">
                <i className="bi bi-x-circle me-2"></i>Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="tab-content-wrapper">
      <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
        <div className="card-header bg-transparent border-0 pt-4 pb-3">
          <h5 className="mb-0">
            <i className="bi bi-shield-lock me-2"></i>Security Settings
          </h5>
        </div>
        <div className="card-body">
          <form>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="form-label fw-semibold">
                Current Password
              </label>
              <input
                type="password"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="currentPassword"
                placeholder="Enter current password"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="form-label fw-semibold">
                New Password
              </label>
              <input
                type="password"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="newPassword"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label fw-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                id="confirmPassword"
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-shield-check me-2"></i>Update Password
            </button>
          </form>

          <hr className={`my-4 ${darkMode ? 'border-secondary' : ''}`} />

          {/* Email Verification Section */}
          {!userProfile?.email_verified && (
            <div className={`alert alert-warning ${darkMode ? 'alert-dark' : ''}`} role="alert">
              <h6 className="alert-heading d-flex align-items-center mb-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Email Not Verified
              </h6>
              <p className="mb-2 small">
                Your email address has not been verified yet. Please verify your email to access all
                features.
              </p>
              <button className="btn btn-sm btn-warning">
                <i className="bi bi-envelope me-2"></i>Send Verification Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="profile-tabs">
      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            type="button"
          >
            <i className="bi bi-person me-2"></i>Overview
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            type="button"
          >
            <i className="bi bi-gear me-2"></i>Settings
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            type="button"
          >
            <i className="bi bi-shield-lock me-2"></i>Security
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'security' && renderSecurityTab()}
      </div>
    </div>
  )
}

export default ProfileTabs
