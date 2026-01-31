// src/pages/teacher/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import {
  FaBook,
  FaUsers,
  FaDollarSign,
  FaShoppingCart,
  FaChalkboardTeacher,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaClock,
  FaTicketAlt,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaFileExport,
  FaFileCsv,
  FaFileCode,
  FaFilter,
  FaSpinner,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import '../styles/dashboard.css'
import useAuthStore from '../store/authStore'
import teacherDashboardService from '../api/teacher/dashboard.service'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const { user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [filterOptions, setFilterOptions] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [user, selectedPeriod, dateRange])

  const fetchFilterOptions = async () => {
    try {
      const options = await teacherDashboardService.getFilterOptions()
      setFilterOptions(options)
    } catch (err) {
      console.error('Failed to fetch filter options:', err)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await teacherDashboardService.getDashboard(
        selectedPeriod,
        dateRange.startDate,
        dateRange.endDate
      )
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'فشل تحميل بيانات لوحة التحكم')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format, type) => {
    setExporting(`${format}-${type}`)
    try {
      const blob = await teacherDashboardService.exportDashboard(
        format,
        type,
        dateRange.startDate,
        dateRange.endDate
      )
      console.log(blob)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard-${type}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting dashboard:', error)
      alert('فشل تصدير البيانات')
    } finally {
      setExporting(null)
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' })
    setSelectedPeriod('month')
  }

  // Overview Stats Cards
  const getOverviewStats = () => {
    if (!dashboardData) return []

    const { overview, today, user_stats } = dashboardData

    return [
      {
        icon: FaBook,
        title: 'إجمالي الكورسات',
        value: overview?.total_courses || 0,
        subValue: `${today?.active_users || 0} نشط اليوم`,
        color: 'primary',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        change: '+12%'
      },
      {
        icon: FaUsers,
        title: 'إجمالي الطلاب',
        value: overview?.total_students || 0,
        subValue: `${user_stats?.new_this_month || 0} جديد هذا الشهر`,
        color: 'success',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        change: '+8%'
      },
      {
        icon: FaDollarSign,
        title: 'إجمالي الإيرادات',
        value: `$${parseFloat(overview?.total_revenue || 0).toFixed(2)}`,
        subValue: `$${parseFloat(today?.revenue || 0).toFixed(2)} اليوم`,
        color: 'warning',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        change: '+15%'
      },
      {
        icon: FaShoppingCart,
        title: 'إجمالي المشتريات',
        value: overview?.total_purchases || 0,
        subValue: `${today?.purchases || 0} اليوم`,
        color: 'info',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        change: '+5%'
      }
    ]
  }

  // Additional stats for admin
  const getAdditionalStats = () => {
    if (!dashboardData || user?.role !== 'admin') return []

    const { overview, recharge_stats } = dashboardData

    return [
      {
        icon: FaChalkboardTeacher,
        title: 'إجمالي المدرسين',
        value: overview.total_instructors || 0,
        subValue: 'معلم نشط',
        color: 'danger',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      },
      {
        icon: FaTicketAlt,
        title: 'أكواد الشحن',
        value: recharge_stats?.total_codes || 0,
        subValue: `${recharge_stats?.used_codes || 0} مستخدم`,
        color: 'secondary',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      }
    ]
  }

  // Today's Activity Stats
  const getTodayStats = () => {
    if (!dashboardData) return []

    const { today } = dashboardData

    return [
      {
        icon: FaDollarSign,
        label: 'إيرادات اليوم',
        value: `$${parseFloat(today?.revenue || 0).toFixed(2)}`,
        color: '#11998e'
      },
      {
        icon: FaShoppingCart,
        label: 'مشتريات اليوم',
        value: today?.purchases || 0,
        color: '#667eea'
      },
      {
        icon: FaTicketAlt,
        label: 'شحن اليوم',
        value: `$${parseFloat(today?.recharges || 0).toFixed(2)}`,
        color: '#f093fb'
      },
      {
        icon: FaUsers,
        label: 'مستخدمين نشطين',
        value: today?.active_users || 0,
        color: '#4facfe'
      }
    ]
  }

  // Chart Data - Revenue & Purchases over time
  const getRevenueChartData = () => {
    if (!dashboardData) return null

    const data = selectedPeriod === 'week' ? dashboardData.weekly_data : dashboardData.monthly_data

    if (!data || data.length === 0) return null

    const labels = data
      .map((item) => (selectedPeriod === 'week' ? item?.day_name : item?.month_name))
      .reverse()

    const revenueData = data.map((item) => parseFloat(item?.revenue || 0)).reverse()
    const purchasesData = data.map((item) => item?.purchases || 0).reverse()

    return {
      labels,
      datasets: [
        {
          label: 'الإيرادات ($)',
          data: revenueData,
          borderColor: '#11998e',
          backgroundColor: 'rgba(17, 153, 142, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#11998e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'المشتريات',
          data: purchasesData,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    }
  }

  // User Distribution Chart
  const getUserDistributionData = () => {
    if (!dashboardData?.user_stats?.by_role) return null

    const roleLabels = {
      student: 'طلاب',
      teacher: 'معلمين',
      admin: 'مسؤولين'
    }

    const labels = dashboardData.user_stats.by_role.map((r) => roleLabels[r.role] || r.role)
    const data = dashboardData.user_stats.by_role.map((r) => r.count)

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(17, 153, 142, 0.8)',
            'rgba(240, 147, 251, 0.8)'
          ],
          borderColor: ['#667eea', '#11998e', '#f093fb'],
          borderWidth: 3,
          hoverOffset: 15
        }
      ]
    }
  }

  // Top Courses
  const getTopCourses = () => {
    if (!dashboardData?.top_courses) return []
    return dashboardData.top_courses.slice(0, 5)
  }

  // Recharge Stats
  const getRechargeStats = () => {
    if (!dashboardData?.recharge_stats) return null
    return dashboardData.recharge_stats
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'Cairo',
            size: 13,
            weight: '600'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          family: 'Cairo',
          size: 14,
          weight: '700'
        },
        bodyFont: {
          family: 'Cairo',
          size: 13
        },
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Cairo',
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Cairo',
            size: 12
          }
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Cairo',
            size: 13,
            weight: '600'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          family: 'Cairo',
          size: 14,
          weight: '700'
        },
        bodyFont: {
          family: 'Cairo',
          size: 13
        },
        cornerRadius: 8
      }
    },
    cutout: '65%'
  }

  if (loading) {
    return (
      <div
        className={`dashboard-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
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
          darkMode={darkMode}
          activePage="dashboard"
        />
        <div className="main-content">
          <div className="loading-dashboard">
            <div className="loading-spinner"></div>
            <p>جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
        <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
      </div>
    )
  }

  return (
    <div
      className={`dashboard-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
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
        activePage="dashboard"
        darkMode={darkMode}
      />

      <div className="main-content">
        <div className="dashboard-container">
          {/* Dashboard Header */}
          <div className="dashboard-header " data-aos="fade-down">
            <div className="dashboard-welcome">
              <h1>مرحباً بك، {user?.email?.split('@')[0] || 'المستخدم'}</h1>
              <p>إليك نظرة عامة على أدائك اليوم</p>
            </div>

            <div className="dashboard-actions ">
              <button
                className="action-btn filter-btn w-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                <span>تصفية</span>
              </button>

              <div className="export-dropdown">
                <button className="action-btn export-btn w-100">
                  <FaFileExport />
                  <span>تصدير</span>
                </button>
                <div className="export-menu z-3">
                  <div className="export-section">
                    <h6>نظرة عامة</h6>
                    <button
                      onClick={() => handleExport('csv', 'overview')}
                      disabled={exporting === 'csv-overview'}
                    >
                      {exporting === 'csv-overview' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaFileCsv />
                      )}
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('json', 'overview')}
                      disabled={exporting === 'json-overview'}
                    >
                      {exporting === 'json-overview' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaFileCode />
                      )}
                      <span>JSON</span>
                    </button>
                  </div>
                  <div className="export-section">
                    <h6>بيانات شهرية</h6>
                    <button
                      onClick={() => handleExport('csv', 'monthly')}
                      disabled={exporting === 'csv-monthly'}
                    >
                      {exporting === 'csv-monthly' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaFileCsv />
                      )}
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('json', 'monthly')}
                      disabled={exporting === 'json-monthly'}
                    >
                      {exporting === 'json-monthly' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaFileCode />
                      )}
                      <span>JSON</span>
                    </button>
                  </div>
                  <div className="export-section">
                    <h6>بيانات أسبوعية</h6>
                    <button
                      onClick={() => handleExport('csv', 'weekly')}
                      disabled={exporting === 'csv-weekly'}
                    >
                      {exporting === 'csv-weekly' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaFileCsv />
                      )}
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('json', 'weekly')}
                      disabled={exporting === 'json-weekly'}
                    >
                      {exporting === 'json-weekly' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaFileCode />
                      )}
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel" data-aos="fade-down">
              <div className="filters-content">
                <div className="filter-group">
                  <label>الفترة الزمنية</label>
                  <div className="period-buttons">
                    {filterOptions?.periods?.map((period) => (
                      <button
                        key={period}
                        className={`period-chip ${selectedPeriod === period ? 'active' : ''}`}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period === 'today' && 'اليوم'}
                        {period === 'week' && 'أسبوع'}
                        {period === 'month' && 'شهر'}
                        {period === 'quarter' && 'ربع سنة'}
                        {period === 'year' && 'سنة'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>
                    <FaCalendarAlt className="me-2" />
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                    }
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
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div className="filter-actions">
                  <button className="btn btn-secondary" onClick={clearFilters}>
                    إعادة تعيين
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowFilters(false)}>
                    تطبيق
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger" data-aos="fade-up">
              <FaExclamationTriangle className="me-2" />
              {error}
            </div>
          )}

          {/* Overview Stats */}
          <div className="stats-overview" data-aos="fade-up">
            {getOverviewStats().map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="stat-card-modern"
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  style={{ '--card-gradient': stat.gradient }}
                >
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper">
                      <Icon />
                    </div>
                    <div className="stat-trend positive">
                      <FaArrowUp />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className="stat-card-body">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                    <span className="stat-sub">{stat.subValue}</span>
                  </div>
                  <div className="stat-card-bg"></div>
                </div>
              )
            })}

            {/* Additional stats for admin */}
            {user?.role === 'admin' &&
              getAdditionalStats().map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={`admin-${index}`}
                    className="stat-card-modern"
                    data-aos="fade-up"
                    data-aos-delay={(getOverviewStats().length + index) * 50}
                    style={{ '--card-gradient': stat.gradient }}
                  >
                    <div className="stat-card-header">
                      <div className="stat-icon-wrapper">
                        <Icon />
                      </div>
                    </div>
                    <div className="stat-card-body">
                      <h3 className="stat-value">{stat.value}</h3>
                      <p className="stat-title">{stat.title}</p>
                      <span className="stat-sub">{stat.subValue}</span>
                    </div>
                    <div className="stat-card-bg"></div>
                  </div>
                )
              })}
          </div>

          {/* Today's Activity */}
          <div className="today-activity" data-aos="fade-up">
            <div className="section-header">
              <h2>
                <FaClock className="me-2" />
                نشاط اليوم
              </h2>
              <span className="section-badge">
                {new Date().toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="today-stats-grid">
              {getTodayStats().map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="today-stat-card"
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                  >
                    <div className="today-stat-icon" style={{ color: stat.color }}>
                      <Icon />
                    </div>
                    <div className="today-stat-content">
                      <span className="today-stat-label">{stat.label}</span>
                      <h4 className="today-stat-value">{stat.value}</h4>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="row g-4">
              {/* Revenue & Purchases Chart */}
              <div className="col-12 col-lg-8" data-aos="fade-up">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <h3>
                      <FaChartLine className="me-2" />
                      الإيرادات والمشتريات
                    </h3>
                    <span className="chart-badge">
                      {selectedPeriod === 'week'
                        ? 'آخر 7 أيام'
                        : selectedPeriod === 'month'
                          ? 'آخر 6 أشهر'
                          : 'هذا العام'}
                    </span>
                  </div>
                  <div className="chart-card-body">
                    {getRevenueChartData() ? (
                      <Line data={getRevenueChartData()} options={chartOptions} height={320} />
                    ) : (
                      <div className="no-data">
                        <FaChartLine />
                        <p>لا توجد بيانات للعرض</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Distribution Chart */}
              <div className="col-12 col-lg-4" data-aos="fade-up" data-aos-delay="100">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <h3>
                      <FaUsers className="me-2" />
                      توزيع المستخدمين
                    </h3>
                    <span className="chart-badge">
                      {dashboardData?.user_stats?.total_users || 0} مستخدم
                    </span>
                  </div>
                  <div className="chart-card-body chart-center">
                    {getUserDistributionData() ? (
                      <div className="doughnut-container">
                        <Doughnut data={getUserDistributionData()} options={doughnutOptions} />
                        <div className="doughnut-center">
                          <span className="doughnut-total">
                            {dashboardData?.user_stats?.total_users || 0}
                          </span>
                          <span className="doughnut-label">إجمالي</span>
                        </div>
                      </div>
                    ) : (
                      <div className="no-data">
                        <FaUsers />
                        <p>لا توجد بيانات للعرض</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="row g-4 mt-2">
            {/* Top Courses */}
            <div className="col-12 col-lg-7" data-aos="fade-up">
              <div className="data-card">
                <div className="data-card-header">
                  <h3>
                    <FaTrophy className="me-2" />
                    أفضل الكورسات
                  </h3>
                  <button className="btn-view-all">
                    <span>عرض الكل</span>
                    <FaEye />
                  </button>
                </div>
                <div className="data-card-body">
                  {getTopCourses().length > 0 ? (
                    <div className="courses-list">
                      {getTopCourses().map((course, index) => {
                        const instructorName =
                          course?.course__instructor__teacher_admin_profile__first_name &&
                          course?.course__instructor__teacher_admin_profile__last_name
                            ? `${course?.course__instructor__teacher_admin_profile__first_name} ${course?.course__instructor__teacher_admin_profile__last_name}`
                            : course?.course__instructor__email

                        return (
                          <div
                            key={course?.course__id}
                            className="course-item"
                            data-aos="fade-up"
                            data-aos-delay={index * 50}
                          >
                            <div className="course-rank">#{index + 1}</div>
                            <div className="course-info">
                              <h4>{course?.course__title}</h4>
                              <p>
                                <FaChalkboardTeacher className="me-1" />
                                {instructorName}
                              </p>
                            </div>
                            <div className="course-stats">
                              <div className="course-stat">
                                <span className="stat-label">المشتريات</span>
                                <span className="stat-value">{course?.total_purchases}</span>
                              </div>
                              <div className="course-stat">
                                <span className="stat-label">الإيرادات</span>
                                <span className="stat-value">
                                  ${parseFloat(course?.total_revenue || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="course-stat">
                                <span className="stat-label">الطلاب</span>
                                <span className="stat-value">{course?.active_students}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="no-data">
                      <FaTrophy />
                      <p>لا توجد كورسات حالياً</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recharge Stats */}
            <div className="col-12 col-lg-5" data-aos="fade-up" data-aos-delay="100">
              <div className="data-card">
                <div className="data-card-header">
                  <h3>
                    <FaTicketAlt className="me-2" />
                    إحصائيات أكواد الشحن
                  </h3>
                </div>
                <div className="data-card-body">
                  {getRechargeStats() ? (
                    <div className="recharge-stats">
                      <div className="recharge-stat-item" data-aos="fade-up">
                        <div className="recharge-icon total">
                          <FaTicketAlt />
                        </div>
                        <div className="recharge-content">
                          <span className="recharge-label">إجمالي الأكواد</span>
                          <h4 className="recharge-value">{getRechargeStats().total_codes}</h4>
                        </div>
                      </div>

                      <div className="recharge-stat-item" data-aos="fade-up" data-aos-delay="50">
                        <div className="recharge-icon used">
                          <FaTicketAlt />
                        </div>
                        <div className="recharge-content">
                          <span className="recharge-label">أكواد مستخدمة</span>
                          <h4 className="recharge-value">{getRechargeStats().used_codes}</h4>
                        </div>
                      </div>

                      <div className="recharge-stat-item" data-aos="fade-up" data-aos-delay="100">
                        <div className="recharge-icon unused">
                          <FaTicketAlt />
                        </div>
                        <div className="recharge-content">
                          <span className="recharge-label">أكواد غير مستخدمة</span>
                          <h4 className="recharge-value">{getRechargeStats().unused_codes}</h4>
                        </div>
                      </div>

                      <div className="recharge-stat-item" data-aos="fade-up" data-aos-delay="150">
                        <div className="recharge-icon amount">
                          <FaDollarSign />
                        </div>
                        <div className="recharge-content">
                          <span className="recharge-label">المبلغ المستخدم</span>
                          <h4 className="recharge-value">
                            ${parseFloat(getRechargeStats().total_amount_used || 0).toFixed(2)}
                          </h4>
                        </div>
                      </div>

                      <div className="recharge-stat-item" data-aos="fade-up" data-aos-delay="200">
                        <div className="recharge-icon expired">
                          <FaExclamationTriangle />
                        </div>
                        <div className="recharge-content">
                          <span className="recharge-label">أكواد منتهية</span>
                          <h4 className="recharge-value">{getRechargeStats().expired_codes}</h4>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-data">
                      <FaTicketAlt />
                      <p>لا توجد بيانات أكواد شحن</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suspicious Activities Alert */}
          {dashboardData?.suspicious_activities &&
            dashboardData.suspicious_activities.length > 0 && (
              <div className="alert alert-warning mt-4" data-aos="fade-up">
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="me-3" style={{ fontSize: '1.5rem' }} />
                  <div>
                    <h5 className="mb-1">تنبيه: نشاط مشبوه</h5>
                    <p className="mb-0">
                      تم اكتشاف {dashboardData.suspicious_activities.length} نشاط مشبوه. يرجى مراجعة
                      التقارير.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
    </div>
  )
}

export default Dashboard
