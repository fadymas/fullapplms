// src/pages/teacher/Reports.jsx
import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import adminReportsService from '../api/admin/reports.service'
import {
  FaChartLine,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTicketAlt,
  FaUndo,
  FaExclamationTriangle,
  FaFileExport,
  FaFilePdf,
  FaFileCsv,
  FaFileCode,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import '../styles/reports.css'

const Reports = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('top-courses')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(null)

  // Data states
  const [topCoursesData, setTopCoursesData] = useState(null)
  const [studentActivityData, setStudentActivityData] = useState(null)
  const [instructorRevenueData, setInstructorRevenueData] = useState(null)
  const [rechargeCodesData, setRechargeCodesData] = useState(null)
  const [refundsData, setRefundsData] = useState(null)
  const [failedTransactionsData, setFailedTransactionsData] = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    limit: 10,
    orderBy: 'revenue',
    minPurchases: '',
    instructorId: '',
    page: 1
  })

  const [showFilters, setShowFilters] = useState(false)

  const tabs = [
    { id: 'top-courses', label: 'أفضل الكورسات', icon: FaChartLine },
    { id: 'student-activity', label: 'نشاط الطلاب', icon: FaUserGraduate },
    { id: 'instructor-revenue', label: 'إيرادات المدرسين', icon: FaChalkboardTeacher },
    { id: 'recharge-codes', label: 'أكواد الشحن', icon: FaTicketAlt },
    { id: 'refunds', label: 'المرتجعات', icon: FaUndo },
    { id: 'failed-transactions', label: 'المعاملات الفاشلة', icon: FaExclamationTriangle }
  ]

  useEffect(() => {
    loadReportData()
  }, [activeTab, filters])

  const loadReportData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'top-courses':
          const topCourses = await adminReportsService.getTopCourses(
            filters.limit,
            filters.orderBy,
            filters.startDate,
            filters.endDate
          )
          setTopCoursesData(topCourses)
          break
        case 'student-activity':
          const studentActivity = await adminReportsService.getStudentActivity(
            filters.page,
            filters.startDate,
            filters.endDate,
            filters.minPurchases
          )
          setStudentActivityData(studentActivity)
          break
        case 'instructor-revenue':
          const instructorRevenue = await adminReportsService.getInstructorRevenue(
            filters.page,
            filters.instructorId,
            filters.startDate,
            filters.endDate
          )
          setInstructorRevenueData(instructorRevenue)
          break
        case 'recharge-codes':
          const rechargeCodes = await adminReportsService.getRechargeCodesReport()
          setRechargeCodesData(rechargeCodes)
          break
        case 'refunds':
          const refunds = await adminReportsService.getRefundsReport(
            filters.page,
            filters.startDate,
            filters.endDate
          )
          setRefundsData(refunds)
          break
        case 'failed-transactions':
          const failedTransactions = await adminReportsService.getFailedTransactionsReport(
            filters.page,
            filters.startDate,
            filters.endDate
          )
          setFailedTransactionsData(failedTransactions)
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    setExporting(format)
    try {
      const reportTypeMap = {
        'top-courses': 'top_courses',
        'student-activity': 'student_activity',
        'instructor-revenue': 'instructor_revenue',
        'recharge-codes': 'recharge_codes',
        refunds: 'refunds',
        'failed-transactions': 'failed_transactions'
      }

      const blob = await adminReportsService.exportReport(
        reportTypeMap[activeTab],
        format,
        filters.startDate,
        filters.endDate
      )

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${activeTab}-report.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setExporting(null)
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      limit: 10,
      orderBy: 'revenue',
      minPurchases: '',
      instructorId: '',
      page: 1
    })
  }

  const renderTopCoursesReport = () => {
    if (!topCoursesData) return null

    return (
      <div className="report-content">
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-details">
              <h3>{topCoursesData.count}</h3>
              <p>إجمالي الكورسات</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaUserGraduate />
            </div>
            <div className="stat-details">
              <h3>
                {topCoursesData.results?.reduce((sum, course) => sum + course.total_purchases, 0)}
              </h3>
              <p>إجمالي المشتريات</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>
                $
                {topCoursesData.results
                  ?.reduce((sum, course) => sum + parseFloat(course.total_revenue), 0)
                  .toFixed(2)}
              </h3>
              <p>إجمالي الإيرادات</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>عنوان الكورس</th>
                <th>المدرس</th>
                <th>السعر</th>
                <th>المشتريات</th>
                <th>الإيرادات</th>
                <th>الطلاب النشطين</th>
              </tr>
            </thead>
            <tbody>
              {topCoursesData.results?.map((course, index) => (
                <tr key={course.course_id}>
                  <td>{index + 1}</td>
                  <td className="fw-bold">{course.course_title}</td>
                  <td>{course.instructor_name}</td>
                  <td>${course.price}</td>
                  <td>
                    <span className="badge bg-info">{course.total_purchases}</span>
                  </td>
                  <td className="text-success fw-bold">${course.total_revenue}</td>
                  <td>
                    <span className="badge bg-success">{course.active_students}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderStudentActivityReport = () => {
    if (!studentActivityData) return null

    return (
      <div className="report-content">
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUserGraduate />
            </div>
            <div className="stat-details">
              <h3>{studentActivityData.count}</h3>
              <p>إجمالي الطلاب</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>
                $
                {studentActivityData.results
                  ?.reduce((sum, s) => sum + parseFloat(s.total_spent), 0)
                  .toFixed(2)}
              </h3>
              <p>إجمالي الإنفاق</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>
                $
                {studentActivityData.results
                  ?.reduce((sum, s) => sum + parseFloat(s.wallet_balance), 0)
                  .toFixed(2)}
              </h3>
              <p>رصيد المحافظ</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>البريد الإلكتروني</th>
                <th>رصيد المحفظة</th>
                <th>إجمالي الإيداعات</th>
                <th>المشتريات</th>
                <th>الإنفاق</th>
                <th>المرتجعات</th>
                <th>صافي الإنفاق</th>
                <th>آخر نشاط</th>
              </tr>
            </thead>
            <tbody>
              {studentActivityData.results?.map((student) => (
                <tr key={student.student_id}>
                  <td className="fw-bold">{student.student_name}</td>
                  <td>{student.student_email}</td>
                  <td>${student.wallet_balance}</td>
                  <td className="text-success">${student.total_deposits}</td>
                  <td>
                    <span className="badge bg-primary">{student.total_purchases}</span>
                  </td>
                  <td>${student.total_spent}</td>
                  <td className="text-danger">${student.total_refunds}</td>
                  <td className="fw-bold">${student.net_spent}</td>
                  <td>{new Date(student.last_activity).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination(studentActivityData.count)}
      </div>
    )
  }

  const renderInstructorRevenueReport = () => {
    if (!instructorRevenueData) return null

    return (
      <div className="report-content">
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChalkboardTeacher />
            </div>
            <div className="stat-details">
              <h3>{instructorRevenueData.count}</h3>
              <p>عدد المدرسين</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>
                $
                {instructorRevenueData.results
                  ?.reduce((sum, i) => sum + parseFloat(i.total_revenue), 0)
                  .toFixed(2)}
              </h3>
              <p>إجمالي الإيرادات</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <FaUserGraduate />
            </div>
            <div className="stat-details">
              <h3>
                {instructorRevenueData.results?.reduce((sum, i) => sum + i.total_students, 0)}
              </h3>
              <p>إجمالي الطلاب</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>المدرس</th>
                <th>البريد الإلكتروني</th>
                <th>عدد الكورسات</th>
                <th>المشتريات</th>
                <th>الإيرادات</th>
                <th>الطلاب</th>
              </tr>
            </thead>
            <tbody>
              {instructorRevenueData.results?.map((instructor) => (
                <tr key={instructor.instructor_id}>
                  <td className="fw-bold">{instructor.instructor_name}</td>
                  <td>{instructor.instructor_email}</td>
                  <td>
                    <span className="badge bg-info">{instructor.total_courses}</span>
                  </td>
                  <td>
                    <span className="badge bg-primary">{instructor.total_purchases}</span>
                  </td>
                  <td className="text-success fw-bold">${instructor.total_revenue}</td>
                  <td>
                    <span className="badge bg-success">{instructor.total_students}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination(instructorRevenueData.count)}
      </div>
    )
  }

  const renderRechargeCodesReport = () => {
    if (!rechargeCodesData) return null

    return (
      <div className="report-content">
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon">
              <FaTicketAlt />
            </div>
            <div className="stat-details">
              <h3>{rechargeCodesData.summary.total_codes}</h3>
              <p>إجمالي الأكواد</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <FaTicketAlt />
            </div>
            <div className="stat-details">
              <h3>{rechargeCodesData.summary.used_codes}</h3>
              <p>الأكواد المستخدمة</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <FaTicketAlt />
            </div>
            <div className="stat-details">
              <h3>{rechargeCodesData.summary.unused_codes}</h3>
              <p>الأكواد غير المستخدمة</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>${rechargeCodesData.summary.total_value}</h3>
              <p>القيمة الإجمالية</p>
            </div>
          </div>
        </div>

        {rechargeCodesData.usage_by_creator && rechargeCodesData.usage_by_creator.length > 0 && (
          <div className="mb-4">
            <h5 className="section-title">الاستخدام حسب المنشئ</h5>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>المنشئ</th>
                    <th>الأكواد المنشأة</th>
                    <th>الأكواد المستخدمة</th>
                    <th>القيمة الإجمالية</th>
                    <th>القيمة المستخدمة</th>
                  </tr>
                </thead>
                <tbody>
                  {rechargeCodesData.usage_by_creator?.map((creator, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{creator.creator}</td>
                      <td>{creator.total_codes}</td>
                      <td>
                        <span className="badge bg-success">{creator.used_codes}</span>
                      </td>
                      <td>${creator.total_value}</td>
                      <td className="text-success">${creator.used_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {rechargeCodesData.recent_usage && rechargeCodesData.recent_usage.length > 0 && (
          <div>
            <h5 className="section-title">آخر الاستخدامات</h5>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>القيمة</th>
                    <th>المستخدم</th>
                    <th>تاريخ الاستخدام</th>
                  </tr>
                </thead>
                <tbody>
                  {rechargeCodesData.recent_usage?.map((usage, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{usage.code}</td>
                      <td className="text-success">${usage.value}</td>
                      <td>{usage.user}</td>
                      <td>{new Date(usage.used_at).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderRefundsReport = () => {
    if (!refundsData) return null

    return (
      <div className="report-content">
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon danger">
              <FaUndo />
            </div>
            <div className="stat-details">
              <h3>{refundsData.summary.total_refunds}</h3>
              <p>إجمالي المرتجعات</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>${refundsData.summary.total_amount}</h3>
              <p>المبلغ الإجمالي</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <span>%</span>
            </div>
            <div className="stat-details">
              <h3>{refundsData.summary.refund_rate}%</h3>
              <p>معدل المرتجعات</p>
            </div>
          </div>
        </div>

        {refundsData.by_course && refundsData.by_course.length > 0 && (
          <div className="mb-4">
            <h5 className="section-title">المرتجعات حسب الكورس</h5>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>الكورس</th>
                    <th>عدد المرتجعات</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {refundsData.by_course?.map((course, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{course.course_title}</td>
                      <td>
                        <span className="badge bg-danger">{course.refund_count}</span>
                      </td>
                      <td className="text-danger">${course.total_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {refundsData.recent_refunds && refundsData.recent_refunds.length > 0 && (
          <div>
            <h5 className="section-title">آخر المرتجعات</h5>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الكورس</th>
                    <th>المبلغ</th>
                    <th>السبب</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {refundsData.recent_refunds?.map((refund, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{refund.student_name}</td>
                      <td>{refund.course_title}</td>
                      <td className="text-danger">${refund.amount}</td>
                      <td>{refund.reason}</td>
                      <td>{new Date(refund.refund_date).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderPagination(refundsData.summary.total_refunds)}
      </div>
    )
  }

  const renderFailedTransactionsReport = () => {
    if (!failedTransactionsData) return null

    return (
      <div className="report-content">
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon danger">
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <h3>{failedTransactionsData.summary.total_failed}</h3>
              <p>إجمالي المعاملات الفاشلة</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <span>$</span>
            </div>
            <div className="stat-details">
              <h3>${failedTransactionsData.summary.total_amount}</h3>
              <p>المبلغ الإجمالي</p>
            </div>
          </div>
        </div>

        {failedTransactionsData.by_ip && failedTransactionsData.by_ip.length > 0 && (
          <div className="mb-4">
            <h5 className="section-title">المعاملات حسب IP</h5>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>عدد المحاولات</th>
                    <th>المبلغ الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {failedTransactionsData.by_ip?.map((ip, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{ip.ip_address}</td>
                      <td>
                        <span className="badge bg-danger">{ip.attempt_count}</span>
                      </td>
                      <td>${ip.total_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {failedTransactionsData.recent_failed &&
          failedTransactionsData.recent_failed.length > 0 && (
            <div>
              <h5 className="section-title">آخر المعاملات الفاشلة</h5>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>المستخدم</th>
                      <th>المبلغ</th>
                      <th>السبب</th>
                      <th>IP Address</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedTransactionsData.recent_failed?.map((transaction, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{transaction.user}</td>
                        <td>${transaction.amount}</td>
                        <td>
                          <span className="badge bg-danger">{transaction.reason}</span>
                        </td>
                        <td>{transaction.ip_address}</td>
                        <td>{new Date(transaction.failed_at).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {renderPagination(failedTransactionsData.summary.total_failed)}
      </div>
    )
  }

  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / 10)

    if (totalPages <= 1) return null

    return (
      <div className="pagination-container">
        <button
          className="pagination-btn"
          onClick={() => handleFilterChange('page', filters.page - 1)}
          disabled={filters.page === 1}
        >
          <FaChevronRight />
        </button>
        <span className="pagination-info">
          صفحة {filters.page} من {totalPages}
        </span>
        <button
          className="pagination-btn"
          onClick={() => handleFilterChange('page', filters.page + 1)}
          disabled={filters.page === totalPages}
        >
          <FaChevronLeft />
        </button>
      </div>
    )
  }

  const renderFilters = () => {
    return (
      <div className={`filters-panel ${showFilters ? 'show' : ''}`}>
        <div className="filters-header">
          <h5>
            <FaFilter className="me-2" />
            التصفية
          </h5>
          <button className="btn-close-filters" onClick={() => setShowFilters(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="filters-body">
          {/* Date Filters */}
          <div className="filter-group">
            <label>
              <FaCalendarAlt className="me-2" />
              من تاريخ
            </label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>
              <FaCalendarAlt className="me-2" />
              إلى تاريخ
            </label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          {/* Tab-specific filters */}
          {activeTab === 'top-courses' && (
            <>
              <div className="filter-group">
                <label>عدد الكورسات</label>
                <select
                  className="form-control"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="filter-group">
                <label>الترتيب حسب</label>
                <select
                  className="form-control"
                  value={filters.orderBy}
                  onChange={(e) => handleFilterChange('orderBy', e.target.value)}
                >
                  <option value="revenue">الإيرادات</option>
                  <option value="students">عدد الطلاب</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'student-activity' && (
            <div className="filter-group">
              <label>الحد الأدنى للمشتريات</label>
              <input
                type="number"
                className="form-control"
                value={filters.minPurchases}
                onChange={(e) => handleFilterChange('minPurchases', e.target.value)}
                placeholder="أدخل الحد الأدنى"
              />
            </div>
          )}

          {activeTab === 'instructor-revenue' && (
            <div className="filter-group">
              <label>معرف المدرس</label>
              <input
                type="text"
                className="form-control"
                value={filters.instructorId}
                onChange={(e) => handleFilterChange('instructorId', e.target.value)}
                placeholder="أدخل معرف المدرس"
              />
            </div>
          )}

          <div className="filter-actions">
            <button className="btn btn-primary w-100 mb-2" onClick={loadReportData}>
              تطبيق
            </button>
            <button className="btn btn-secondary w-100" onClick={clearFilters}>
              إعادة تعيين
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderReport = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>جاري تحميل التقرير...</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'top-courses':
        return renderTopCoursesReport()
      case 'student-activity':
        return renderStudentActivityReport()
      case 'instructor-revenue':
        return renderInstructorRevenueReport()
      case 'recharge-codes':
        return renderRechargeCodesReport()
      case 'refunds':
        return renderRefundsReport()
      case 'failed-transactions':
        return renderFailedTransactionsReport()
      default:
        return null
    }
  }

  return (
    <div
      className={`reports-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
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
        activePage="reports"
        darkMode={darkMode}
      />

      <div className="main-content">
        <div className="reports-container">
          <div className="reports-header">
            <div className="reports-title">
              <h1>التقارير والإحصائيات</h1>
              <p>عرض شامل لجميع التقارير والبيانات التحليلية</p>
            </div>

            <div className="reports-actions">
              <button
                className="btn-action filter-action"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                <span>تصفية</span>
              </button>

              <div className="export-dropdown">
                <button className="btn-action export-action">
                  <FaFileExport />
                  <span>تصدير</span>
                </button>
                <div className="export-menu">
                  <button onClick={() => handleExport('json')} disabled={exporting === 'json'}>
                    {exporting === 'json' ? <FaSpinner className="spinner" /> : <FaFileCode />}
                    <span>JSON</span>
                  </button>
                  <button onClick={() => handleExport('csv')} disabled={exporting === 'csv'}>
                    {exporting === 'csv' ? <FaSpinner className="spinner" /> : <FaFileCsv />}
                    <span>CSV</span>
                  </button>
                  <button onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'}>
                    {exporting === 'pdf' ? <FaSpinner className="spinner" /> : <FaFilePdf />}
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="tabs-navigation d-flex  flex-column  flex-lg-row">
            {tabs?.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''} `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="reports-main">
            {renderFilters()}
            <div className="reports-view">{renderReport()}</div>
          </div>
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
    </div>
  )
}

export default Reports
