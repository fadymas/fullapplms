import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useUIStore from '../store/uiStore'
import useAuthStore from '../store/authStore'
import '../styles/Sidebar.css'
import {
  FaHome,
  FaGraduationCap,
  FaBook,
  FaEdit,
  FaUser,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
  FaSignOutAlt,
  FaFileAlt
} from 'react-icons/fa'

function Sidebar({ activePage = 'dashboard' }) {
  const { darkMode, sidebarCollapsed, toggleSidebar } = useUIStore()
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarHeight, setSidebarHeight] = useState('calc(100vh - 76px)')
  const location = useLocation()
  const sidebarRef = useRef(null)

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'الرئيسية', key: 'dashboard' },
    { path: '/my-courses', icon: <FaGraduationCap />, label: 'كورساتي', key: 'my-courses' },
    { path: '/courses', icon: <FaBook />, label: 'جميع الكورسات', key: 'courses' },
    
    { path: '/exams', icon: <FaFileAlt />, label: 'الامتحانات', key: 'exams' },
    { path: '/profile', icon: <FaUser />, label: 'الملف الشخصي', key: 'profile' }
  ]

  useEffect(() => {
    // Dynamic Height Calculation
    const calculateSidebarHeight = () => {
      if (window.innerWidth >= 992 && sidebarRef.current) {
        const footer = document.querySelector('.footer')
        if (footer) {
          const sidebarRect = sidebarRef.current.getBoundingClientRect()
          const footerRect = footer.getBoundingClientRect()
          const distanceToFooter = footerRect.top - sidebarRect.top
          setSidebarHeight(`${Math.max(distanceToFooter - 40, 400)}px`)
        } else {
          setSidebarHeight(`${window.innerHeight - 76}px`)
        }
      }
    }

    calculateSidebarHeight()
    window.addEventListener('resize', calculateSidebarHeight)
    window.addEventListener('scroll', calculateSidebarHeight)

    return () => {
      window.removeEventListener('resize', calculateSidebarHeight)
      window.removeEventListener('scroll', calculateSidebarHeight)
    }
  }, [])

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar shadow-sm d-none d-lg-block ${sidebarCollapsed ? 'collapsed' : ''} ${darkMode ? 'sidebar-dark-mode' : ''} z-3`}
      style={{ height: sidebarHeight }}
      id="sidebar"
    >
      <div className={`sidebar-content ${darkMode ? 'sidebar-dark-content' : ''}`}>
        <div className="pt-4">
          <button
            className={`btn mb-3 d-flex align-items-center justify-content-center toggle-btn ${darkMode ? 'toggle-btn-dark' : ''}`}
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          >
            {sidebarCollapsed ? (
              <span className="toggle-icon-container">
                <FaAngleDoubleLeft className="toggle-icon" />
                <FaAngleDoubleRight className="toggle-icon ms-1" />
              </span>
            ) : (
              <>
                <span className={`toggle-text ${darkMode ? 'text-light' : ''}`}>تصغير القائمة</span>
                <FaAngleDoubleRight
                  className={`toggle-arrow ms-2 ${darkMode ? 'text-light' : ''}`}
                />
              </>
            )}
          </button>

          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item mb-2" key={item.key}>
                <Link
                  to={item.path}
                  title={item.label}
                  className={`nav-link d-flex align-items-center ${location.pathname === item.path ? 'active' : ''} ${darkMode ? 'nav-link-dark' : ''}`}
                >
                  <span className={`icon-wrapper ${darkMode ? 'icon-wrapper-dark' : ''}`}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className={`ms-2 sidebar-label ${darkMode ? 'sidebar-label-dark' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            <li className="nav-item mt-auto mb-2">
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className={`nav-link d-flex align-items-center text-danger border-0 bg-transparent w-100 ${darkMode ? 'nav-link-dark' : ''}`}
                title="تسجيل الخروج"
              >
                <span className={`icon-wrapper ${darkMode ? 'icon-wrapper-dark' : ''}`}>
                  <FaSignOutAlt />
                </span>
                {!sidebarCollapsed && <span className="ms-2 sidebar-label">تسجيل الخروج</span>}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
