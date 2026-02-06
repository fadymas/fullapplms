import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar'
import CustomVideoPlayer from '../components/CustomVideoPlayer'
import courseService from '../api/course.service'
import useUIStore from '../store/uiStore'
import useAuthStore from '../store/authStore'
import '../styles/CoursePlayerPage.css'

// Icons
import {
  FaPlayCircle,
  FaFileAlt,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaSpinner,
  FaExclamationCircle,
  FaUserGraduate
} from 'react-icons/fa'

/**
 * CoursePlayerPage with Custom Video Controls
 * Includes custom video player with fullscreen, quality, skip buttons, and volume control
 */
function CoursePlayerPage() {
  const { id: courseId, lectureId } = useParams()
  const navigate = useNavigate()
  const { darkMode } = useUIStore()
  const { isAuthenticated } = useAuthStore()

  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [currentLecture, setCurrentLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})

  // 1. Initial Load: Fetch Course Structure & Content
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch Metadata
        const metaData = await courseService.getCourseDetails(courseId)
        setCourse(metaData)

        // Fetch Full Content
        const contentData = await courseService.getCourseContent(courseId)
        const sectionsList = Array.isArray(contentData) ? contentData : contentData.sections || []
        setSections(sectionsList)

        // Initial Redirection or Section Expansion
        if (!lectureId) {
          const firstLecture = sectionsList?.[0]?.lectures?.[0]
          if (firstLecture) {
            navigate(`/course/${courseId}/lecture/${firstLecture.id}`, { replace: true })
          }
        } else {
          const section = sectionsList.find((s) =>
            s.lectures?.some((l) => l.id.toString() === lectureId.toString())
          )
          if (section) setExpandedSections((prev) => ({ ...prev, [section.id]: true }))
        }
      } catch (err) {
        console.error('Failed to load course data:', err)
        const msg = err.response?.data?.detail || 'عذراً، حدث خطأ أثناء تحميل الكورس.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [courseId, isAuthenticated])

  // 2. Client-side Lecture Lookup
  useEffect(() => {
    if (!lectureId || sections.length === 0) return

    let found = null
    for (const sec of sections) {
      const lec = sec.lectures?.find((l) => l.id.toString() === lectureId.toString())
      if (lec) {
        found = lec
        break
      }
    }

    if (found) {
      setCurrentLecture(found)
    }
  }, [lectureId, sections, loading])

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getLectureIcon = (type, isLocked) => {
    if (isLocked) return <FaLock className="lecture-icon locked-icon" />
    switch (type) {
      case 'video':
        return <FaPlayCircle className="lecture-icon text-primary" />
      case 'article':
        return <FaFileAlt className="lecture-icon text-info" />
      case 'file':
        return <FaFileAlt className="lecture-icon text-success" />
      case 'quiz':
      case 'exam':
        return <FaQuestionCircle className="lecture-icon text-warning" />
      default:
        return <FaPlayCircle className="lecture-icon" />
    }
  }

  // Prepare video URL
  const getVideoUrl = (videoUrl) => {
    if (!videoUrl) return null
    return videoUrl.startsWith('http')
      ? videoUrl.trim()
      : `http://72.62.232.8${videoUrl.trim()}`
  }

  // Global Loading state
  if (loading) {
    return (
      <div className={`course-player-page ${darkMode ? 'dark-mode' : ''} min-vh-100`}>
        <DashboardNavbar />
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
          <FaSpinner className="spinner-animation text-primary mb-3" style={{ fontSize: '3rem' }} />
          <h5 className={darkMode ? 'text-light' : ''}>جاري تحضير المحتوى...</h5>
        </div>
      </div>
    )
  }

  // Global Error State
  if (error && !course) {
    return (
      <div className={`course-player-page ${darkMode ? 'dark-mode' : ''} min-vh-100`}>
        <DashboardNavbar />
        <div className="container mt-5 py-5 text-center">
          <div className="card shadow-lg p-5 border-0 rounded-4">
            <FaExclamationCircle className="text-danger mb-4" style={{ fontSize: '4rem' }} />
            <h3 className="fw-bold mb-3">{error}</h3>
            <p className="text-muted mb-4">يرجى التأكد من أنك مشترك في الكورس وأن حسابك مفعل.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to={`/course/${courseId}`} className="btn btn-primary px-4 py-2 rounded-pill">
                صفحة تفاصيل الكورس
              </Link>
              <Link to="/courses" className="btn btn-outline-secondary px-4 py-2 rounded-pill">
                جميع الكورسات
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`course-player-page ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardNavbar />

      <div className="player-layout">
        {/* 1. Main Content Area */}
        <div className="player-main shadow-inner">
          {currentLecture ? (
            <div className="fade-in">
              {/* Custom Video Player Section */}
              {currentLecture.lecture_type === 'video' && currentLecture.video_url ? (
                <div className="video-wrapper-custom shadow-lg border border-dark mb-4">
                  <CustomVideoPlayer url={getVideoUrl(currentLecture.video_url)} />
                </div>
              ) : null}

              <div className="lecture-info mt-0 p-4 rounded-4 shadow-sm border bg-white text-dark">
                <h2 className="fw-bold mb-2">{currentLecture.title}</h2>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span className="badge bg-primary-soft text-primary p-2">
                    <FaUserGraduate className="me-1" /> {course?.title}
                  </span>
                  {currentLecture.duration_minutes && (
                    <span className="text-muted small">
                      المدة: {currentLecture.duration_minutes} دقيقة
                    </span>
                  )}
                </div>

                {/* Text Content */}
                <div className="lecture-content-body">
                  {currentLecture.content ? (
                    <div
                      className="p-3 bg-light rounded border mb-3 article-content"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {currentLecture.content}
                    </div>
                  ) : (
                    <p className="text-muted">لا يوجد محتوى نصي.</p>
                  )}

                  {currentLecture.description &&
                    currentLecture.description !== currentLecture.content && (
                      <p className="text-secondary small mt-2">{currentLecture.description}</p>
                    )}
                </div>

                {/* Attachments */}
                {currentLecture.files?.length > 0 && (
                  <div className="attachments-section pt-3 border-top mt-4">
                    <h5 className="fw-bold mb-3">الملفات والملخصات المرفقة:</h5>
                    <div className="row g-3">
                      {currentLecture.files.map((file) => (
                        <div className="col-md-6" key={file.id}>
                          <a
                            href={
                              file.file.startsWith('http')
                                ? file.file
                                : `http://72.62.232.8${file.file}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-card d-flex align-items-center p-3 rounded-3 border text-decoration-none hover-shadow transition"
                          >
                            <FaFileAlt className="text-success fs-3 me-3" />
                            <div className="flex-grow-1">
                              <div className="fw-bold text-dark">{file.title}</div>
                              <small className="text-muted">تحميل الملف</small>
                            </div>
                            {file.is_free && (
                              <span className="badge bg-success-soft text-success">مجاني</span>
                            )}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-white opacity-50 p-5 text-center mt-5">
              <FaPlayCircle className="mb-3" style={{ fontSize: '4rem' }} />
              <h3>قم باختيار درس من القائمة الجانبية للبدء</h3>
            </div>
          )}
        </div>

        {/* 2. Course Sidebar */}
        <div className={`player-sidebar ${darkMode ? 'dark-mode-sidebar' : ''}`}>
          <div className="sidebar-header p-4 shadow-sm">
            <h6 className="mb-2 fw-bold text-truncate">{course?.title}</h6>
            {course?.progress_percentage !== undefined && (
              <>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${course?.progress_percentage || 0}%` }}
                  ></div>
                </div>
                <div className="small text-muted mt-1 text-end">
                  نسبة الإنجاز: {course?.progress_percentage || 0}%
                </div>
              </>
            )}
          </div>

          <div className="course-content-list">
            {sections.map((section, sIdx) => (
              <div key={section.id} className="section-group border-bottom">
                <button
                  className={`section-header-btn w-100 d-flex justify-content-between align-items-center p-3 border-0 bg-transparent ${expandedSections[section.id] ? 'active-section' : ''}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="d-flex align-items-center text-truncate">
                    <span className="section-index text-muted me-2 small">{sIdx + 1}.</span>
                    <span
                      className={`fw-bold text-truncate ${darkMode ? 'text-light' : 'text-dark'}`}
                    >
                      {section.title}
                    </span>
                  </div>
                  {expandedSections[section.id] ? (
                    <FaChevronUp className="fs-12 text-muted" />
                  ) : (
                    <FaChevronDown className="fs-12 text-muted" />
                  )}
                </button>

                {expandedSections[section.id] && (
                  <div className="lecture-items-container bg-light bg-opacity-50">
                    {section.lectures?.map((lecture) => {
                      const isLocked = !course?.is_enrolled && !lecture.is_free
                      const isActive = lectureId === lecture.id.toString()

                      return (
                        <button
                          key={lecture.id}
                          className={`lecture-item-row w-100 d-flex align-items-center p-3 border-0 bg-transparent text-end transition ${isActive ? 'active-lecture' : ''} ${isLocked ? 'locked-lecture opacity-75' : 'hover-bg'}`}
                          onClick={() => {
                            if (isLocked) {
                              alert('يجب الاشتراك في الكورس لمشاهدة هذا المحتوى')
                              return
                            }
                            navigate(`/course/${courseId}/lecture/${lecture.id}`)
                          }}
                        >
                          <div className="item-icon-container me-3">
                            {getLectureIcon(lecture.lecture_type, isLocked)}
                          </div>
                          <div className="flex-grow-1 text-truncate">
                            <div
                              className={`lecture-title fs-14 ${isActive ? 'fw-bold text-primary' : darkMode ? 'text-light' : 'text-dark'}`}
                            >
                              {lecture.title}
                            </div>
                            <div className="d-flex justify-content-between">
                              {lecture.duration_minutes && (
                                <small className="text-muted">
                                  {lecture.duration_minutes} دقيقة
                                </small>
                              )}
                            </div>
                          </div>
                          {isActive && <div className="active-indicator ms-2"></div>}
                        </button>
                      )
                    })}
                    {(!section.lectures || section.lectures.length === 0) && (
                      <div className="p-3 text-center text-muted small italic">
                        لا يوجد دروس متوفرة
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePlayerPage