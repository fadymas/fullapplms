// src/components/common/Sidebar.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaHome,
  FaUsers,
  FaUserShield,
  FaBook,
  FaFileAlt,
  FaChartBar,
  FaCode,
  FaEdit,
  FaUser,
  FaAngleDoubleRight,
  FaAngleDoubleLeft
} from 'react-icons/fa'
import { FaMoneyBill } from 'react-icons/fa6'

import '../styles/sidebar.css'
import useAuthStore from '../store/authStore'

const Sidebar = ({ collapsed, toggleSidebar, darkMode = false }) => {
  const { user } = useAuthStore()
  const location = useLocation()
  const sidebarRef = useRef(null)
  const contentRef = useRef(null)
  const observerRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const [sidebarHeight, setSidebarHeight] = useState('calc(100vh - 76px)')

  const menuItems = [
    { path: `/${user.role}/dashboard`, icon: <FaHome />, label: 'الرئيسية', key: 'dashboard' },
    { path: `/admin/users`, icon: <FaUsers />, label: 'إدارة المستخدمين', key: 'users' },

    {
      path: `/admin/wallets`,
      icon: <FaMoneyBill />,
      label: 'إدارة المحافظ',
      key: 'wallets'
    },
    {
      path: `/${user.role}/courses`,
      icon: <FaBook />,
      label: 'إدارة الكورسات',
      key: 'courses'
    },
    {
      path: `/${user.role}/sections`,
      icon: <FaBook />,
      label: 'إدارة أجزاء المحاضرات',
      key: 'sections'
    },
    { path: `/${user.role}/exams`, icon: <FaFileAlt />, label: 'الإمتحانات', key: 'exams' },
    // { path: `/admin/reports`, icon: <FaChartBar />, label: 'التقارير', key: 'reports' },
    { path: `/admin/codes`, icon: <FaCode />, label: 'الأكواد', key: 'codes' },
    { path: `/${user.role}/profile`, icon: <FaUser />, label: 'الملف الشخصي', key: 'profile' }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  // دالة لحساب ارتفاع الـ Sidebar ديناميكيًا
  const calculateSidebarHeight = useCallback(() => {
    // فقط على الشاشات الكبيرة (≥ 992px)
    if (window.innerWidth >= 992) {
      const sidebar = sidebarRef.current
      const content = contentRef.current

      if (sidebar && content) {
        const footer = document.querySelector('.footer')

        if (footer) {
          // الحصول على مواضع العناصر
          const sidebarRect = sidebar.getBoundingClientRect()
          const footerRect = footer.getBoundingClientRect()

          // حساب المسافة الفعلية بين أعلى الـ Sidebar وأعلى الـ Footer
          const distanceToFooter = footerRect.top - sidebarRect.top

          // احتفظ بمسافة أمان (40px) فوق الـ Footer
          const safeDistance = distanceToFooter - 40

          // لا تسمح بارتفاع أقل من 400px (لتظهر جميع العناصر)
          const minHeight = 400

          // إذا كان الفوتر تحت الـ Sidebar وكانت المسافة كافية
          if (distanceToFooter > minHeight + 40) {
            // استخدم المسافة الآمنة
            const calculatedHeight = Math.max(safeDistance, minHeight)
            setSidebarHeight(`${calculatedHeight}px`)

            // تمكين التمرير إذا كان المحتوى أكبر من الارتفاع
            if (content.scrollHeight > calculatedHeight) {
              content.style.overflowY = 'auto'
            } else {
              content.style.overflowY = 'hidden'
            }
          } else {
            // إذا كان الفوتر قريب جدًا، استخدم الارتفاع الثابت
            const standardHeight = window.innerHeight - 76
            setSidebarHeight(`${standardHeight}px`)
            content.style.overflowY = 'auto'
          }
        } else {
          // إذا لم يكن هناك Footer، استخدم الارتفاع الكامل
          const standardHeight = window.innerHeight - 76
          setSidebarHeight(`${standardHeight}px`)
          content.style.overflowY = 'auto'
        }
      }
    }
  }, [])

  // تأثير لمراقبة التغيرات وإعادة حساب الارتفاع
  useEffect(() => {
    let timeoutId

    const debouncedCalculate = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(calculateSidebarHeight, 100)
    }

    // حساب أولي
    const initialTimer = setTimeout(calculateSidebarHeight, 300)

    // مراقبة تغيير حجم النافذة
    window.addEventListener('resize', debouncedCalculate)

    // مراقبة تغييرات الـ DOM باستخدام MutationObserver
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // إذا تمت إضافة أو إزالة عناصر Footer
          const hasFooterChange =
            Array.from(mutation.addedNodes).some(
              (node) =>
                node.nodeType === 1 &&
                (node.classList?.contains('footer') || node.querySelector?.('.footer'))
            ) ||
            Array.from(mutation.removedNodes).some(
              (node) =>
                node.nodeType === 1 &&
                (node.classList?.contains('footer') || node.querySelector?.('.footer'))
            )

          if (hasFooterChange) {
            debouncedCalculate()
          }
        }
      }
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    // استخدام ResizeObserver لمراقبة تغيرات حجم العناصر
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => {
        debouncedCalculate()
      })

      // مراقبة الـ Footer إذا كان موجودًا
      const footer = document.querySelector('.footer')
      if (footer) {
        resizeObserverRef.current.observe(footer)
      }
    }

    // استخدام IntersectionObserver للكشف عن الفوتر
    if (typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // عندما يظهر الفوتر في الشاشة، أعد حساب ارتفاع الـ Sidebar
              debouncedCalculate()
            }
          })
        },
        {
          root: null,
          threshold: 0.1
        }
      )

      // مراقبة الفوتر
      const footer = document.querySelector('.footer')
      if (footer) {
        observerRef.current.observe(footer)
      }
    }

    // تنظيف
    return () => {
      clearTimeout(initialTimer)
      clearTimeout(timeoutId)
      window.removeEventListener('resize', debouncedCalculate)
      if (mutationObserver) mutationObserver.disconnect()
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect()
      if (observerRef.current) observerRef.current.disconnect()
      // تنظيف الأنماط
      if (contentRef.current) {
        contentRef.current.style.overflowY = ''
      }
    }
  }, [calculateSidebarHeight, collapsed])

  // تأثير إضافي عند تغيير حالة collapsed أو المسار
  useEffect(() => {
    const timer = setTimeout(calculateSidebarHeight, 150)
    return () => clearTimeout(timer)
  }, [collapsed, location.pathname, calculateSidebarHeight])

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar shadow-sm d-none d-lg-block ${collapsed ? 'collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
      style={{ height: sidebarHeight }}
    >
      <div ref={contentRef} className="sidebar-content">
        {/* Toggle Button */}
        <button
          id="toggleSidebar"
          className="btn mb-3 d-flex align-items-center justify-content-center toggle-btn"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <>
              <span className="toggle-icon-container">
                <FaAngleDoubleLeft className="toggle-icon" />
                <FaAngleDoubleRight className="toggle-icon ms-1" />
              </span>
            </>
          ) : (
            <>
              <span className="toggle-text">تصغير القائمة</span>
              <FaAngleDoubleRight className="toggle-arrow ms-2" />
            </>
          )}
        </button>

        <ul className="nav flex-column">
          {menuItems.map((item) =>
            item.path.includes(user.role) ? (
              <li key={item.path} className="nav-item mb-2">
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center ${isActive(item.path) ? 'active' : 'text-dark'}`}
                  title={collapsed ? item.label : ''}
                >
                  <span className="icon-wrapper">{item.icon}</span>
                  {!collapsed && <span className="ms-2">{item.label}</span>}
                </Link>
              </li>
            ) : (
              ''
            )
          )}
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
