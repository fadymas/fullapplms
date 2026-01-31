import React, { useState, useEffect, useCallback } from 'react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaTasks,
  FaLock,
  FaUnlock
} from 'react-icons/fa'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import adminCoursesService from '../api/admin/courses.service'

const LecturesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Data States
  const [lectures, setLectures] = useState([])
  const [sections, setSections] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form States
  const [formData, setFormData] = useState({
    id: null,
    section: '',
    title: '',
    description: '',
    content: '',
    video_url: '',
    lecture_type: 'video',
    prerequisite: '',
    order: 1,
    is_free: false,
    duration_minutes: ''
  })

  // UI States
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [lectureToDelete, setLectureToDelete] = useState(null)

  const lectureTypes = [
    { value: 'video', label: 'فيديو', icon: FaVideo },
    { value: 'article', label: 'مقالة', icon: FaFileAlt },
    { value: 'quiz', label: 'اختبار', icon: FaQuestionCircle },
    { value: 'assignment', label: 'مهمة', icon: FaTasks }
  ]

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const fetchSections = useCallback(async () => {
    try {
      const response = await adminCoursesService.listSections(1)
      setSections(response.results || [])
    } catch (error) {
      console.error('Error fetching sections:', error)
      setSections([])
    }
  }, [])

  const fetchLectures = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const response = await adminCoursesService.listLectures(page)

        if (response && response.results) {
          setLectures(response.results)
          setTotalCount(response.count || 0)

          const pages = Math.ceil((response.count || 0) / itemsPerPage)
          setTotalPages(pages > 0 ? pages : 1)
        } else {
          setLectures([])
          setTotalCount(0)
          setTotalPages(1)
        }
      } catch (error) {
        showAlert('error', 'فشل في تحميل المحاضرات')
        console.error('Error fetching lectures:', error)
        setLectures([])
        setTotalCount(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage]
  )

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  useEffect(() => {
    fetchLectures(currentPage)
  }, [currentPage, fetchLectures])

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message })
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000)
  }

  const openCreateModal = () => {
    setFormData({
      id: null,
      section: '',
      title: '',
      description: '',
      content: '',
      video_url: '',
      lecture_type: 'video',
      prerequisite: '',
      order: 1,
      is_free: false,
      duration_minutes: ''
    })
    setModalMode('create')
    setShowModal(true)
  }

  const openEditModal = (lecture) => {
    setFormData({
      id: lecture.id,
      section: lecture.section || '',
      title: lecture.title || '',
      description: lecture.description || '',
      content: lecture.content || '',
      video_url: lecture.video_url || '',
      lecture_type: lecture.lecture_type || 'video',
      prerequisite: lecture.prerequisite || '',
      order: lecture.order || 1,
      is_free: lecture.is_free || false,
      duration_minutes: lecture.duration_minutes || ''
    })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.section || !formData.title || !formData.description) {
      showAlert('warning', 'يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (!formData.order || formData.order < 1) {
      showAlert('warning', 'يرجى إدخال ترتيب صحيح')
      return
    }

    try {
      setSubmitLoading(true)

      // Prepare data for submission
      const submitData = {
        section: parseInt(formData.section),
        title: formData.title.trim(),
        description: formData.description.trim(),
        lecture_type: formData.lecture_type,
        order: parseInt(formData.order),
        is_free: Boolean(formData.is_free)
      }

      // Add optional fields only if they have values
      if (formData.content && formData.content.trim()) {
        submitData.content = formData.content.trim()
      }

      if (formData.video_url && formData.video_url.trim()) {
        submitData.video_url = formData.video_url.trim()
      }

      if (formData.prerequisite) {
        submitData.prerequisite = parseInt(formData.prerequisite)
      } else {
        submitData.prerequisite = null
      }

      if (formData.duration_minutes) {
        submitData.duration_minutes = parseInt(formData.duration_minutes)
      } else {
        submitData.duration_minutes = null
      }

      if (modalMode === 'edit') {
        await adminCoursesService.updateLecture(formData.id, submitData)
        showAlert('success', 'تم تحديث المحاضرة بنجاح')
      } else {
        await adminCoursesService.createLecture(submitData)
        showAlert('success', 'تم إنشاء المحاضرة بنجاح')

        if (currentPage !== 1) {
          setCurrentPage(1)
        }
      }

      setShowModal(false)
      fetchLectures(currentPage)
    } catch (error) {
      console.error('Error submitting lecture:', error)

      let errorMessage = modalMode === 'edit' ? 'فشل في تحديث المحاضرة' : 'فشل في إنشاء المحاضرة'

      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }

      showAlert('error', errorMessage)
    } finally {
      setSubmitLoading(false)
    }
  }

  const openDeleteModal = (lecture) => {
    setLectureToDelete(lecture)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!lectureToDelete) return

    try {
      setSubmitLoading(true)
      await adminCoursesService.deleteLecture(lectureToDelete.id)
      showAlert('success', 'تم حذف المحاضرة بنجاح')
      setShowDeleteModal(false)
      setLectureToDelete(null)

      if (lectures.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        fetchLectures(currentPage)
      }
    } catch (error) {
      console.error('Error deleting lecture:', error)

      let errorMessage = 'فشل في حذف المحاضرة'

      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }

      showAlert('error', errorMessage)
    } finally {
      setSubmitLoading(false)
    }
  }

  const getSectionName = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId)
    return section ? section.title : 'غير محدد'
  }

  const getLectureTypeInfo = (type) => {
    const typeInfo = lectureTypes.find((t) => t.value === type)
    return typeInfo || { label: type, icon: FaFileAlt }
  }

  const getAvailableLecturesForPrerequisite = () => {
    if (modalMode === 'edit') {
      return lectures.filter((lec) => lec.id !== formData.id)
    }
    return lectures
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  return (
    <div
      className={`lectures-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
    >
      <style>{lectureStyles}</style>

      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activePage="lectures"
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

          <div className="page-header mb-5">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="header-content">
                  <div className="header-icon">
                    <FaVideo />
                  </div>
                  <div>
                    <h1 className="page-title mb-2">إدارة المحاضرات</h1>
                    <p className="page-subtitle mb-0">إنشاء وتنظيم محتوى الكورسات التعليمية</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-md-end">
                <button className="btn btn-create" onClick={openCreateModal}>
                  <FaPlus className="me-2" />
                  إضافة محاضرة جديدة
                </button>
              </div>
            </div>
          </div>

          <div className="stats-row mb-5">
            <div className="stat-card">
              <div className="stat-icon stat-primary">
                <FaVideo />
              </div>
              <div className="stat-content">
                <div className="stat-number">{totalCount}</div>
                <div className="stat-label">إجمالي المحاضرات</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-success">
                <FaUnlock />
              </div>
              <div className="stat-content">
                <div className="stat-number">{lectures.filter((l) => l.is_free).length}</div>
                <div className="stat-label">محاضرات مجانية</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-warning">
                <FaLock />
              </div>
              <div className="stat-content">
                <div className="stat-number">{lectures.filter((l) => !l.is_free).length}</div>
                <div className="stat-label">محاضرات مدفوعة</div>
              </div>
            </div>
          </div>

          <div className="lectures-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-3">جاري تحميل المحاضرات...</p>
              </div>
            ) : lectures.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎥</div>
                <h4 className="empty-title">لا توجد محاضرات</h4>
                <p className="empty-text">ابدأ بإضافة محاضرات جديدة لإثراء المحتوى التعليمي</p>
                <button className="btn btn-create mt-3" onClick={openCreateModal}>
                  <FaPlus className="me-2" />
                  إضافة محاضرة جديدة
                </button>
              </div>
            ) : (
              <div className="lectures-grid">
                {lectures.map((lecture) => {
                  const typeInfo = getLectureTypeInfo(lecture.lecture_type)
                  const TypeIcon = typeInfo.icon

                  return (
                    <div key={lecture.id} className="lecture-card">
                      <div className="lecture-header">
                        <div className="lecture-type-badge">
                          <TypeIcon className="me-1" />
                          {typeInfo.label}
                        </div>
                        <div className="lecture-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => openEditModal(lecture)}
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => openDeleteModal(lecture)}
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <div className="lecture-body">
                        <div className="lecture-order">#{lecture.order}</div>
                        <h3 className="lecture-title">{lecture.title}</h3>
                        <p className="lecture-description">{lecture.description}</p>

                        <div className="lecture-meta">
                          <div className="meta-item">
                            <strong>القسم:</strong> {getSectionName(lecture.section)}
                          </div>
                          {lecture.duration_minutes && (
                            <div className="meta-item">
                              <strong>المدة:</strong> {lecture.duration_minutes} دقيقة
                            </div>
                          )}
                        </div>

                        <div className="lecture-footer">
                          <div className="access-badge">
                            {lecture.is_free ? (
                              <>
                                <FaUnlock className="me-1" />
                                مجانية
                              </>
                            ) : (
                              <>
                                <FaLock className="me-1" />
                                مدفوعة
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <nav>
                  <ul className="pagination-custom">
                    <li className={currentPage === 1 ? 'disabled' : ''}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
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
                          <li key={page} className={currentPage === page ? 'active' : ''}>
                            <button onClick={() => handlePageChange(page)}>{page}</button>
                          </li>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <li key={page} className="disabled">
                            <span>...</span>
                          </li>
                        )
                      }
                      return null
                    })}

                    <li className={currentPage === totalPages ? 'disabled' : ''}>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal-overlay show"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false)
              }
            }}
          ></div>
          <div className="modal-custom show">
            <div className="modal-dialog modal-dialog-lg">
              <div className="modal-content-custom">
                <div className="modal-header-custom">
                  <h5 className="modal-title">
                    {modalMode === 'create' ? '✨ إضافة محاضرة جديدة' : '✏️ تعديل المحاضرة'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close-custom"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body-custom">
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          القسم <span className="required">*</span>
                        </label>
                        <select
                          className="form-control-custom"
                          name="section"
                          value={formData.section}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">اختر القسم</option>
                          {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                              {section.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          نوع المحاضرة <span className="required">*</span>
                        </label>
                        <select
                          className="form-control-custom"
                          name="lecture_type"
                          value={formData.lecture_type}
                          onChange={handleFormChange}
                          required
                        >
                          {lectureTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        عنوان المحاضرة <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control-custom"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="أدخل عنوان المحاضرة"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        الوصف <span className="required">*</span>
                      </label>
                      <textarea
                        className="form-control-custom"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="أدخل وصف المحاضرة"
                        rows="3"
                        required
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label className="form-label">المحتوى</label>
                      <textarea
                        className="form-control-custom"
                        name="content"
                        value={formData.content}
                        onChange={handleFormChange}
                        placeholder="أدخل محتوى المحاضرة (اختياري)"
                        rows="4"
                      ></textarea>
                    </div>

                    {formData.lecture_type === 'video' && (
                      <div className="form-group">
                        <label className="form-label">رابط الفيديو</label>
                        <input
                          type="url"
                          className="form-control-custom"
                          name="video_url"
                          value={formData.video_url}
                          onChange={handleFormChange}
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">الترتيب</label>
                        <input
                          type="number"
                          className="form-control-custom"
                          name="order"
                          value={formData.order}
                          onChange={handleFormChange}
                          min="1"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">المدة (بالدقائق)</label>
                        <input
                          type="number"
                          className="form-control-custom"
                          name="duration_minutes"
                          value={formData.duration_minutes}
                          onChange={handleFormChange}
                          min="1"
                          placeholder="مثال: 45"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">المحاضرة المطلوبة مسبقاً</label>
                      <select
                        className="form-control-custom"
                        name="prerequisite"
                        value={formData.prerequisite}
                        onChange={handleFormChange}
                      >
                        <option value="">لا يوجد</option>
                        {getAvailableLecturesForPrerequisite().map((lecture) => (
                          <option key={lecture.id} value={lecture.id}>
                            {lecture.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <div className="form-check-custom flex-column">
                        <input
                          type="checkbox"
                          className="form-check-input-custom"
                          id="is_free"
                          name="is_free"
                          checked={formData.is_free}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label-custom" htmlFor="is_free">
                          <FaUnlock className="me-2" />
                          محاضرة مجانية (يمكن الوصول إليها بدون شراء)
                        </label>
                      </div>
                    </div>

                    <div className="modal-footer-custom">
                      <button
                        type="button"
                        className="btn btn-secondary-custom"
                        onClick={() => setShowModal(false)}
                        disabled={submitLoading}
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary-custom"
                        disabled={submitLoading}
                      >
                        {submitLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            جاري الحفظ...
                          </>
                        ) : modalMode === 'create' ? (
                          <>
                            <FaPlus className="me-2" />
                            إضافة المحاضرة
                          </>
                        ) : (
                          <>
                            <FaEdit className="me-2" />
                            حفظ التغييرات
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="modal-overlay show" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal-custom show">
            <div className="modal-dialog modal-dialog-sm">
              <div className="modal-content-custom">
                <div className="modal-header-custom modal-header-danger">
                  <h5 className="modal-title">⚠️ تأكيد الحذف</h5>
                  <button
                    type="button"
                    className="btn-close-custom"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body-custom">
                  <p className="confirm-text">هل أنت متأكد من حذف المحاضرة:</p>
                  <p className="confirm-item">"{lectureToDelete?.title}"</p>
                  <div className="alert-warning-custom">
                    <strong>⚠️ تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه!
                  </div>
                </div>
                <div className="modal-footer-custom">
                  <button
                    type="button"
                    className="btn btn-secondary-custom"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={submitLoading}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-custom"
                    onClick={handleDelete}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <FaTrash className="me-2" />
                        نعم، احذف المحاضرة
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const lectureStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
  
  .lectures-page {
    font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
    direction: rtl;
    min-height: 100vh;
    background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
  }

  .lectures-page.dark-mode {
    background: linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%);
    color: #e4e6eb;
  }

  .main-content {
    margin-right: 280px;
    margin-top: 76px;
    padding-bottom: 3rem;
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
    min-width: 320px;
    max-width: 500px;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(10px);
  }

  @keyframes slideInRight {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .page-header {
    margin-bottom: 3rem;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .header-icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: white;
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  }

  .dark-mode .header-icon {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .dark-mode .page-title {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: #78716c;
    font-weight: 500;
  }

  .dark-mode .page-subtitle {
    color: #a8a29e;
  }

  .btn-create {
    padding: 1rem 2rem;
    font-weight: 700;
    font-size: 1.05rem;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-create:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(245, 158, 11, 0.5);
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .dark-mode .stat-card {
    background: #2d1b3d;
    border-color: rgba(255,255,255,0.05);
  }

  .stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: white;
  }

  .stat-primary {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .stat-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .stat-warning {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #292524 0%, #57534e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .dark-mode .stat-number {
    background: linear-gradient(135deg, #fafaf9 0%, #e7e5e4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.95rem;
    color: #78716c;
    font-weight: 600;
  }

  .dark-mode .stat-label {
    color: #a8a29e;
  }

  .lectures-container {
    background: white;
    padding: 2.5rem;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.05);
  }

  .dark-mode .lectures-container {
    background: #2d1b3d;
    border-color: rgba(255,255,255,0.05);
  }

  .loading-state {
    text-align: center;
    padding: 5rem 2rem;
  }

  .loading-state p {
    margin-top: 1.5rem;
    color: #78716c;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .dark-mode .loading-state p {
    color: #a8a29e;
  }

  .empty-state {
    text-align: center;
    padding: 5rem 2rem;
  }

  .empty-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #292524;
    margin-bottom: 1rem;
  }

  .dark-mode .empty-title {
    color: #fafaf9;
  }

  .empty-text {
    font-size: 1.1rem;
    color: #78716c;
    margin-bottom: 2rem;
  }

  .dark-mode .empty-text {
    color: #a8a29e;
  }

  .lectures-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem;
  }

  .lecture-card {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 2px solid rgba(245, 158, 11, 0.2);
  }

  .dark-mode .lecture-card {
    background: linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .lecture-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 40px rgba(245, 158, 11, 0.3);
    border-color: rgba(245, 158, 11, 0.5);
  }

  .lecture-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(245, 158, 11, 0.2);
  }

  .dark-mode .lecture-header {
    border-color: rgba(251, 191, 36, 0.3);
  }

  .lecture-type-badge {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  .lecture-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .btn-edit {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-edit:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  .btn-delete {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .btn-delete:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }

  .lecture-body {
    padding: 2rem 1.5rem;
    position: relative;
  }

  .lecture-order {
    position: absolute;
    top: -1rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .lecture-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: #292524;
    margin-bottom: 1rem;
    margin-top: 1rem;
    line-height: 1.3;
  }

  .dark-mode .lecture-title {
    color: #fafaf9;
  }

  .lecture-description {
    font-size: 1rem;
    color: #78716c;
    line-height: 1.7;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .dark-mode .lecture-description {
    color: #a8a29e;
  }

  .lecture-meta {
    margin-bottom: 1.5rem;
  }

  .meta-item {
    font-size: 0.9rem;
    color: #78716c;
    margin-bottom: 0.5rem;
  }

  .dark-mode .meta-item {
    color: #a8a29e;
  }

  .meta-item strong {
    color: #292524;
    font-weight: 700;
  }

  .dark-mode .meta-item strong {
    color: #fafaf9;
  }

  .lecture-footer {
    padding-top: 1rem;
    border-top: 2px solid rgba(245, 158, 11, 0.2);
  }

  .dark-mode .lecture-footer {
    border-color: rgba(251, 191, 36, 0.3);
  }

  .access-badge {
    background: white;
    color: #292524;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .dark-mode .access-badge {
    background: #1a1625;
    color: #fafaf9;
  }

  .pagination-wrapper {
    margin-top: 3rem;
    display: flex;
    justify-content: center;
  }

  .pagination-custom {
    display: flex;
    gap: 0.75rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .pagination-custom li {
    list-style: none;
  }

  .pagination-custom button,
  .pagination-custom span {
    min-width: 48px;
    height: 48px;
    border: none;
    background: white;
    color: #292524;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 0 1rem;
  }
    /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1040; /* Lower than the modal */
    display: none;
  }

  .modal-overlay.show {
    display: block;
  }

  /* Modal Container */
  .modal-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1050; /* Higher than the overlay and sidebar */
    padding: 1rem;
    overflow-y: auto;
    pointer-events: none; /* Allows clicking overlay through gaps */
  }

  .modal-custom.show {
    display: flex;
  }

  .modal-dialog {
    width: 100%;
    max-width: 600px;
    pointer-events: auto; /* Re-enables interaction inside the modal */
    animation: modalSlideUp 0.3s ease-out;
  }

  .modal-dialog-sm {
    max-width: 400px;
  }

  @keyframes modalSlideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Modal Styling */
  .modal-content-custom {
    background: white;
    border-radius: 24px;
    border: none;
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    overflow: hidden;
  }

  .dark-mode .modal-content-custom {
    background: #1e293b;
    color: #f1f5f9;
  }

  .modal-header-custom {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .modal-body-custom {
    padding: 1.5rem;
  }

  .dark-mode .pagination-custom button,
  .dark-mode .pagination-custom span {
    background: #2d1b3d;
    color: #fafaf9;
  }

  .pagination-custom button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .pagination-custom li.active button {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
  }

  .pagination-custom li.disabled button,
  .pagination-custom li.disabled span {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    z-index: 1040;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .modal-overlay.show {
    opacity: 1;
  }

  .modal-custom {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    padding: 1rem;
  }

  .modal-custom.show {
    opacity: 1;
  }

  .modal-dialog {
    width: 100%;
    max-width: 600px;
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .modal-dialog-lg {
    max-width: 800px;
  }

  .modal-custom.show .modal-dialog {
    transform: scale(1);
  }

  .modal-dialog-sm {
    max-width: 450px;
  }

  .modal-content-custom {
    background: white;
    border-radius: 24px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .dark-mode .modal-content-custom {
    background: #2d1b3d;
  }

  .modal-header-custom {
    padding: 2rem;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .modal-header-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
  }

  .btn-close-custom {
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: white;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    line-height: 1;
    flex-shrink: 0;
  }

  .btn-close-custom:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  .modal-body-custom {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    font-weight: 700;
    font-size: 1rem;
    color: #292524;
    margin-bottom: 0.75rem;
  }

  .dark-mode .form-label {
    color: #fafaf9;
  }

  .required {
    color: #ef4444;
    margin-right: 0.25rem;
  }

  .form-control-custom {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid #e7e5e4;
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s ease;
    background: #fafaf9;
  }

  .dark-mode .form-control-custom {
    background: #1a1625;
    border-color: #44403c;
    color: #fafaf9;
  }

  .form-control-custom:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
    background: white;
  }

  .dark-mode .form-control-custom:focus {
    background: #2d1b3d;
    border-color: #fbbf24;
  }

  textarea.form-control-custom {
    resize: vertical;
    min-height: 100px;
  }

  .form-check-custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #fafaf9;
    border-radius: 12px;
    border: 2px solid #e7e5e4;
    transition: all 0.3s ease;
  }

  .dark-mode .form-check-custom {
    background: #1a1625;
    border-color: #44403c;
  }

  .form-check-custom:hover {
    border-color: #f59e0b;
  }

  .form-check-input-custom {
    width: 24px;
    height: 24px;
    cursor: pointer;
    border-radius: 6px;
    border: 2px solid #d6d3d1;
    flex-shrink: 0;
  }

  .form-check-input-custom:checked {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: #f59e0b;
  }

  .form-check-label-custom {
    font-size: 1rem;
    font-weight: 600;
    color: #292524;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin: 0;
  }

  .dark-mode .form-check-label-custom {
    color: #fafaf9;
  }

  .modal-footer-custom {
    padding: 1.5rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    background: #fafaf9;
    border-top: 2px solid #e7e5e4;
    flex-shrink: 0;
  }

  .dark-mode .modal-footer-custom {
    background: #1a1625;
    border-color: #44403c;
  }

  .btn-secondary-custom,
  .btn-primary-custom,
  .btn-danger-custom {
    padding: 0.875rem 1.75rem;
    border-radius: 12px;
    border: none;
    font-weight: 700;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary-custom {
    background: #e7e5e4;
    color: #57534e;
  }

  .dark-mode .btn-secondary-custom {
    background: #44403c;
    color: #d6d3d1;
  }

  .btn-secondary-custom:hover:not(:disabled) {
    background: #d6d3d1;
  }

  .btn-primary-custom {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  .btn-primary-custom:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
  }

  .btn-danger-custom {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .btn-danger-custom:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
  }

  .btn-secondary-custom:disabled,
  .btn-primary-custom:disabled,
  .btn-danger-custom:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .confirm-text {
    font-size: 1.1rem;
    color: #78716c;
    margin-bottom: 1rem;
  }

  .dark-mode .confirm-text {
    color: #a8a29e;
  }

  .confirm-item {
    font-size: 1.3rem;
    font-weight: 700;
    color: #f59e0b;
    margin-bottom: 1.5rem;
  }

  .dark-mode .confirm-item {
    color: #fbbf24;
  }

  .alert-warning-custom {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #fbbf24;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    color: #92400e;
  }

  .dark-mode .alert-warning-custom {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
    border-color: #d97706;
    color: #fde68a;
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 1.8rem;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      font-size: 1.6rem;
    }

    .lectures-grid {
      grid-template-columns: 1fr;
    }

    .stats-row {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
`

export default LecturesManagement
