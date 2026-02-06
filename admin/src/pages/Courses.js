import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminCoursesService from '../api/admin/courses.service'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import 'bootstrap/dist/css/bootstrap.min.css'
import useAuthStore from '../store/authStore'

const CoursesManagement = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [courses, setCourses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    price: '',
    category: '',
    difficulty_level: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [submittingCourseId, setSubmittingCourseId] = useState(null)

  const categoryOptions = [
    { value: 'Programming', label: 'البرمجة' },
    { value: 'Design', label: 'التصميم' },
    { value: 'Business', label: 'الأعمال' },
    { value: 'Marketing', label: 'التسويق' },
    { value: 'Languages', label: 'اللغات' },
    { value: 'Science', label: 'العلوم' }
  ]

  const difficultyOptions = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ]

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const fetchCourses = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const response = await adminCoursesService.getAllCourses(page, search, '', '')

      setCourses(response.results || [])
      setTotalCount(response.count || 0)

      const itemsPerPage = response.results?.length || 10
      const pages = Math.ceil((response.count || 0) / itemsPerPage)
      setTotalPages(pages > 0 ? pages : 1)
    } catch (error) {
      showAlert('error', 'فشل في تحميل الكورسات')
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses(currentPage, appliedSearch)
  }, [currentPage, appliedSearch])

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message })
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    setAppliedSearch(searchTerm.trim())
  }

  const handleCourseClick = (courseId, courseName) => {
    navigate(
      `/${user.role}/sections?course=${courseId}&courseName=${encodeURIComponent(courseName)}`
    )
  }

  const openCreateModal = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      price: '',
      category: '',
      tags: []
    })
    setTagInput('')
    setModalMode('create')
    setShowModal(true)
  }

  const openEditModal = (course) => {
    setFormData({
      id: course.id,
      title: course.title || '',
      description: course.description || '',
      price: course.price || '',
      category: course.category || '',
      tags: course.tags || []
    })
    setTagInput('')
    setModalMode('edit')
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      showAlert('warning', 'يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setSubmitLoading(true)

      const submitData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags
      }

      if (modalMode === 'edit') {
        await adminCoursesService.updateCourse(formData.id, submitData)
        showAlert('success', 'تم تحديث الكورس بنجاح')
      } else {
        await adminCoursesService.createCourse(submitData)
        showAlert('success', 'تم إنشاء الكورس بنجاح')
      }

      setShowModal(false)
      fetchCourses(currentPage, appliedSearch)
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail ||
        (modalMode === 'edit' ? 'فشل في تحديث الكورس' : 'فشل في إنشاء الكورس')
      showAlert('error', errorMessage)
      console.error('Error submitting course:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const openDeleteModal = (course) => {
    setCourseToDelete(course)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!courseToDelete) return

    try {
      setSubmitLoading(true)
      await adminCoursesService.deleteCourse(courseToDelete.id)
      showAlert('success', 'تم حذف الكورس بنجاح')
      setShowDeleteModal(false)
      setCourseToDelete(null)

      if (courses.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        fetchCourses(currentPage, appliedSearch)
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'فشل في حذف الكورس'
      showAlert('error', errorMessage)
      console.error('Error deleting course:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleSubmitForApproval = async (courseId) => {
    try {
      setSubmittingCourseId(courseId)
      await adminCoursesService.submitCourseForApproval(courseId)

      if (user?.role === 'admin') {
        await adminCoursesService.approveCourse(courseId)
        showAlert('success', 'تم إرسال الكورس للموافقة والموافقة عليه بنجاح')
      } else {
        showAlert('success', 'تم إرسال الكورس للموافقة بنجاح')
      }

      fetchCourses(currentPage, appliedSearch)
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'فشل في إرسال الكورس للموافقة'
      showAlert('error', errorMessage)
    } finally {
      setSubmittingCourseId(null)
    }
  }

  const handleAdminDenay = async (courseId) => {
    try {
      setSubmittingCourseId(courseId)
      if (user?.role === 'admin') {
        await adminCoursesService.rejectCourse(courseId, 'admin reject it')
        showAlert('success', 'تم رفض الكورس بنجاح')
      }
      fetchCourses(currentPage, appliedSearch)
    } catch (error) {
      showAlert('error', 'فشل في رفض الكورس')
    } finally {
      setSubmittingCourseId(null)
    }
  }

  const handleAdminApprove = async (courseId) => {
    try {
      setSubmittingCourseId(courseId)
      if (user?.role === 'admin') {
        await adminCoursesService.approveCourse(courseId)
        showAlert('success', 'تمت الموافقة عليه بنجاح')
      }
      fetchCourses(currentPage, appliedSearch)
    } catch (error) {
      showAlert('error', 'فشل في الموافقة')
    } finally {
      setSubmittingCourseId(null)
    }
  }

  const getDifficultyColor = () => '#00b894'

  return (
    <div
      className={`courses-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
    >
      <style>{customStyles}</style>

      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activePage="courses"
        darkMode={darkMode}
      />

      <div className="main-content">
        <div className="container-fluid mt-5 pt-4 px-3 px-md-4">
          {alert.show && (
            <div
              className={`alert alert-${alert.type === 'error' ? 'danger' : alert.type} alert-dismissible fade show custom-alert`}
            >
              {alert.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlert({ show: false, type: '', message: '' })}
              ></button>
            </div>
          )}

          <div className="page-header mb-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <h2 className="page-title mb-2">
                  <span className="title-icon">📚</span>
                  إدارة الكورسات
                </h2>
                <p className="page-subtitle mb-0">إنشاء وتحرير وإدارة الكورسات التعليمية</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button className="btn btn-primary btn-create" onClick={openCreateModal}>
                  <span className="me-2">+</span>
                  إنشاء كورس جديد
                </button>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="stats-card stats-card-1">
                <div className="stats-icon">📊</div>
                <div>
                  <div className="stats-number">{totalCount}</div>
                  <div className="stats-label">إجمالي الكورسات</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="stats-card stats-card-2">
                <div className="stats-icon">👥</div>
                <div>
                  <div className="stats-number">
                    {courses.reduce((sum, course) => sum + (course.student_count || 0), 0)}
                  </div>
                  <div className="stats-label">إجمالي الطلاب</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="stats-card stats-card-3">
                <div className="stats-icon">✨</div>
                <div>
                  <div className="stats-number">
                    {courses.filter((c) => c.status === 'published').length}
                  </div>
                  <div className="stats-label">الكورسات المنشورة</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="search-bar-container">
                <div className="input-group search-input-group">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="ابحث عن كورس بالاسم أو الوصف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    className="btn btn-primary search-btn"
                    type="button"
                    onClick={handleSearch}
                  >
                    <span className="me-2">🔍</span>
                    بحث
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="courses-container">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: '3rem', height: '3rem' }}
                >
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-3 text-muted">جاري تحميل الكورسات...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3">📭</div>
                <h4 className="empty-title mb-2">لا توجد كورسات</h4>
                <p className="empty-text">
                  {appliedSearch
                    ? 'لم يتم العثور على نتائج. جرب كلمات بحث أخرى'
                    : 'ابدأ بإنشاء كورس جديد'}
                </p>
              </div>
            ) : (
              <div className="row">
                {courses.map((course) => (
                  <div key={course.id} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                    <div
                      className="course-card"
                      onClick={(e) => {
                        if (
                          !e.target.closest('.btn-edit') &&
                          !e.target.closest('.btn-delete') &&
                          !e.target.closest('.btn-submit-approval')
                        ) {
                          handleCourseClick(course.id, course.title)
                        }
                      }}
                    >
                      <div className="course-image">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="course-img" />
                        ) : (
                          <div className="placeholder-image">
                            <span className="placeholder-icon">🎓</span>
                          </div>
                        )}
                        <div
                          className="difficulty-badge"
                          style={{ background: getDifficultyColor() }}
                        >
                          {course.category}
                        </div>
                        {course.status && (
                          <div className="status-badge">
                            {course.status === 'published'
                              ? '✅ منشور'
                              : course.status === 'draft'
                                ? '📝 مسودة'
                                : course.status === 'pending_approval'
                                  ? '⏳ قيد المراجعة'
                                  : course.status === 'rejected'
                                    ? 'رفض'
                                    : course.status}
                          </div>
                        )}
                      </div>

                      <div className="course-content">
                        <h5 className="course-title">{course.title}</h5>
                        <p className="course-description">{course.description}</p>

                        {course.tags && course.tags.length > 0 && (
                          <div className="tags-container">
                            {course.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="tag">
                                #{tag}
                              </span>
                            ))}
                            {course.tags.length > 3 && (
                              <span className="tag-more">+{course.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="course-footer">
                          <div className="course-price">
                            <span className="price-amount">
                              {parseFloat(course.price).toFixed(2)}
                            </span>
                            <span className="price-currency">جنيه</span>
                          </div>
                          <div className="course-actions">
                            <button
                              className="btn btn-sm btn-edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(course)
                              }}
                              title="تعديل"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-sm btn-delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteModal(course)
                              }}
                              title="حذف"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {course.status === 'draft' && (
                          <div className="mt-3">
                            <button
                              className="btn btn-warning btn-sm w-100 btn-submit-approval"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSubmitForApproval(course.id)
                              }}
                              disabled={submittingCourseId === course.id}
                            >
                              {submittingCourseId === course.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  جاري الإرسال...
                                </>
                              ) : (
                                <>
                                  <span className="me-2">📤</span>
                                  إرسال للموافقة
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {course.status === 'pending_approval' && user?.role === 'admin' && (
                          <>
                            <div className="mt-3">
                              <button
                                className="btn btn-danger btn-sm w-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAdminDenay(course.id)
                                }}
                                disabled={submittingCourseId === course.id}
                              >
                                {submittingCourseId === course.id ? 'جاري الرفض...' : '❌ رفض'}
                              </button>
                            </div>
                            <div className="mt-2">
                              <button
                                className="btn btn-success btn-sm w-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAdminApprove(course.id)
                                }}
                                disabled={submittingCourseId === course.id}
                              >
                                {submittingCourseId === course.id
                                  ? 'جاري الموافقة...'
                                  : '✅ موافقة'}
                              </button>
                            </div>
                          </>
                        )}

                        {course.student_count > 0 && (
                          <div className="student-count">👥 {course.student_count} طالب</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4 mb-5">
                <nav>
                  <ul className="pagination custom-pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        السابق
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? 'active' : ''}`}
                          >
                            <button className="page-link" onClick={() => setCurrentPage(page)}>
                              {page}
                            </button>
                          </li>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )
                      }
                      return null
                    })}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        التالي
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />

      {showModal && (
        <>
          <div className="modal show d-block modal-overlay" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content custom-modal">
                <div className="modal-header custom-modal-header">
                  <h5 className="modal-title">
                    {modalMode === 'create' ? '📝 إنشاء كورس جديد' : '✏️ تعديل الكورس'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        عنوان الكورس <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="أدخل عنوان الكورس"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        الوصف <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="أدخل وصف الكورس"
                        rows="4"
                        required
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          السعر (جنيه) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleFormChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          الصف <span className="text-danger">*</span>
                        </label>
                        <input
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          required
                          className="form-control"
                          placeholder="مثال: الصف الأول الثانوي"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">الوسوم (Tags)</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag()
                            }
                          }}
                          placeholder="أدخل وسم واضغط Enter"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={addTag}
                        >
                          إضافة
                        </button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="modal-tags-container">
                          {formData.tags.map((tag, idx) => (
                            <span key={idx} className="modal-tag">
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="remove-tag-btn"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <small className="text-muted">اختياري - أضف وسوماً لتسهيل البحث</small>
                    </div>

                    <div className="modal-footer custom-modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                        disabled={submitLoading}
                      >
                        إلغاء
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                        {submitLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            جاري الحفظ...
                          </>
                        ) : modalMode === 'create' ? (
                          '✅ إنشاء الكورس'
                        ) : (
                          '💾 حفظ التغييرات'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {showDeleteModal && (
        <>
          <div className="modal show d-block modal-overlay" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content custom-modal">
                <div className="modal-header custom-modal-header bg-danger">
                  <h5 className="modal-title text-white">⚠️ تأكيد الحذف</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body custom-modal-body">
                  <p className="fs-5 mb-3">هل أنت متأكد من حذف الكورس:</p>
                  <p className="fs-4 fw-bold text-primary mb-3">"{courseToDelete?.title}"</p>
                  <div className="alert alert-warning" role="alert">
                    <strong>⚠️ تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه!
                  </div>
                </div>
                <div className="modal-footer custom-modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={submitLoading}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        جاري الحذف...
                      </>
                    ) : (
                      '🗑️ نعم، احذف الكورس'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  )
}

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;900&display=swap');
  
  .courses-page {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    min-height: 100vh;
    background: #f8f9fa;
  }

  .courses-page.dark-mode {
    background: #1a1a2e;
    color: #fff;
  }

  .main-content {
    margin-right: 280px;
    margin-top: 76px;
    padding-bottom: 2rem;
    transition: margin-right 0.3s ease;
  }

  .sidebar-collapsed .main-content {
    margin-right: 80px;
  }

  @media (max-width: 991.98px) {
    .main-content {
      margin-right: 0;
    }
    .sidebar-collapsed .main-content {
      margin-right: 0;
    }
  }

  .custom-alert {
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    border-radius: 10px;
    animation: slideInRight 0.4s ease-out;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .dark-mode .page-title {
    color: #fff;
  }

  .title-icon {
    font-size: 2.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
    color: #6c757d;
  }

  .dark-mode .page-subtitle {
    color: #adb5bd;
  }

  .btn-create {
    padding: 0.75rem 1.5rem;
    font-weight: bold;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
    transition: all 0.3s ease;
  }

  .btn-create:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
  }

  .stats-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    border-left: 4px solid;
  }

  .dark-mode .stats-card {
    background: #16213e;
  }

  .stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  }

  .stats-card-1 { border-color: #0d6efd; }
  .stats-card-2 { border-color: #198754; }
  .stats-card-3 { border-color: #ffc107; }

  .stats-icon {
    font-size: 2.5rem;
    line-height: 1;
  }

  .stats-number {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }

  .dark-mode .stats-number {
    color: #fff;
  }

  .stats-label {
    font-size: 0.9rem;
    color: #6c757d;
  }

  .dark-mode .stats-label {
    color: #adb5bd;
  }

  .search-bar-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .search-input-group {
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    border-radius: 10px;
    overflow: hidden;
    background: white;
  }

  .dark-mode .search-input-group {
    background: #16213e;
  }

  .search-input {
    border: none;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .dark-mode .search-input {
    background: #16213e;
    color: #fff;
  }

  .search-input:focus {
    box-shadow: none;
  }

  .search-btn {
    padding: 1rem 2rem;
    font-weight: bold;
    border: none;
  }

  .course-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .dark-mode .course-card {
    background: #16213e;
  }

  .course-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 35px rgba(0,0,0,0.15);
  }

  .course-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .course-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .course-card:hover .course-img {
    transform: scale(1.1);
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-icon {
    font-size: 4rem;
  }

  .difficulty-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    color: white;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  .status-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(255, 255, 255, 0.95);
    color: #2c3e50;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  }

  .course-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .course-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .dark-mode .course-title {
    color: #fff;
  }

  .course-description {
    color: #6c757d;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .dark-mode .course-description {
    color: #adb5bd;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag {
    background: #e7f1ff;
    color: #0d6efd;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .dark-mode .tag {
    background: #0d47a1;
    color: #90caf9;
  }

  .tag-more {
    background: #e9ecef;
    color: #6c757d;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .dark-mode .tag-more {
    background: #212529;
    color: #adb5bd;
  }

  .course-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 2px solid #f1f2f6;
    margin-top: auto;
  }

  .dark-mode .course-footer {
    border-color: #212529;
  }

  .course-price {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .price-amount {
    font-size: 1.75rem;
    font-weight: bold;
    color: #0d6efd;
  }

  .dark-mode .price-amount {
    color: #4dabf7;
  }

  .price-currency {
    font-size: 1rem;
    color: #6c757d;
  }

  .dark-mode .price-currency {
    color: #adb5bd;
  }

  .course-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-edit, .btn-delete {
    padding: 8px 15px;
    border-radius: 10px;
    font-size: 1.2rem;
    border: none;
    transition: all 0.3s ease;
  }

  .btn-edit {
    background: #198754;
    color: white;
  }

  .btn-edit:hover {
    background: #157347;
    transform: scale(1.1);
    box-shadow: 0 4px 10px rgba(25, 135, 84, 0.4);
  }

  .btn-delete {
    background: #dc3545;
    color: white;
  }

  .btn-delete:hover {
    background: #bb2d3b;
    transform: scale(1.1);
    box-shadow: 0 4px 10px rgba(220, 53, 69, 0.4);
  }

  .btn-submit-approval {
    font-weight: bold;
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .btn-submit-approval:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
  }

  .student-count {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
  }

  .dark-mode .student-count {
    color: #adb5bd;
  }

  .custom-pagination {
    gap: 0.5rem;
  }

  .custom-pagination .page-link {
    border: none;
    background: white;
    color: #0d6efd;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
  }

  .dark-mode .custom-pagination .page-link {
    background: #16213e;
    color: #4dabf7;
  }

  .custom-pagination .page-link:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  }

  .custom-pagination .page-item.active .page-link {
    background: #0d6efd;
    color: white;
    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.4);
  }

  .empty-state {
    padding: 4rem 2rem;
  }

  .empty-icon {
    font-size: 5rem;
  }

  .empty-title {
    color: #2c3e50;
    font-weight: bold;
  }

  .dark-mode .empty-title {
    color: #fff;
  }

  .empty-text {
    color: #6c757d;
  }

  .dark-mode .empty-text {
    color: #adb5bd;
  }

  .modal-overlay {
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .custom-modal .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .dark-mode .custom-modal .modal-content {
    background: #16213e;
    color: #fff;
  }

  .custom-modal-header {
    background: #0d6efd;
    color: white;
    padding: 1.5rem 2rem;
    border-bottom: none;
    border-radius: 20px 20px 0 0;
  }

  .custom-modal-header.bg-danger {
    background: #dc3545;
  }

  .custom-modal-body {
    padding: 2rem;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }

  .dark-mode .custom-modal-body .form-control,
  .dark-mode .custom-modal-body .form-select {
    background: #1a1a2e;
    color: #fff;
    border-color: #495057;
  }

  .dark-mode .custom-modal-body .form-control:focus,
  .dark-mode .custom-modal-body .form-select:focus {
    background: #1a1a2e;
    color: #fff;
    border-color: #4dabf7;
  }

  .modal-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .modal-tag {
    background: #0d6efd;
    color: white;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .remove-tag-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.3rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    line-height: 1;
  }

  .custom-modal-footer {
    border-top: 2px solid #f1f2f6;
    padding: 1.5rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .dark-mode .custom-modal-footer {
    border-color: #212529;
  }

  @media (max-width: 767.98px) {
    .page-title {
      font-size: 1.5rem;
    }

    .title-icon {
      font-size: 2rem;
    }

    .stats-number {
      font-size: 1.5rem;
    }

    .stats-icon {
      font-size: 2rem;
    }

    .btn-create {
      width: 100%;
      justify-content: center;
      display: flex !important;
    }

    .course-card {
      margin-bottom: 1rem;
    }
  }
`

export default CoursesManagement
