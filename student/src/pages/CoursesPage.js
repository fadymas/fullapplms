// src/pages/CoursesPage.js
import React, { useState, useEffect, useCallback } from 'react'
import DashboardNavbar from '../components/DashboardNavbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import CourseCard from '../components/CourseCard'
import '../styles/CoursesPage.css'
import courseImage1 from '../images/home.webp'
import courseImage2 from '../images/register.png'

// استيراد الأيقونات من react-icons
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'

import courseService from '../api/course.service'
import useUIStore from '../store/uiStore'

function CoursesPage() {
  const { darkMode } = useUIStore()
  const [activeTab, setActiveTab] = useState('offers-courses')
  const [currentPage, setCurrentPage] = useState(1)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const coursesPerPage = 6

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const data = await courseService.getCourses()
        // Filtering locally for UI tabs (mapping categories to tabs)
        setCourses(
          data.results.map((c) => ({
            id: c.id,
            image: c.thumbnail || courseImage1,
            title: c.title,
            date: new Date(c.created_at).toLocaleDateString('ar-EG'),
            price: `${c.price} جنية`,
            description: c.description,
            courseLink: `/course/${c.id}`,
            enrolled: false, // This usually comes from user-specific details or a separate check
            isOffer: c.category === 'Offers' || Math.random() > 0.5 // Mock logic if category not explicit
          }))
        )
      } catch (err) {
        console.error('Failed to fetch courses', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Helper functions
  const filteredCourses =
    activeTab === 'offers-courses'
      ? courses.filter((c) => c.isOffer)
      : courses.filter((c) => !c.isOffer)

  const getCurrentCourses = () => {
    const startIndex = (currentPage - 1) * coursesPerPage
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage)
  }

  const getTotalPages = () => Math.ceil(filteredCourses.length / coursesPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const totalPages = getTotalPages()
    const pageNumbers = []
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
    } else {
      if (currentPage === 1) pageNumbers.push(1, 2, 3)
      else if (currentPage === totalPages)
        pageNumbers.push(totalPages - 2, totalPages - 1, totalPages)
      else pageNumbers.push(currentPage - 1, currentPage, currentPage + 1)
    }
    return pageNumbers
  }

  return (
    <>
      <DashboardNavbar />
      <Sidebar activePage="courses" />

      <div className={`main-content courses-page ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container mt-4 pt-4">
          <h2 className="mb-4 text-center pt-2 fw-bold">الكورسات المتاحة</h2>

          {/* Tabs */}
          <div className="courses-tabs-container mb-4">
            <ul
              className="nav nav-tabs justify-content-center gap-4"
              id="courseTabs"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'offers-courses' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('offers-courses')
                    setCurrentPage(1)
                  }}
                >
                  العروض والباقات
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'primary-courses' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('primary-courses')
                    setCurrentPage(1)
                  }}
                >
                  الاشتراكات الشهرية
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="tab-content courses pt-3">
            <div className={`tab-pane fade ${activeTab === 'offers-courses' ? 'show active' : ''}`}>
              <div className="row justify-content-center g-4">
                {getCurrentCourses().map((course) => (
                  <div className="col-lg-4 col-md-6" key={course.id}>
                    <div className={`course-card-wrapper ${darkMode ? 'dark-mode' : ''}`}>
                      <CourseCard
                        image={course.image}
                        title={course.title}
                        date={course.date}
                        price={course.price}
                        description={course.description}
                        courseLink={course.courseLink}
                        enrolled={course.enrolled}
                        isOffer={course.isOffer}
                        showBothButtons={true}
                        darkMode={darkMode} // ✅ متبعت بشكل صحيح
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`tab-pane fade ${activeTab === 'primary-courses' ? 'show active' : ''}`}
            >
              <div className="row justify-content-center g-4">
                {getCurrentCourses().map((course) => (
                  <div className="col-lg-4 col-md-6" key={course.id}>
                    <div className={`course-card-wrapper ${darkMode ? 'dark-mode' : ''}`}>
                      <CourseCard
                        image={course.image}
                        title={course.title}
                        date={course.date}
                        price={course.price}
                        description={course.description}
                        courseLink={course.courseLink}
                        enrolled={course.enrolled}
                        isOffer={course.isOffer}
                        showBothButtons={true}
                        darkMode={darkMode} // ✅ متبعت بشكل صحيح
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="pagination-container mt-5">
              <div className="pagination-wrapper">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link pagination-arrow prev-arrow"
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="السابق"
                        disabled={currentPage === 1}
                      >
                        <FaChevronRight style={{ fontSize: '0.9rem' }} />
                      </button>
                    </li>

                    {getPageNumbers().map((pageNum) => (
                      <li
                        key={pageNum}
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <button
                          className="page-link pagination-number"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${currentPage === getTotalPages() ? 'disabled' : ''}`}
                    >
                      <button
                        className="page-link pagination-arrow next-arrow"
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="التالي"
                        disabled={currentPage === getTotalPages()}
                      >
                        <FaChevronLeft style={{ fontSize: '0.9rem' }} />
                      </button>
                    </li>
                  </ul>
                  <div className="current-page-indicator text-center mt-3">
                    <span className="page-indicator-badge">
                      الصفحة {currentPage} من {getTotalPages()}
                    </span>
                  </div>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </>
  )
}

export default CoursesPage
