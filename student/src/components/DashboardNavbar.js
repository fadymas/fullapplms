import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Stores
import useUIStore from '../store/uiStore';
import useAuthStore from '../store/authStore';

// Assets
import '../styles/DashboardNavbar.css';
import logo from '../images/logo.png';

// Icons
import {
  FaSun,
  FaMoon,
  FaHome,
  FaGraduationCap,
  FaBook,
  FaEdit,
  FaWallet,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaFileAlt
} from 'react-icons/fa';

import studentService from '../api/student.service';
import paymentService from '../api/payment.service';

function DashboardNavbar() {
  const { darkMode, toggleDarkMode } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [balance, setBalance] = useState('0');

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'الرئيسية', key: 'dashboard' },
    { path: '/my-courses', icon: <FaGraduationCap />, label: 'كورساتي', key: 'my-courses' },
    { path: '/courses', icon: <FaBook />, label: 'جميع الكورسات', key: 'courses' },
    { path: '/exams', icon: <FaFileAlt />, label: 'الامتحانات', key: 'exams' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const [notifData, walletData] = await Promise.all([
          studentService.getNotifications({ is_read: false }),
          paymentService.getMyWallet()
        ]);
        setNotifications(notifData.results.map(n => ({ id: n.id, text: n.title || n.message })));
        setBalance(walletData.balance);
      } catch (err) {
        console.error('Navbar data fetch failed', err);
      }
    };

    if (user) fetchNavbarData();

    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  return (
    <>
      <nav className={`navbar navbar-expand-lg shadow-sm fixed-top dashboard-navbar ${darkMode ? 'navbar-dark-mode' : ''}`}>
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
            <img src={logo} className="navbar-img" alt="شعار المنصة" />
          </Link>

          <div className="d-lg-none d-flex align-items-center me-3 mobile-theme-switch">
            <div className="theme-switch">
              <input
                type="checkbox"
                id="darkModeToggleMobile"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <label htmlFor="darkModeToggleMobile" className="switch-label">
                <span className="icon sun"><FaSun /></span>
                <span className="icon moon"><FaMoon /></span>
              </label>
            </div>
          </div>

          <button
            className="navbar-toggler ms-3 mobile-menu-btn d-lg-none"
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <FaBars style={{ color: 'white', fontSize: '1.8rem' }} />
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="d-lg-flex d-none align-items-center dark-mode-container me-3">
              <div className="theme-switch">
                <input
                  type="checkbox"
                  id="darkModeToggleDesktop"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <label htmlFor="darkModeToggleDesktop" className="switch-label">
                  <span className="icon sun"><FaSun /></span>
                  <span className="icon moon"><FaMoon /></span>
                </label>
              </div>
            </div>

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-2 align-items-lg-center align-items-start">
              <div className="d-lg-flex d-none align-items-center gap-3">
                <Link to="/profile" className="text-decoration-none">
                  <div className="custom-badge d-flex align-items-center">
                    <span className="ms-2">{`${balance} جنية`}</span>
                    <div className="icon-circle">
                      <FaWallet style={{ color: '#08345B', fontSize: '1.4rem' }} />
                    </div>
                  </div>
                </Link>

           

                <li className="nav-item dropdown" ref={profileRef}>
                  <button
                    className="nav-link d-flex align-items-center btn p-0 border-0 bg-transparent"
                    onClick={() => {
                      setShowProfile(!showProfile);
                      setShowNotifications(false);
                    }}
                  >
                    <FaUserCircle style={{ fontSize: '1.8rem', color: 'white' }} />
                  </button>

                  {showProfile && (
                    <div className="dropdown-menu dropdown-menu-end show custom-dropdown">
                      <Link to="/profile" className="dropdown-item d-flex align-items-center" onClick={() => setShowProfile(false)}>
                        <FaUser style={{ marginLeft: '8px' }} /> الملف الشخصي
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item d-flex align-items-center text-danger" onClick={handleLogout}>
                        <FaSignOutAlt style={{ marginLeft: '8px' }} /> تسجيل الخروج
                      </button>
                    </div>
                  )}
                </li>
              </div>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Offcanvas */}
      <div className={`mobile-menu-offcanvas ${showMobileMenu ? 'show' : ''} ${darkMode ? 'dark-mode' : ''}`}>
        <div className="offcanvas-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="text-white mb-0">القائمة</h5>
            <button className="btn-close btn-close-white" onClick={() => setShowMobileMenu(false)} />
          </div>
        </div>

        <div className="offcanvas-body p-0">
          <div className="mobile-wallet-section p-3 border-bottom border-secondary">
            <div className="custom-badge d-flex align-items-center w-100">
              <span className="ms-2">{`${balance} جنية`}</span>
              <div className="icon-circle">
                <FaWallet style={{ color: '#08345B', fontSize: '1.4rem' }} />
              </div>
            </div>
          </div>

          <div className="mobile-menu-items p-3">
            <div className="mb-4">
              <h6 className="text-white mb-3">الصفحات</h6>
              <div className="mobile-menu-links">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`d-flex align-items-center p-2 text-decoration-none mb-1 mobile-menu-link ${window.location.pathname === item.path ? 'active-mobile-link' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="me-2 mobile-menu-icon">{item.icon}</span>
                    <span className="text-white">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mobile-profile-section">
              <div className="d-flex align-items-center mb-3">
                <FaUserCircle style={{ fontSize: '1.5rem', color: 'white', marginLeft: '8px' }} />
                <span className="text-white">الملف الشخصي</span>
              </div>
              <div className="mobile-profile-links">
                <Link to="/profile" className="d-block text-white p-2 text-decoration-none hover-mobile-item" onClick={() => setShowMobileMenu(false)}>
                  الملف الشخصي
                </Link>
                <button className="d-block text-danger p-2 text-decoration-none hover-mobile-item bg-transparent border-0 w-100 text-end" onClick={handleLogout}>
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardNavbar;