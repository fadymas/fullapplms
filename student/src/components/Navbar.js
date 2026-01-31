import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import InstructionsModal from './Modal'
import logo from '../images/logo.png'
import useAuthStore from '../store/authStore'
import '../styles/Navbar.css'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [showInstructions, setShowInstructions] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const navbarRef = useRef(null)

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsCollapsed(false)
      } else {
        setIsCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRegisterClick = (e) => {
    e.preventDefault()
    setShowInstructions(true)
    setIsCollapsed(true)
  }

  const handleCloseInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('hasSeenInstructions', 'true')
  }

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target) && !isCollapsed) {
        setIsCollapsed(true)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCollapsed])

  return (
    <>
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm fixed-top" ref={navbarRef}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img src={logo} className="navbar-img" alt="شعار مستر محمد غانم" />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleNavbar}
            aria-controls="navbarSupportedContent"
            aria-expanded={!isCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`navbar-collapse-custom ${!isCollapsed ? 'show' : ''}`}
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3 pt-3 pt-lg-0">
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link className="btn btn-login" to="/dashboard">
                      لوحة التحكم
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-register" onClick={() => logout()}>
                      تسجيل الخروج
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link
                      className="btn btn-login"
                      to="/login"
                      onClick={() => setIsCollapsed(true)}
                    >
                      تسجيل الدخول
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-register" onClick={handleRegisterClick}>
                      إنشاء حساب
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <InstructionsModal show={showInstructions} onClose={handleCloseInstructions} />
    </>
  )
}

export default Navbar
