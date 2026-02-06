// src/pages/teacher/QuizList.jsx
import React, { useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaUsers,
  FaChartBar,
  FaGraduationCap,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaFileAlt,
  FaChevronRight,
  FaChevronLeft,
  FaTimes,
  FaExclamationTriangle,
  FaTasks,
  FaSave
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import teacherQuizzesService from '../api/teacher/quizzes.service'
import '../styles/quizzes.css'
import CourseLectures from '../components/CourseLectures'
import { lecturesData } from '../utils/courseDetailsData'
import teacherLecturesService from '../api/teacher/lectures.service'
import useAuthStore from '../store/authStore'

const QuizList = () => {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('') // New: quiz type filter
  const [showFilters, setShowFilters] = useState(false)
  const [lectures, setLectures] = useState([])
  const [selectedLecture, setSelectedLecture] = useState('')
  const { user } = useAuthStore()

  const handleChange = (e) => {
    setSelectedLecture(e.target.value)
  }

  // Form state for creating quiz
  const [formData, setFormData] = useState({
    lecture: '',
    title: '',
    description: '',
    quiz_type: 'quiz', // New field
    is_mandatory: false,
    passing_grade: '',
    max_attempts: '',
    grading_method: 'highest',
    time_limit_minutes: '',
    is_published: false
  })

  // Form state for editing quiz
  const [editFormData, setEditFormData] = useState({
    lecture: '',
    title: '',
    description: '',
    quiz_type: 'quiz',
    is_mandatory: false,
    passing_grade: '',
    max_attempts: '',
    grading_method: 'highest',
    time_limit_minutes: '',
    is_published: false
  })

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  useEffect(() => {
    fetchQuizzes()
    fetchLectures()
  }, [currentPage, statusFilter])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await teacherQuizzesService.getMyQuizzes(currentPage, '', statusFilter)
      setQuizzes(response.results || [])
      setTotalCount(response.count || 0)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLectures = async () => {
    try {
      setLoading(true)
      const response = await teacherLecturesService.listLectures()
      setLectures(response.results || [])
    } catch (error) {
      console.error('Failed to fetch lectures:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    try {
      const quizData = {
        lecture: Number(selectedLecture),
        title: formData.title,
        description: formData.description,
        quiz_type: formData.quiz_type, // Include quiz_type
        is_mandatory: formData.is_mandatory,
        passing_grade: formData.passing_grade,
        max_attempts: Number(formData.max_attempts),
        grading_method: formData.grading_method,
        time_limit_minutes: formData.time_limit_minutes
          ? Number(formData.time_limit_minutes)
          : null,
        is_published: formData.is_published
      }

      const newQuiz = await teacherQuizzesService.createQuiz(quizData)
      setQuizzes([newQuiz, ...quizzes])
      setTotalCount(totalCount + 1)
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create quiz:', error)
      alert('فشل إنشاء الامتحان')
    }
  }

  const handleUpdateQuiz = async (e) => {
    e.preventDefault()
    if (!selectedQuiz) return

    try {
      const quizData = {
        lecture: Number(editFormData.lecture),
        title: editFormData.title,
        description: editFormData.description,
        quiz_type: editFormData.quiz_type,
        is_mandatory: editFormData.is_mandatory,
        passing_grade: editFormData.passing_grade,
        max_attempts: Number(editFormData.max_attempts),
        grading_method: editFormData.grading_method,
        time_limit_minutes: editFormData.time_limit_minutes
          ? Number(editFormData.time_limit_minutes)
          : null,
        is_published: editFormData.is_published
      }

      const updatedQuiz = await teacherQuizzesService.updateQuiz(selectedQuiz.id, quizData)
      setQuizzes(quizzes.map((q) => (q.id === selectedQuiz.id ? updatedQuiz : q)))
      setShowEditModal(false)
      setSelectedQuiz(null)
      resetEditForm()
    } catch (error) {
      console.error('Failed to update quiz:', error)
      alert('فشل تحديث الامتحان')
    }
  }

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return

    try {
      await teacherQuizzesService.deleteQuiz(selectedQuiz.id)
      setQuizzes(quizzes.filter((q) => q.id !== selectedQuiz.id))
      setTotalCount(totalCount - 1)
      setShowDeleteModal(false)
      setSelectedQuiz(null)
    } catch (error) {
      console.error('Failed to delete quiz:', error)
      alert('فشل حذف الامتحان')
    }
  }

  const handlePublishToggle = async (quiz) => {
    try {
      if (quiz.is_published === true) {
        await teacherQuizzesService.unpublishQuiz(quiz.id)
      } else {
        await teacherQuizzesService.publishQuiz(quiz.id)
      }
      fetchQuizzes()
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
      alert(error?.response?.data?.detail)
    }
  }

  const openEditModal = (quiz) => {
    setSelectedQuiz(quiz)
    setEditFormData({
      lecture: quiz.lecture || '',
      title: quiz.title || '',
      description: quiz.description || '',
      quiz_type: quiz.quiz_type || 'quiz',
      is_mandatory: quiz.is_mandatory || false,
      passing_grade: quiz.passing_grade || '',
      max_attempts: quiz.max_attempts || '',
      grading_method: quiz.grading_method || 'highest',
      time_limit_minutes: quiz.time_limit_minutes || '',
      is_published: quiz.is_published || false
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      lecture: '',
      title: '',
      description: '',
      quiz_type: 'quiz',
      is_mandatory: false,
      passing_grade: '',
      max_attempts: '',
      grading_method: 'highest',
      time_limit_minutes: '',
      is_published: false
    })
    setSelectedLecture('')
  }

  const resetEditForm = () => {
    setEditFormData({
      lecture: '',
      title: '',
      description: '',
      quiz_type: 'quiz',
      is_mandatory: false,
      passing_grade: '',
      max_attempts: '',
      grading_method: 'highest',
      time_limit_minutes: '',
      is_published: false
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { text: 'منشور', color: 'success', icon: FaCheckCircle },
      draft: { text: 'مسودة', color: 'warning', icon: FaClock },
      archived: { text: 'مؤرشف', color: 'secondary', icon: FaTimesCircle }
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon className="me-1" />
        {config.text}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      quiz: { text: 'اختبار', color: 'info', icon: FaQuestionCircle },
      assignment: { text: 'تكليف', color: 'purple', icon: FaTasks }
    }

    const config = typeConfig[type] || typeConfig.quiz
    const Icon = config.icon

    return (
      <span className={`type-badge type-${config.color}`}>
        <Icon className="me-1" />
        {config.text}
      </span>
    )
  }

  // Client-side filtering
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === '' || quiz.quiz_type === typeFilter
    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(totalCount / 10)

  // Statistics
  const stats = {
    total: totalCount,
    quizzes: quizzes.filter((q) => q.quiz_type === 'quiz').length,
    assignments: quizzes.filter((q) => q.quiz_type === 'assignment').length,
    published: quizzes.filter((q) => q.is_published === true).length,
    draft: quizzes.filter((q) => q.is_published === false).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)
  }

  return (
    <div
      className={`quiz-list-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
    >
      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activePage="exams"
        darkMode={darkMode}
      />

      <div className="main-content">
        <div className="quiz-container">
          {/* Header */}
          <div className="quiz-header" data-aos="fade-down">
            <div className="quiz-header-content">
              <h1>
                <FaGraduationCap className="me-2" />
                إدارة الامتحانات والتكاليف
              </h1>
              <p>إنشاء وإدارة الامتحانات والتكاليف والأسئلة</p>
            </div>
            <button className="btn-create-quiz" onClick={() => setShowCreateModal(true)}>
              <FaPlus />
              <span>إضافة امتحان جديد</span>
            </button>
          </div>

          {/* Statistics */}
          <div className="quiz-stats" data-aos="fade-up">
            <div className="stat-card">
              <div className="stat-icon total">
                <FaFileAlt />
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>إجمالي الامتحانات</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon quiz">
                <FaQuestionCircle />
              </div>
              <div className="stat-content">
                <h3>{stats.quizzes}</h3>
                <p>اختبارات</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon assignment">
                <FaTasks />
              </div>
              <div className="stat-content">
                <h3>{stats.assignments}</h3>
                <p>تكاليف</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon published">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <h3>{stats.published}</h3>
                <p>منشورة</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon draft">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>{stats.draft}</h3>
                <p>مسودات</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="quiz-controls" data-aos="fade-up">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="ابحث عن امتحان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                className="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">جميع الأنواع</option>
                <option value="quiz">اختبارات</option>
                <option value="assignment">تكاليف</option>
              </select>


            </div>
          </div>

          {/* Quizzes List */}
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>جاري تحميل الامتحانات...</p>
            </div>
          ) : filteredQuizzes.length > 0 ? (
            <div className="quizzes-grid" data-aos="fade-up">
              {filteredQuizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="quiz-card"
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <div className="quiz-card-header">
                    <div className="quiz-badges-header">
                      {getTypeBadge(quiz.quiz_type)}
                      {getStatusBadge(quiz.status)}
                    </div>
                    <div className="quiz-actions">
                      <button
                        className="btn-action view"
                        onClick={() => navigate(`/${user.role}/exams/${quiz.id}`)}
                        title="عرض الأسئلة"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-action edit"
                        onClick={() => openEditModal(quiz)}
                        title="تعديل"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => {
                          setSelectedQuiz(quiz)
                          setShowDeleteModal(true)
                        }}
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="quiz-card-body">
                    <h3>{quiz.title}</h3>
                    <p className="quiz-description">{quiz.description || 'لا يوجد وصف'}</p>

                    <div className="quiz-meta">
                      <div className="meta-item">
                        <FaQuestionCircle />
                        <span>{quiz.questions?.length || 0} سؤال</span>
                      </div>
                      <div className="meta-item">
                        <FaClock />
                        <span>
                          {quiz.time_limit_minutes
                            ? `${quiz.time_limit_minutes} دقيقة`
                            : 'غير محدد'}
                        </span>
                      </div>
                      <div className="meta-item">
                        <FaUsers />
                        <span>{quiz.max_attempts || '∞'} محاولة</span>
                      </div>
                    </div>

                    <div className="quiz-info">
                      <div className="info-row">
                        <span>درجة النجاح:</span>
                        <strong>{quiz.passing_grade}%</strong>
                      </div>
                      <div className="info-row">
                        <span>طريقة التقييم:</span>
                        <strong>
                          {quiz.grading_method === 'highest' ? 'أعلى درجة' : 'آخر محاولة'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="quiz-card-footer">
                    <div className="quiz-badges">
                      {quiz.is_mandatory && <span className="badge badge-mandatory">إجباري</span>}
                      {quiz.randomize_questions && (
                        <span className="badge badge-random">عشوائي</span>
                      )}
                    </div>

                    <button
                      className={`btn-publish ${quiz.status === 'published' ? 'published' : ''}`}
                      onClick={() => handlePublishToggle(quiz)}
                    >
                      {quiz.is_published === true ? 'إلغاء النشر' : 'نشر الامتحان'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" data-aos="fade-up">
              <FaGraduationCap />
              <h3>لا توجد امتحانات</h3>
              <p>ابدأ بإضافة امتحان جديد لطلابك</p>
              <button className="btn-create-quiz" onClick={() => setShowCreateModal(true)}>
                <FaPlus />
                <span>إضافة أول امتحان</span>
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container" data-aos="fade-up">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronRight />
              </button>
              <span className="pagination-info">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <FaChevronLeft />
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div
          className="modern-modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modern-modal-overlay') {
              setShowCreateModal(false)
            }
          }}
        >
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <FaPlus />
                </div>
                <div>
                  <h2>إضافة امتحان جديد</h2>
                  <p>قم بملء البيانات التالية لإنشاء امتحان جديد</p>
                </div>
              </div>
              <button
                className="btn-close-modern"
                onClick={() => setShowCreateModal(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="overflow-y-scroll">
              <div className="modern-modal-body">
                <div className="form-section">
                  <h3 className="section-title">
                    <FaFileAlt className="me-2" />
                    معلومات أساسية
                  </h3>

                  <div className="form-group-modern">
                    <label>المحاضرة *</label>
                    <select
                      name="lecture"
                      value={selectedLecture}
                      onChange={handleChange}
                      className="input-wrapper select"
                      required
                    >
                      <option value="">اختر المحاضرة</option>
                      {lectures?.map((lecture) => (
                        <option key={lecture?.id} value={lecture?.id}>
                          {lecture?.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>النوع *</label>
                    <div className="input-wrapper">
                      <select
                        name="quiz_type"
                        value={formData.quiz_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="quiz">اختبار</option>
                        <option value="assignment">تكليف</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-modern">
                    <label>عنوان الامتحان *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="مثال: امتحان نصف الفصل"
                      />
                    </div>
                  </div>

                  <div className="form-group-modern">
                    <label>وصف الامتحان</label>
                    <div className="input-wrapper">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="وصف مختصر عن الامتحان..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">
                    <FaCheckCircle className="me-2" />
                    إعدادات التقييم
                  </h3>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label>درجة النجاح *</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          name="passing_grade"
                          value={formData.passing_grade}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max="100"
                          placeholder="60"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>

                    <div className="form-group-modern">
                      <label>عدد المحاولات *</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          name="max_attempts"
                          value={formData.max_attempts}
                          onChange={handleInputChange}
                          required
                          min="1"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label>طريقة التقييم</label>
                      <div className="input-wrapper">
                        <select
                          name="grading_method"
                          value={formData.grading_method}
                          onChange={handleInputChange}
                        >
                          <option value="highest">أعلى درجة</option>
                          <option value="latest">آخر محاولة</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group-modern">
                      <label>الوقت المحدد (دقائق)</label>
                      <div className="input-wrapper">
                        <FaClock className="input-icon" />
                        <input
                          type="number"
                          name="time_limit_minutes"
                          value={formData.time_limit_minutes}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">
                    <FaCheckCircle className="me-2" />
                    خيارات إضافية
                  </h3>

                  <div className="switch-group">
                    <label className="modern-switch">
                      <input
                        type="checkbox"
                        name="is_mandatory"
                        checked={formData.is_mandatory}
                        onChange={handleInputChange}
                      />
                      <span className="switch-slider-modern"></span>
                      <div className="switch-content">
                        <span className="switch-title">امتحان إجباري</span>
                        <span className="switch-description">
                          يتطلب من جميع الطلاب إكمال هذا الامتحان
                        </span>
                      </div>
                    </label>

                    <label className="modern-switch">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleInputChange}
                      />
                      <span className="switch-slider-modern"></span>
                      <div className="switch-content">
                        <span className="switch-title">نشر الامتحان فوراً</span>
                        <span className="switch-description">
                          سيكون الامتحان متاحاً للطلاب مباشرة
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modern-modal-footer">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  <FaTimes className="me-2" />
                  إلغاء
                </button>
                <button type="submit" className="btn-modal-primary">
                  <FaPlus className="me-2" />
                  إنشاء الامتحان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && (
        <div
          className="modern-modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modern-modal-overlay') {
              setShowEditModal(false)
            }
          }}
        >
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon edit">
                  <FaEdit />
                </div>
                <div>
                  <h2>تعديل الامتحان</h2>
                  <p>قم بتعديل البيانات التالية</p>
                </div>
              </div>
              <button
                className="btn-close-modern"
                onClick={() => setShowEditModal(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateQuiz} className="overflow-y-scroll">
              <div className="modern-modal-body">
                <div className="form-section">
                  <h3 className="section-title">
                    <FaFileAlt className="me-2" />
                    معلومات أساسية
                  </h3>

                  <div className="form-group-modern">
                    <label>المحاضرة *</label>
                    <select
                      name="lecture"
                      value={editFormData.lecture}
                      onChange={handleEditInputChange}
                      className="input-wrapper select"
                      required
                    >
                      <option value="">اختر المحاضرة</option>
                      {lectures?.map((lecture) => (
                        <option key={lecture?.id} value={lecture?.id}>
                          {lecture?.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>النوع *</label>
                    <div className="input-wrapper">
                      <select
                        name="quiz_type"
                        value={editFormData.quiz_type}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="quiz">اختبار</option>
                        <option value="assignment">تكليف</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-modern">
                    <label>عنوان الامتحان *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditInputChange}
                        required
                        placeholder="مثال: امتحان نصف الفصل"
                      />
                    </div>
                  </div>

                  <div className="form-group-modern">
                    <label>وصف الامتحان</label>
                    <div className="input-wrapper">
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows="3"
                        placeholder="وصف مختصر عن الامتحان..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">
                    <FaCheckCircle className="me-2" />
                    إعدادات التقييم
                  </h3>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label>درجة النجاح *</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          name="passing_grade"
                          value={editFormData.passing_grade}
                          onChange={handleEditInputChange}
                          required
                          min="0"
                          max="100"
                          placeholder="60"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>

                    <div className="form-group-modern">
                      <label>عدد المحاولات *</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          name="max_attempts"
                          value={editFormData.max_attempts}
                          onChange={handleEditInputChange}
                          required
                          min="1"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label>طريقة التقييم</label>
                      <div className="input-wrapper">
                        <select
                          name="grading_method"
                          value={editFormData.grading_method}
                          onChange={handleEditInputChange}
                        >
                          <option value="highest">أعلى درجة</option>
                          <option value="latest">آخر محاولة</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group-modern">
                      <label>الوقت المحدد (دقائق)</label>
                      <div className="input-wrapper">
                        <FaClock className="input-icon" />
                        <input
                          type="number"
                          name="time_limit_minutes"
                          value={editFormData.time_limit_minutes}
                          onChange={handleEditInputChange}
                          min="1"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">
                    <FaCheckCircle className="me-2" />
                    خيارات إضافية
                  </h3>

                  <div className="switch-group">
                    <label className="modern-switch">
                      <input
                        type="checkbox"
                        name="is_mandatory"
                        checked={editFormData.is_mandatory}
                        onChange={handleEditInputChange}
                      />
                      <span className="switch-slider-modern"></span>
                      <div className="switch-content">
                        <span className="switch-title">امتحان إجباري</span>
                        <span className="switch-description">
                          يتطلب من جميع الطلاب إكمال هذا الامتحان
                        </span>
                      </div>
                    </label>

                    <label className="modern-switch">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={editFormData.is_published}
                        onChange={handleEditInputChange}
                      />
                      <span className="switch-slider-modern"></span>
                      <div className="switch-content">
                        <span className="switch-title">نشر الامتحان</span>
                        <span className="switch-description">
                          سيكون الامتحان متاحاً للطلاب مباشرة
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modern-modal-footer">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  <FaTimes className="me-2" />
                  إلغاء
                </button>
                <button type="submit" className="btn-modal-primary">
                  <FaSave className="me-2" />
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modern-modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modern-modal-overlay') {
              setShowDeleteModal(false)
            }
          }}
        >
          <div className="modern-modal modern-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header delete-header">
              <div className="modal-header-content">
                <div className="modal-icon danger">
                  <FaTrash />
                </div>
                <div>
                  <h2>تأكيد الحذف</h2>
                  <p>هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
              <button
                className="btn-close-modern"
                onClick={() => setShowDeleteModal(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="modern-modal-body">
              <div className="delete-warning-modern">
                <div className="warning-icon">
                  <FaExclamationTriangle />
                </div>
                <div className="warning-content">
                  <h3>هل أنت متأكد من حذف الامتحان؟</h3>
                  <p className="quiz-name">"{selectedQuiz?.title}"</p>
                  <div className="warning-message">
                    <FaExclamationTriangle className="icon-small" />
                    <span>سيتم حذف جميع الأسئلة والمحاولات المرتبطة بهذا الامتحان بشكل نهائي</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modern-modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes className="me-2" />
                إلغاء
              </button>
              <button type="button" className="btn-modal-danger" onClick={handleDeleteQuiz}>
                <FaTrash className="me-2" />
                حذف الامتحان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizList