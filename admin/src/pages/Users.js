import React, { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import UsersTable from '../components/UsersTable'
import Pagination from '../components/Pagination'
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa'
import '../styles/users.css'
import '../styles/modals.css'
import adminUsersService from '../api/admin/users.service'
import CreateUserModal from '../components/users/CreateUserModel'

const Users = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Data & UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [results, setResults] = useState([])
  const [pageSize, setPageSize] = useState(10) // track last known page size to compute total pages reliably

  const [searchTerm, setSearchTerm] = useState('') // client-side filter by name/email
  const [role, setRole] = useState('') // optional server-side role filter
  const [statusFilter, setStatusFilter] = useState('') // client-side status filter: '', 'active', 'inactive'

  const totalPages = useMemo(() => {
    if (count <= 0) return 1
    return Math.max(1, Math.ceil(count / Math.max(1, pageSize)))
  }, [count, pageSize])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Fetch profiles when page or role changes
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await adminUsersService.getAllUsers(page, '', role)
        if (!mounted) return
        setCount(data?.count || 0)
        const rows = Array.isArray(data?.results) ? data.results : []
        setResults(rows)
        if (rows.length > 0) setPageSize(rows.length)
      } catch (e) {
        if (!mounted) return
        setError('تعذر تحميل المستخدمين. الرجاء المحاولة لاحقاً.')
        setResults([])
        // keep previous count so pagination can recover; if API fails, avoid jumping page
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [page, role])

  // Keep current page within valid range when totalPages changes (e.g., after filters)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
    if (page < 1) {
      setPage(1)
    }
  }, [totalPages, page])

  // Client-side filters (current page results only)
  const filteredResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return results.filter((u) => {
      const email = (u.email || '').toLowerCase()
      const isActive = u.is_active !== false // default true if missing
      const role = u.role_display
      const matchesStatus =
        statusFilter === '' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive)
      return matchesStatus
    })
  }, [results, searchTerm, statusFilter])

  // Map API to table model expected by UsersTable
  const tableUsers = useMemo(() => {
    return filteredResults.map((u) => ({
      id: u.id,
      role: u.role || '-',
      email: u.email,
      status: u.is_active === false ? 'غير نشط' : 'نشط'
    }))
  }, [filteredResults])

  const handlePageChange = (p) => {
    // Guard navigation beyond bounds
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
  }

  const handleRoleChange = (e) => {
    setRole(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
  }

  const onEdit = (user) => {
    setResults((prev) => prev.map((u) => (u.id === user.id ? user : u)))
  }

  const onDelete = (user) => {
    setResults((prev) => prev.filter((u) => u.id !== user.id))
  }

  return (
    <div
      className={`users-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
    >
      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={(user) => {
          // Optionally refresh users list
          setResults((prev) => [user, ...prev])
          setCount((prev) => prev + 1)
        }}
      />
      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} darkMode={darkMode} />

      <div className="main-content">
        <div className="container mt-5 pt-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold m-0">إدارة المستخدمين</h5>
            <div className="text-muted small">
              {loading ? 'جاري التحميل...' : `إجمالي: ${count}`}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="search-filter-section">
            <div className="row mb-3">
              <div className="col-lg-8 col-md-6 col-12">
                <div className="d-flex flex-column flex-md-row gap-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="البحث عن المستخدمين بالاسم أو البريد..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <span className="input-group-text">
                      <FaFilter />
                    </span>
                    <select className="form-select" value={role} onChange={handleRoleChange}>
                      <option value="">كل الأدوار</option>
                      <option value="admin">مسؤول</option>
                      <option value="teacher">معلم</option>
                      <option value="student">طالب</option>
                    </select>
                  </div>

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-12 mt-2 mt-md-0">
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FaPlus className="ms-1" />
                    إضافة مستخدم
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded shadow-sm p-2 p-md-3">
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" />
                <p className="mt-2 text-muted">جاري تحميل المستخدمين...</p>
              </div>
            ) : tableUsers.length > 0 ? (
              <UsersTable
                users={tableUsers}
                onEdit={onEdit}
                onDelete={onDelete}
                currentPage={page}
                itemsPerPage={pageSize}
                darkMode={darkMode}
              />
            ) : (
              <div className="text-center py-5">
                <h5 className="text-muted">لا يوجد مستخدمين حالياً</h5>
                <p className="text-muted">غيّر الصفحة أو عوامل التصفية للمحاولة مرة أخرى</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {count > 0 && totalPages > 1 && (
            <div className="pagination-container mt-3">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                darkMode={darkMode}
              />
            </div>
          )}
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
    </div>
  )
}
export default Users
