import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import studentService from '../api/student.service'
import courseService from '../api/course.service'

// Components
import DashboardNavbar from '../components/DashboardNavbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

// Stores
import useUIStore from '../store/uiStore'
import useAuthStore from '../store/authStore'

// Icons
import {
  FaArrowUp,
  FaArrowDown,
  FaBook,
  FaChartLine,
  FaClock,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa'

import '../styles/DashboardPage.css'

function DashboardPage() {
  const { darkMode } = useUIStore()
  const { user } = useAuthStore()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await studentService.getDashboardData()
        setDashboardData(data)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
        <DashboardNavbar />
        <Sidebar />
        <div className={`main-content dashboard-page ${darkMode ? 'dark-mode-bg' : ''}`}>
          <div className="loading-container">
            <FaSpinner
              className="spinner-animation"
              style={{ fontSize: '3rem', color: '#4CACB7' }}
            />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const {
    spending = { net_spent: 0, total_deposits: 0, current_balance: 0 },
    transaction_summary = { total_count: 0, by_type: [] },
    course_progress = [],
    monthly_spending = [],
    recent_transactions = []
  } = dashboardData || {}

  // Calculate spending trend
  const spendingTrend =
    monthly_spending[0]?.spent > 0
      ? ((monthly_spending[0].spent - monthly_spending[1]?.spent || 0) /
          (monthly_spending[1]?.spent || 1)) *
        100
      : 0

  // Transform monthly data for chart
  const chartData = monthly_spending
    .slice(0, 6)
    .reverse()
    .map((item) => ({
      month: item.month_name,
      spent: Math.abs(item.spent),
      deposits: item.deposits,
      net: item.net
    }))

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`custom-tooltip ${darkMode ? 'dark' : ''}`}>
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} جنية
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardNavbar />
      <Sidebar />
      <div className={`main-content dashboard-page-modern ${darkMode ? 'dark-mode-bg' : ''}`}>
        <div className="container-fluid px-4 py-5">
          {/* Welcome Header */}
          <div className="welcome-section mb-5">
            <h1 className={`welcome-title ${darkMode ? 'text-light' : 'text-dark'}`}>
              مرحباً، {user?.name || 'عزيزى الطالب '}
            </h1>
            <p className={`welcome-subtitle ${darkMode ? 'text-light-muted' : 'text-muted'}`}>
              نظرة عامة على رحلتك التعليمية
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="stats-grid mb-5">
            {/* Net Spending Card */}
            <div className={`stat-card-modern primary ${darkMode ? 'dark' : ''}`}>
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <p className="stat-label">صافي الإنفاق</p>
                <h2 className="stat-value">{spending.net_spent.toFixed(0)} جنية</h2>
                <div className={`stat-trend ${spendingTrend > 0 ? 'up' : 'down'}`}>
                  {spendingTrend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                  <span>{Math.abs(spendingTrend).toFixed(1)}% هذا الشهر</span>
                </div>
              </div>
            </div>

            {/* Total Deposits */}
            <div className={`stat-card-modern success ${darkMode ? 'dark' : ''}`}>
              <div className="stat-icon">
                <FaArrowDown />
              </div>
              <div className="stat-content">
                <p className="stat-label">إجمالي الودائع</p>
                <h2 className="stat-value">{spending.total_deposits.toFixed(0)} جنية</h2>
                <p className="stat-meta">{transaction_summary.total_count} معاملة</p>
              </div>
            </div>

            {/* Active Courses */}
            <div className={`stat-card-modern info ${darkMode ? 'dark' : ''}`}>
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-content">
                <p className="stat-label">الكورسات النشطة</p>
                <h2 className="stat-value">{course_progress.length}</h2>
                <p className="stat-meta">جاري الدراسة</p>
              </div>
            </div>

            {/* Current Balance */}
            <div className={`stat-card-modern warning ${darkMode ? 'dark' : ''}`}>
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <p className="stat-label">الرصيد الحالي</p>
                <h2 className="stat-value">{spending.current_balance.toFixed(0)} جنية</h2>
                <p className="stat-meta">متاح للإستخدام</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-5">
            {/* Monthly Spending Chart */}
            <div className="col-lg-8">
              <div className={`chart-card ${darkMode ? 'dark' : ''}`}>
                <div className="chart-header">
                  <h3>نشاط الإنفاق الشهري</h3>
                  <p className="chart-subtitle">آخر 6 أشهر</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? '#2a2a2a' : '#e0e0e0'}
                      />
                      <XAxis
                        dataKey="month"
                        stroke={darkMode ? '#999' : '#666'}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke={darkMode ? '#999' : '#666'} style={{ fontSize: '12px' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="spent" name="المصروفات" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="deposits" name="الودائع" fill="#51cf66" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="col-lg-4">
              <div className={`chart-card ${darkMode ? 'dark' : ''}`}>
                <div className="chart-header">
                  <h3>ملخص المعاملات</h3>
                  <p className="chart-subtitle">نظرة سريعة</p>
                </div>
                <div className="transaction-summary">
                  <div className="summary-item">
                    <div className="summary-label">إجمالي المعاملات</div>
                    <div className="summary-value">{transaction_summary.total_count}</div>
                  </div>
                  <div className="summary-divider"></div>
                  {transaction_summary.by_type.map((type, index) => (
                    <div key={index} className="summary-item">
                      <div className="summary-label">
                        {type.transaction_type === 'purchase' ? 'مشتريات' : 'إيداعات'}
                      </div>
                      <div className="summary-value">
                        <span
                          className={type.transaction_type === 'purchase' ? 'negative' : 'positive'}
                        >
                          {type.total > 0 ? '+' : ''}
                          {type.total.toFixed(0)} جنية
                        </span>
                        <span className="summary-count">({type.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="row g-4">
            {/* Course Progress */}
            <div className="col-lg-6">
              <div className={`list-card ${darkMode ? 'dark' : ''}`}>
                <div className="list-header">
                  <h3>الكورسات المسجلة</h3>
                  <span className="badge-count">{course_progress.length}</span>
                </div>
                <div className="list-body">
                  {course_progress.length > 0 ? (
                    course_progress.map((course) => (
                      <div key={course.course_id} className="course-item">
                        <div className="course-info">
                          <div className="course-icon">
                            <FaBook />
                          </div>
                          <div className="course-details">
                            <h4>{course.course_title}</h4>
                            <p>
                              مسجل منذ {new Date(course.enrolled_at).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="course-progress-bar">
                          <div className="progress-wrapper">
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{course.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <FaBook />
                      <p>لم تسجل في أي كورسات بعد</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="col-lg-6">
              <div className={`list-card ${darkMode ? 'dark' : ''}`}>
                <div className="list-header">
                  <h3>المعاملات الأخيرة</h3>
                  <span className="badge-count">{recent_transactions.length}</span>
                </div>
                <div className="list-body">
                  {recent_transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div
                          className={`transaction-icon ${transaction.amount > 0 ? 'positive' : 'negative'}`}
                        >
                          {transaction.amount > 0 ? <FaArrowDown /> : <FaArrowUp />}
                        </div>
                        <div className="transaction-details">
                          <h4>{transaction.description}</h4>
                          <p>
                            {new Date(transaction.created_at).toLocaleDateString('ar-EG', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toFixed(0)} جنية
                      </div>
                    </div>
                  ))}
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

export default DashboardPage
