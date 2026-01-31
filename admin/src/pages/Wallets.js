import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import 'bootstrap/dist/css/bootstrap.min.css'
import adminPaymentsService from '../api/admin/payments.service'
import useAuthStore from '../store/authStore'

const Wallets = () => {
  // Layout States
  const { user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Data States
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositReason, setDepositReason] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState(null)

  // Toggle Sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Fetch Wallets
  const loadWallets = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true)
      const data = await adminPaymentsService.getAllWallets(page, searchTerm)
      setWallets(data.results || [])
      setTotalCount(data.count || 0)
      setNextPage(data.next)
      setPrevPage(data.previous)

      const itemsPerPage = data.results?.length || 10
      const pages = Math.ceil((data.count || 0) / itemsPerPage)
      setTotalPages(pages > 0 ? pages : 1)
    } catch (error) {
      console.error('Error loading wallets:', error)
      showAlert('Failed to load wallets', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWallets(currentPage, appliedSearch)
  }, [currentPage, appliedSearch])

  const handleSearch = () => {
    setCurrentPage(1)
    setAppliedSearch(search.trim())
  }

  const openDepositModal = (wallet) => {
    setSelectedWallet(wallet)
    setShowDepositModal(true)
    setDepositAmount('')
    setDepositReason('')
  }

  const closeDepositModal = () => {
    setShowDepositModal(false)
    setSelectedWallet(null)
    setDepositAmount('')
    setDepositReason('')
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showAlert('Please enter a valid amount', 'warning')
      return
    }
    if (!depositReason.trim()) {
      showAlert('Please provide a reason for the deposit', 'warning')
      return
    }

    try {
      setDepositLoading(true)
      await adminPaymentsService.manualDeposit(
        selectedWallet.id,
        parseFloat(depositAmount),
        depositReason,
        selectedWallet.student
      )
      showAlert('Deposit successful!', 'success')
      closeDepositModal()
      loadWallets(currentPage, appliedSearch)
    } catch (error) {
      console.error('Error making deposit:', error)
      showAlert('Failed to process deposit', 'danger')
    } finally {
      setDepositLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlertMessage({ message, type })
    setTimeout(() => setAlertMessage(null), 5000)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`
  }

  return (
    <div
      className={`wallets-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
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
        activePage="wallets"
        darkMode={darkMode}
      />

      <div className="main-content">
        <div className="container-fluid mt-5 pt-4 px-3 px-md-4">
          {alertMessage && (
            <div
              className={`alert alert-${alertMessage.type === 'error' ? 'danger' : alertMessage.type} alert-dismissible fade show custom-alert`}
            >
              {alertMessage.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlertMessage(null)}
              ></button>
            </div>
          )}

          <div className="page-header mb-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <h2 className="page-title mb-2">
                  <span className="title-icon">💰</span>
                  محافظ الطلاب
                </h2>
                <p className="page-subtitle mb-0">إدارة أرصدة الطلاب ومعالجة الإيداعات اليدوية</p>
              </div>
              <div className="col-md-6 text-md-end">
                <Link to={`/${user.role}/purchases`} className="btn btn-primary btn-create">
                  <span className="me-2">📊</span>
                  عرض المشتريات
                </Link>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="stats-card stats-card-1">
                <div className="stats-icon">👥</div>
                <div>
                  <div className="stats-number">{totalCount}</div>
                  <div className="stats-label">إجمالي المحافظ</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="stats-card stats-card-2">
                <div className="stats-icon">💵</div>
                <div>
                  <div className="stats-number">
                    ${wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0).toFixed(2)}
                  </div>
                  <div className="stats-label">إجمالي الرصيد</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="stats-card stats-card-3">
                <div className="stats-icon">📄</div>
                <div>
                  <div className="stats-number">{currentPage}</div>
                  <div className="stats-label">الصفحة الحالية</div>
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
                    placeholder="ابحث باسم الطالب أو البريد الإلكتروني..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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

          <div className="wallets-container">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: '3rem', height: '3rem' }}
                >
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-3 text-muted">جاري تحميل المحافظ...</p>
              </div>
            ) : wallets.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3">🔍</div>
                <h4 className="empty-title mb-2">لا توجد محافظ</h4>
                <p className="empty-text">
                  {appliedSearch
                    ? 'لم يتم العثور على نتائج. جرب كلمات بحث أخرى'
                    : 'لا توجد محافظ متاحة'}
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table wallets-table">
                    <thead>
                      <tr>
                        <th>الطالب</th>
                        <th>البريد الإلكتروني</th>
                        <th>الرصيد</th>
                        <th>تاريخ الإنشاء</th>
                        <th>آخر تحديث</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallets.map((wallet, index) => (
                        <tr key={wallet.id}>
                          <td>
                            <div className="student-name">{wallet.student_name}</div>
                          </td>
                          <td>
                            <div className="student-email">{wallet.student_email}</div>
                          </td>
                          <td>
                            <div className="balance-display">
                              ${parseFloat(wallet.balance).toFixed(2)}
                            </div>
                          </td>
                          <td>{formatDate(wallet.created_at)}</td>
                          <td>{formatDate(wallet.updated_at)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-deposit"
                              onClick={() => openDepositModal(wallet)}
                            >
                              💵 إيداع
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
              </>
            )}
          </div>
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />

      {/* Deposit Modal */}
      {showDepositModal && (
        <>
          <div className="modal show d-block modal-overlay" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content custom-modal">
                <div className="modal-header custom-modal-header">
                  <h5 className="modal-title">💵 إيداع يدوي</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeDepositModal}
                  ></button>
                </div>
                <div className="modal-body custom-modal-body">
                  {selectedWallet && (
                    <div className="mb-4 p-3 bg-light rounded">
                      <h6 className="mb-2">
                        <strong>الطالب:</strong> {selectedWallet.student_name}
                      </h6>
                      <p className="mb-2 text-muted">
                        <strong>البريد الإلكتروني:</strong> {selectedWallet.student_email}
                      </p>
                      <p className="mb-0">
                        <strong>الرصيد الحالي: </strong>
                        <span className="text-primary fw-bold">
                          ${parseFloat(selectedWallet.balance).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleDeposit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        مبلغ الإيداع <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        سبب الإيداع <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        value={depositReason}
                        onChange={(e) => setDepositReason(e.target.value)}
                        placeholder="أدخل سبب هذا الإيداع..."
                        rows="3"
                        required
                      ></textarea>
                    </div>

                    <div className="modal-footer custom-modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeDepositModal}
                        disabled={depositLoading}
                      >
                        إلغاء
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={depositLoading}>
                        {depositLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            جاري المعالجة...
                          </>
                        ) : (
                          '✅ إتمام الإيداع'
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
    </div>
  )
}

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;900&display=swap');
  
  .wallets-page {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    min-height: 100vh;
    background: #f8f9fa;
  }

  .wallets-page.dark-mode {
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
      margin-top: 76px;
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

  .page-header {
    margin-bottom: 2rem;
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

  .stats-card-1 {
    border-color: #0d6efd;
  }

  .stats-card-2 {
    border-color: #198754;
  }

  .stats-card-3 {
    border-color: #ffc107;
  }

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

  .wallets-container {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  }

  .dark-mode .wallets-container {
    background: #16213e;
  }

  .table-responsive {
    border-radius: 10px;
    overflow: hidden;
  }

  .wallets-table {
    margin: 0;
  }

  .wallets-table thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .wallets-table thead th {
    border: none;
    padding: 1.2rem 1rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .wallets-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: all 0.3s ease;
  }

  .dark-mode .wallets-table tbody tr {
    border-bottom-color: #2d3748;
  }

  .wallets-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.05);
  }

  .wallets-table tbody td {
    padding: 1.2rem 1rem;
    vertical-align: middle;
    border: none;
  }

  .dark-mode .wallets-table tbody td {
    color: #e2e8f0;
  }

  .student-name {
    font-weight: 700;
    color: #2c3e50;
  }

  .dark-mode .student-name {
    color: #fff;
  }

  .student-email {
    color: #6c757d;
    font-size: 0.9rem;
  }

  .dark-mode .student-email {
    color: #adb5bd;
  }

  .balance-display {
    font-family: 'Courier New', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    color: #198754;
  }

  .dark-mode .balance-display {
    color: #51cf66;
  }

  .btn-deposit {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-deposit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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

  .dark-mode .custom-modal-body .bg-light {
    background: #1a1a2e !important;
    color: #fff !important;
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

    .search-bar-container {
      max-width: 100%;
    }

    .wallets-table {
      font-size: 0.85rem;
    }
  }
`

export default Wallets
