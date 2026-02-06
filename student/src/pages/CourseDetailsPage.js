import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import courseService from '../api/course.service'
import paymentService from '../api/payment.service'
import useUIStore from '../store/uiStore'
import '../styles/CourseDetailsPage.css'

// Icons
import {
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaBookOpen,
  FaChevronDown,
  FaLock,
  FaPlayCircle,
  FaFileAlt,
  FaFile,
  FaQuestionCircle,
  FaCreditCard,
  FaVideo,
  FaLanguage,
  FaCertificate,
  FaMobileAlt,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa'

const BASE_URL = 'http://72.62.232.8'

function CourseDetailsPage() {
  const { id } = useParams()
  const { darkMode } = useUIStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState({})
  const [sidebarFixed, setSidebarFixed] = useState(true)
  const sidebarRef = useRef(null)
  const contentRef = useRef(null)

  const fetchCourseDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await courseService.getCourseDetails(id)
      setCourse(data)
      if (data.sections?.length > 0) {
        setExpandedWeeks({ [data.sections[0].id]: true })
      }
    } catch (err) {
      console.error('Error fetching course details:', err)
      setError('تعذر تحميل بيانات الكورس. يرجى المحاولة مرة أخرى لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseDetails()
  }, [id])

  const handlePurchase = async () => {
    if (!course) return

    if (
      !window.confirm(
        `هل أنت متأكد من رغبتك في شراء كورس "${course.title}" بمبلغ ${course.price} جنية؟`
      )
    ) {
      return
    }

    setPurchaseLoading(true)
    try {
      await paymentService.purchaseCourse(course.id)
      alert('تم شراء الكورس بنجاح! يمكنك الآن الوصول للمحتوى.')
      await fetchCourseDetails() // Refresh to update enrollment status
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'فشلت عملية الشراء. تأكد من وجود رصيد كافٍ في محفظتك.'
      alert(msg)
    } finally {
      setPurchaseLoading(false)
    }
  }

  const toggleWeek = (weekId) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekId]: !prev[weekId]
    }))
  }

  const getItemIcon = (type) => {
    switch (type) {
      case 'video':
        return <FaPlayCircle className="me-2 text-primary" />
      case 'file':
      case 'document':
        return <FaFileAlt className="me-2 text-success" />
      case 'quiz':
      case 'exam':
        return <FaQuestionCircle className="me-2 text-warning" />
      default:
        return <FaFile className="me-2" />
    }
  }

  const formatImage = (url) => {
    if (!url) return 'https://via.placeholder.com/800x450?text=Course+Image'
    return url.startsWith('http') ? url : `${BASE_URL}${url}`
  }

  if (loading) {
    return (
      <div
        className={`course-details-page ${darkMode ? 'dark-mode' : ''} min-vh-100 d-flex flex-column`}
      >
        <DashboardNavbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <FaSpinner
              className="spinner-animation mb-3"
              style={{ fontSize: '3rem', color: '#4CACB7' }}
            />
            <h4 className={darkMode ? 'text-light' : ''}>جاري تحميل بيانات الكورس...</h4>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div
        className={`course-details-page ${darkMode ? 'dark-mode' : ''} min-vh-100 d-flex flex-column`}
      >
        <DashboardNavbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center p-4 card shadow-sm">
            <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: '3rem' }} />
            <h4 className="mb-3 text-danger">{error || 'لم يتم العثور على الكورس'}</h4>
            <Link to="/courses" className="btn btn-primary px-4">
              العودة لجميع الكورسات
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div
      className={`main-content course-details-page ${darkMode ? 'dark-mode' : ''}`}
      ref={contentRef}
    >
      <DashboardNavbar />
      <Sidebar activePage="courses" />

      <div className="container mt-5 pt-4">
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4 border-0 bg-transparent">
              <div className="course-hero-image-container mb-4 overflow-hidden rounded-4 shadow-sm">
                <img
                  className="w-100 object-fit-cover academy-img"
                  src={formatImage(course.thumbnail)}
                  alt={course.title}
                  style={{ maxHeight: '450px' }}
                />
              </div>
              <div className="card-body px-0 py-2">
                <h1 className="card-title fw-bold mb-3 display-6">{course.title}</h1>
                <p className="card-text lead text-muted">{course.description}</p>

                <div className="row g-3 py-3">
                  <div className="col-md-6 col-6">
                    <div className="d-flex align-items-center">
                      <div className="icon-badge me-2 bg-primary-soft">
                        <FaUser />
                      </div>
                      <div>
                        <small className="text-muted d-block">المعلم</small>
                        <strong>{course.instructor_name}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-6">
                    <div className="d-flex align-items-center">
                      <div className="icon-badge me-2 bg-warning-soft">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <small className="text-muted d-block">المستوى</small>
                        <strong>{course.difficulty_level || 'عام'}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-6">
                    <div className="d-flex align-items-center">
                      <div className="icon-badge me-2 bg-info-soft">
                        <FaClock />
                      </div>
                      <div>
                        <small className="text-muted d-block">السعر</small>
                        <strong>{course.price} جنية</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
              <div className="card-header bg-white border-bottom-0 p-0">
                <ul className="nav nav-pills custom-pills nav-justified" role="tablist">
                  <li className="nav-item">
                    <button
                      className={`nav-link py-3 fw-bold rounded-0 ${activeTab === 'overview' ? 'active shadow-sm' : ''}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <FaBookOpen className="me-2" /> المحتوى
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link py-3 fw-bold rounded-0 ${activeTab === 'curriculum' ? 'active shadow-sm' : ''}`}
                      onClick={() => setActiveTab('curriculum')}
                    >
                      <FaCertificate className="me-2" /> التفاصيل
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4">
                {activeTab === 'overview' && (
                  <div className="tab-pane fade show active">
                    <h5 className="mb-4 d-flex align-items-center fw-bold">
                      محتوى الدورة التعليمية
                      <span className="badge bg-light text-primary ms-2 fs-14 border">
                        {course.sections?.length || 0} فصول
                      </span>
                    </h5>

                    <div className="accordion custom-accordion" id="mainAccordion">
                      {course.sections?.map((section) => (
                        <div
                          className="accordion-item mb-3 border rounded-3 overflow-hidden shadow-sm"
                          key={section.id}
                        >
                          <h2 className="accordion-header">
                            <button
                              className={`accordion-button py-3 ${expandedWeeks[section.id] ? '' : 'collapsed'}`}
                              type="button"
                              onClick={() => toggleWeek(section.id)}
                            >
                              <div className="d-flex align-items-center flex-grow-1">
                                <span className="section-number me-3">{section.order || '•'}</span>
                                <span className="fw-bold fs-16">{section.title}</span>
                              </div>
                              <span className="badge bg-light text-muted ms-auto me-3 border">
                                {section.lectures?.length || 0} دروس
                              </span>
                            </button>
                          </h2>

                          <div
                            className={`accordion-collapse collapse ${expandedWeeks[section.id] ? 'show' : ''}`}
                          >
                            <div className="accordion-body p-2 bg-light bg-opacity-10">
                              <div className="list-group list-group-flush rounded-3 overflow-hidden">
                                {section.lectures?.length > 0 ? (
                                  section.lectures.map((lecture) => (
                                    <div
                                      className={`list-group-item d-flex align-items-center p-3 border-0 mb-1 rounded-2 shadow-sm bg-white lecture-item ${!course.is_enrolled && !lecture.is_free ? 'locked-lecture' : 'hover-item'}`}
                                      key={lecture.id}
                                    >
                                      <div className="sub-icon me-3">
                                        {!course.is_enrolled && !lecture.is_free ? (
                                          <FaLock className="text-danger opacity-50" />
                                        ) : (
                                          getItemIcon(lecture.lecture_type)
                                        )}
                                      </div>

                                      <div className="flex-grow-1">
                                        <div className="fw-bold fs-14 text-dark-custom">
                                          {lecture.title}
                                        </div>
                                        <div className="small text-muted d-flex align-items-center">
                                          {lecture.duration_minutes && (
                                            <>
                                              <FaClock className="me-1 fs-11" />{' '}
                                              {lecture.duration_minutes} دقيقة
                                            </>
                                          )}
                                          {lecture.is_free && (
                                            <span className="badge bg-success-soft text-success ms-2 fs-10">
                                              مجاني
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {course.is_enrolled || lecture.is_free ? (
                                        <Link
                                          to={`/course/${course.id}/lecture/${lecture.id}`}
                                          className="btn btn-primary-soft btn-sm scale-hover"
                                        >
                                          <span>دخول</span>
                                        </Link>
                                      ) : (
                                        <FaLock className="text-secondary opacity-25" />
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-muted small">
                                    هذا الفصل لا يحتوي على محاضرات بعد
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="tab-pane fade show active">
                    <h5 className="fw-bold mb-4">وصف تفصيلي للكورس</h5>
                    <p className="text-muted lh-lg">
                      {course.description || 'لا يوجد وصف متاح حالياً.'}
                    </p>

                    <div className="row g-4 mt-2">
                      <div className="col-md-6">
                        <div className="info-card p-3 rounded-4 border bg-white h-100 shadow-sm">
                          <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <FaLanguage className="me-2 text-primary" /> اللغة
                          </h6>
                          <p className="mb-0 text-muted">{course.language || 'العربية'}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card p-3 rounded-4 border bg-white h-100 shadow-sm">
                          <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <FaMobileAlt className="me-2 text-primary" /> التوافق
                          </h6>
                          <p className="mb-0 text-muted">يعمل على جميع الأجهزة الذكية</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card p-3 rounded-4 border bg-white h-100 shadow-sm">
                          <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <FaCertificate className="me-2 text-primary" /> الشهادة
                          </h6>
                          <p className="mb-0 text-muted">متاح شهادة عند إتمام الكورس بنجاح</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div
              ref={sidebarRef}
              className={`card enrollment-sidebar rounded-4 shadow border-0 ${sidebarFixed ? 'sticky-sidebar' : 'sidebar-scrolled'} ${darkMode ? 'dark-mode-card shadow-lg' : ''}`}
              style={{ top: '100px' }}
            >
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div
                    className={`purchase-status-badge p-3 rounded-4 mb-3 ${course.is_enrolled ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'}`}
                  >
                    <h5 className="mb-1 fw-bold">
                      {course.is_enrolled ? 'تم الشراء بنجاح' : 'اشترك الآن في الكورس'}
                    </h5>
                    <p className="small mb-0">
                      {course.is_enrolled ? 'لديك صلاحية الوصول للمحتوى' : 'ابدأ رحلة تعلمك اليوم'}
                    </p>
                  </div>
                </div>

                {!course.is_enrolled ? (
                  <button
                    onClick={handlePurchase}
                    disabled={purchaseLoading}
                    className="btn btn-primary w-100 py-3 rounded-3 fw-bold mb-4 shadow-sm pulse-animation"
                  >
                    {purchaseLoading ? (
                      <FaSpinner className="spinner-animation" />
                    ) : (
                      <>
                        شراء الكورس {course.price} جنية <FaCreditCard className="ms-2" />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={`/course/${course.id}/player`}
                    className="btn btn-success w-100 py-3 rounded-3 fw-bold mb-4 shadow-sm"
                  >
                    ابدأ التعلم الآن <FaVideo className="ms-2" />
                  </Link>
                )}

                <h6 className="fw-bold mb-3 border-bottom pb-2">تفاصيل إضافية</h6>
                <ul className="list-unstyled course-meta-list small">
                  <li className="mb-3 d-flex align-items-center">
                    <FaPlayCircle className="me-2 text-primary" />
                    <span>
                      {course.sections?.reduce((sum, s) => sum + (s.lectures?.length || 0), 0) || 0}{' '}
                      درس تعليمي
                    </span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <FaClock className="me-2 text-primary" />
                    <span>وصول غير محدود مدى الحياة</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <FaLanguage className="me-2 text-primary" />
                    <span>اللغة: العربية</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <FaMobileAlt className="me-2 text-primary" />
                    <span>تعلم من موبايلك أو الكمبيوتر</span>
                  </li>
                </ul>

                <hr className="my-4 opacity-10" />

                <h6 className="fw-bold mb-3">الفصول الرئيسية</h6>
                <div className="sidebar-sections-list">
                  {course.sections?.slice(0, 5).map((section) => (
                    <div
                      key={section.id}
                      className="d-flex align-items-center mb-2 small text-muted"
                    >
                      <span className="me-2 text-primary">•</span>
                      <span className="text-truncate">{section.title}</span>
                    </div>
                  ))}
                  {course.sections?.length > 5 && (
                    <div className="text-primary small fw-bold">
                      ...و {course.sections.length - 5} فصول أخرى
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CourseDetailsPage
