// src/pages/TeacherCodes.jsx
import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import CodesTable from '../components/CodesTable'
import CodePagination from '../components/CodePagination'
import '../styles/teacher-codes.css'
import adminRechargeCodesService from '../api/admin/recharge-codes.service'

const TeacherCodes = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [nextPage, setNextPage] = useState(0)
  const [previousPage, setPreviousPage] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [codes, setCodes] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [codesCount, setCodesCount] = useState(0)
  const [is_used, setIsUsed] = useState('')

  async function getCodes(page, isUsed, created_by = '') {
    try {
      const CODES = await adminRechargeCodesService.getAllCodes(page || 1, isUsed, created_by)
      function getPage(url) {
        const page = new URLSearchParams(url).get('page')
        const isEmpty = new URLSearchParams(url).toString().includes('null')
        return { page, isEmpty }
      }
      setCodes(CODES.results)
      setCodesCount(CODES.count)
      let emptyNextPage = getPage(CODES.next).isEmpty
      let emptyPreviousPage = getPage(CODES.previous).isEmpty

      setPreviousPage(emptyPreviousPage)
      setNextPage(emptyNextPage)
      setCurrentPage(page)
    } catch (error) {}
  }
  useEffect(() => {
    getCodes(1, is_used)
  }, [is_used])

  // تحميل تفضيل Dark Mode من localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className={`teacher-codes-page ${darkMode ? 'dark-mode' : ''}`}>
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
        <div className="container mt-5 pt-4">
          <h5 className="mb-4 fw-bold text-dark-mode">إدارة الأكواد</h5>
          <CodesTable
            codes={codes}
            filteredCodes={codes}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            setCodes={setCodes}
            codesCount={codesCount}
            getCodes={getCodes}
            is_used={is_used}
            setIsUsed={setIsUsed}
          />
          <CodePagination
            darkMode={darkMode}
            nextPage={nextPage}
            previousPage={previousPage}
            currentPage={currentPage}
            onPageChange={getCodes}
          />
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
    </div>
  )
}

export default TeacherCodes
