import React, { useState, useEffect, useCallback } from 'react'
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaBook } from 'react-icons/fa'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import adminCoursesService from '../api/admin/courses.service'
import useAuthStore from '../store/authStore'

const SectionsManagement = () => {
  const { user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Data States
  const [sections, setSections] = useState([])
  const [courses, setCourses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form States
  const [formData, setFormData] = useState({
    id: null,
    course: '',
    title: '',
    description: '',
    order: 1
  })

  // UI States
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [sectionToDelete, setSectionToDelete] = useState(null)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Fetch Courses for dropdown
  const fetchCourses = useCallback(async () => {
    try {
      const response = await adminCoursesService.getAllCourses(1, '', '', '')
      const approvedCourses = response.results.filter(
        (course) => course.status === 'published' || course.status === 'dra'
      )
      setCourses(approvedCourses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }, [])

  // Fetch Sections with proper pagination
  const fetchSections = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const response = await adminCoursesService.listSections(page)

        if (response && response.results) {
          setSections(response.results)
          setTotalCount(response.count || 0)

          // Calculate total pages based on backend pagination
          const pages = Math.ceil((response.count || 0) / itemsPerPage)
          setTotalPages(pages > 0 ? pages : 1)
        } else {
          setSections([])
          setTotalCount(0)
          setTotalPages(1)
        }
      } catch (error) {
        showAlert('error', 'فشل في تحميل الأقسام')
        console.error('Error fetching sections:', error)
        setSections([])
        setTotalCount(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage]
  )

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    fetchSections(currentPage)
  }, [currentPage, fetchSections])

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message })
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000)
  }

  const openCreateModal = () => {
    setFormData({
      id: null,
      course: '',
      title: '',
      description: '',
      order: 1
    })
    setModalMode('create')
    setShowModal(true)
  }

  const openEditModal = (section) => {
    setFormData({
      id: section.id,
      course: section.course || '',
      title: section.title || '',
      description: section.description || '',
      order: section.order || 1
    })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.course || !formData.title || !formData.description) {
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
        course: parseInt(formData.course),
        title: formData.title.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order)
      }

      if (modalMode === 'edit') {
        // Update existing section
        await adminCoursesService.updateSection(formData.id, submitData)
        showAlert('success', 'تم تحديث القسم بنجاح')
      } else {
        // Create new section
        await adminCoursesService.createSection(submitData)
        showAlert('success', 'تم إنشاء القسم بنجاح')

        // If we're not on page 1, go to page 1 to see the new item
        if (currentPage !== 1) {
          setCurrentPage(1)
        }
      }

      setShowModal(false)

      // Refresh the current page
      fetchSections(currentPage)
    } catch (error) {
      console.error('Error submitting section:', error)

      // Handle different error types
      let errorMessage = modalMode === 'edit' ? 'فشل في تحديث القسم' : 'فشل في إنشاء القسم'

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

  const openDeleteModal = (section) => {
    setSectionToDelete(section)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!sectionToDelete) return

    try {
      setSubmitLoading(true)
      await adminCoursesService.deleteSection(sectionToDelete.id)
      showAlert('success', 'تم حذف القسم بنجاح')
      setShowDeleteModal(false)
      setSectionToDelete(null)

      // If this was the last item on the page and we're not on page 1, go back one page
      if (sections.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Refresh the current page
        fetchSections(currentPage)
      }
    } catch (error) {
      console.error('Error deleting section:', error)

      let errorMessage = 'فشل في حذف القسم'

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

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId)
    return course ? course.title : 'غير محدد'
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  return (
    <div
      className={`sections-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
    >
      <style>{sectionStyles}</style>
      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div className="modal-overlay show" onClick={() => setShowModal(false)}></div>
          <div className="modal-custom show" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content-custom">
                <div className="modal-header-custom">
                  <h5 className="modal-title">
                    {modalMode === 'create' ? '✨ إنشاء قسم جديد' : '✏️ تعديل القسم'}
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
                    <div className="form-group">
                      <label className="form-label">
                        الكورس <span className="required">*</span>
                      </label>
                      <select
                        className="form-control-custom"
                        name="course"
                        value={formData.course}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">اختر الكورس</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        عنوان القسم <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control-custom"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="أدخل عنوان القسم"
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
                        placeholder="أدخل وصف القسم"
                        rows="4"
                        required
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        الترتيب <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control-custom"
                        name="order"
                        value={formData.order}
                        onChange={handleFormChange}
                        min="1"
                        required
                      />
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
                            إنشاء القسم
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
                  <p className="confirm-text">هل أنت متأكد من حذف القسم:</p>
                  <p className="confirm-item">"{sectionToDelete?.title}"</p>
                  <div className="alert-warning-custom">
                    <strong>⚠️ تحذير:</strong> سيتم حذف جميع المحاضرات المرتبطة بهذا القسم!
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
                        نعم، احذف القسم
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activePage="sections"
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
                    <FaLayerGroup />
                  </div>
                  <div>
                    <h1 className="page-title mb-2">إدارة الأقسام</h1>
                    <p className="page-subtitle mb-0">تنظيم وإدارة أقسام الكورسات التعليمية</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-md-end gap-1 d-flex">
                <button className="btn btn-create" onClick={openCreateModal}>
                  <FaPlus className="me-2" />
                  إنشاء قسم جديد
                </button>
                <a className="btn btn-lectures" href={`/${user.role}/lectures`}>
                  <FaPlus className="me-2" />
                  إدارة المحاضرات{' '}
                </a>
              </div>
            </div>
          </div>

          <div className="stats-row mb-5">
            <div className="stat-card">
              <div className="stat-icon stat-primary">
                <FaLayerGroup />
              </div>
              <div className="stat-content">
                <div className="stat-number">{totalCount}</div>
                <div className="stat-label">إجمالي الأقسام</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-success">
                <FaBook />
              </div>
              <div className="stat-content">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">الكورسات المتاحة</div>
              </div>
            </div>
          </div>

          <div className="sections-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-3">جاري تحميل الأقسام...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <h4 className="empty-title">لا توجد أقسام</h4>
                <p className="empty-text">ابدأ بإنشاء قسم جديد لتنظيم المحاضرات</p>
                <button className="btn btn-create mt-3" onClick={openCreateModal}>
                  <FaPlus className="me-2" />
                  إنشاء قسم جديد
                </button>
              </div>
            ) : (
              <div className="sections-grid">
                {sections.map((section) => (
                  <div key={section.id} className="section-card">
                    <div className="section-header">
                      <div className="section-order">#{section.order}</div>
                      <div className="section-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => openEditModal(section)}
                          title="تعديل"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(section)}
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="section-body">
                      <h3 className="section-title">{section.title}</h3>
                      <p className="section-description">{section.description}</p>
                      <div className="section-meta">
                        <span className="course-badge">
                          <FaBook className="me-1" />
                          {getCourseName(section.course)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  )
}

const sectionStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
  
  .sections-page {
    font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
    direction: rtl;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  }

  .sections-page.dark-mode {
    background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: white;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }

  .dark-mode .header-icon {
    background: linear-gradient(135deg, #4c63d2 0%, #5a3d8a 100%);
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .dark-mode .page-title {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: #64748b;
    font-weight: 500;
  }

  .dark-mode .page-subtitle {
    color: #94a3b8;
  }

  .btn-create {
    padding: 1rem 2rem;
    font-weight: 700;
    font-size: 1.05rem;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-lectures{
      padding: 1rem 2rem;
    font-weight: 700;
    font-size: 1.05rem;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #f5900c 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-create:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45);
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
    background: #1e293b;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .stat-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .dark-mode .stat-number {
    background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.95rem;
    color: #64748b;
    font-weight: 600;
  }

  .dark-mode .stat-label {
    color: #94a3b8;
  }

  .sections-container {
    background: white;
    padding: 2.5rem;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.05);
  }

  .dark-mode .sections-container {
    background: #1e293b;
    border-color: rgba(255,255,255,0.05);
  }

  .loading-state {
    text-align: center;
    padding: 5rem 2rem;
  }

  .loading-state p {
    margin-top: 1.5rem;
    color: #64748b;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .dark-mode .loading-state p {
    color: #94a3b8;
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
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .dark-mode .empty-title {
    color: #f1f5f9;
  }

  .empty-text {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 2rem;
  }

  .dark-mode .empty-text {
    color: #94a3b8;
  }

  .sections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .section-card {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 2px solid rgba(102, 126, 234, 0.1);
  }

  .dark-mode .section-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-color: rgba(129, 140, 248, 0.2);
  }

  .section-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 40px rgba(102, 126, 234, 0.25);
    border-color: rgba(102, 126, 234, 0.4);
  }

  .section-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(102, 126, 234, 0.15);
  }

  .dark-mode .section-header {
    border-color: rgba(129, 140, 248, 0.2);
  }

  .section-order {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .section-actions {
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

  .section-body {
    padding: 2rem 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  .dark-mode .section-title {
    color: #f1f5f9;
  }

  .section-description {
    font-size: 1rem;
    color: #64748b;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  .dark-mode .section-description {
    color: #94a3b8;
  }

  .section-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .course-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
    color: #1e293b;
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

  .dark-mode .pagination-custom button,
  .dark-mode .pagination-custom span {
    background: #1e293b;
    color: #f1f5f9;
  }

  .pagination-custom button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .pagination-custom li.active button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
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
    display: none;
  }

  .modal-overlay.show {
    display: block;
      pointer-events: all; /* Add this */

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

  .modal-custom {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1050;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    overflow-y: auto;
  }

  .modal-custom.show {
    display: flex;
      pointer-events: all; /* Add this */

  }

  .modal-dialog {
    width: 100%;
    max-width: 600px;
    margin: auto;
    position: relative;
    z-index: 1051;
  }

  .modal-dialog-sm {
    max-width: 450px;
  }

  .modal-content-custom {
    background: white;
    border-radius: 24px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    overflow: visible;
    position: relative;
  }

  .dark-mode .modal-content-custom {
    background: #1e293b;
  }

  .modal-header-custom {
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  }

  .btn-close-custom:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  .modal-body-custom {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    font-weight: 700;
    font-size: 1rem;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  .dark-mode .form-label {
    color: #f1f5f9;
  }

  .required {
    color: #ef4444;
    margin-right: 0.25rem;
  }

  .form-control-custom {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s ease;
    background: #f8fafc;
  }

  .dark-mode .form-control-custom {
    background: #0f172a;
    border-color: #334155;
    color: #f1f5f9;
  }

  .form-control-custom:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: white;
  }

  .dark-mode .form-control-custom:focus {
    background: #1e293b;
    border-color: #818cf8;
  }

  textarea.form-control-custom {
    resize: vertical;
    min-height: 120px;
  }

  .modal-footer-custom {
    padding: 1.5rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    background: #f8fafc;
    border-top: 2px solid #e2e8f0;
  }

  .dark-mode .modal-footer-custom {
    background: #0f172a;
    border-color: #334155;
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
    background: #e2e8f0;
    color: #475569;
  }

  .dark-mode .btn-secondary-custom {
    background: #334155;
    color: #cbd5e1;
  }

  .btn-secondary-custom:hover:not(:disabled) {
    background: #cbd5e1;
  }

  .btn-primary-custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-primary-custom:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
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
    color: #64748b;
    margin-bottom: 1rem;
  }

  .dark-mode .confirm-text {
    color: #94a3b8;
  }

  .confirm-item {
    font-size: 1.3rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 1.5rem;
  }

  .dark-mode .confirm-item {
    color: #818cf8;
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

    .sections-grid {
      grid-template-columns: 1fr;
    }

    .stats-row {
      grid-template-columns: 1fr;
    }
  }
`

export default SectionsManagement
