import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Components
import DashboardNavbar from '../components/DashboardNavbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import BalanceSection from '../features/profile/components/BalanceSection'

// Stores
import useUIStore from '../store/uiStore'
import useAuthStore from '../store/authStore'

// Constants
import { PROFILE_SECURITY } from '../constants/mockData'

// Icons
import {
  FaUserCircle,
  FaChartBar,
  FaCog,
  FaNewspaper,
  FaPlayCircle,
  FaChevronLeft,
  FaSave,
  FaSpinner,
  FaHistory,
  FaShoppingBag,
  FaGraduationCap
} from 'react-icons/fa'

import '../styles/ProfilePage.css'

import studentService from '../api/student.service'
import paymentService from '../api/payment.service'

function ProfilePage() {
  const { darkMode } = useUIStore()
  const { user: authUser, setUser: setAuthUser } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [transactions, setTransactions] = useState([])
  const [quizAttempts, setQuizAttempts] = useState([])

  const [activeTab, setActiveTab] = useState('overview')
  const [activeSubTab, setActiveSubTab] = useState('transactions')
  const [loading, setLoading] = useState(true)

  // Edit Profile States
  const [editData, setEditData] = useState({ full_name: '', phone: '', grade: '' })
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' })

  const fetchData = async () => {
    try {
      const [profData, walletData, purchasesData, transactionsData, quizAttemptsData] =
        await Promise.all([
          studentService.getProfile(),
          paymentService.getMyWallet(),
          paymentService.getMyPurchases(),
          paymentService.getTransactions(),
          studentService.getMyQuizAttempts()
        ])

      setProfile(profData)
      setWallet(walletData)
      setPurchases(purchasesData.results || [])
      setTransactions(transactionsData.results || [])
      setQuizAttempts(quizAttemptsData || [])

      // Init edit form
      setEditData({
        full_name: profData.full_name || '',
        phone: profData.phone || '',
        grade: profData.grade || ''
      })
    } catch (err) {
      console.error('Failed to fetch profile data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setUpdateMsg({ type: '', text: '' })

    try {
      const updatedProfile = await studentService.updateProfile(editData)
      setProfile(updatedProfile)
      setAuthUser({ ...authUser, ...updatedProfile })
      setUpdateMsg({ type: 'success', text: 'تم تحديث البيانات بنجاح' })
    } catch (err) {
      console.error(err)
      setUpdateMsg({ type: 'error', text: 'فشل تحديث البيانات. تأكد من صحة المدخلات.' })
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionLabel = (type) => {
    const types = {
      deposit: 'إيداع / شحن',
      purchase: 'شراء كورس',
      refund: 'استرداد'
    }
    return types[type] || type
  }

  const profileTabs = [
    { id: 'overview', icon: <FaChartBar />, label: 'الملف الشخصي' },
    { id: 'settings', icon: <FaCog />, label: 'الإعدادات' },
    { id: 'activity', icon: <FaNewspaper />, label: 'نتائج الإمتحانات' },
    { id: 'homework', icon: <FaNewspaper />, label: 'نتائج الواجب' },
    { id: 'video-watch', icon: <FaPlayCircle />, label: 'مشاهدات الفيديو' }
  ]

  const subTabs = [
    { id: 'transactions', label: 'المعاملات المالية', icon: <FaHistory /> },
    { id: 'my-purchases', label: 'المشتريات', icon: <FaShoppingBag /> },
    { id: 'my-courses-link', label: 'كورساتي', icon: <FaGraduationCap /> }
  ]

  return (
    <div className={`profile-container ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardNavbar />
      <Sidebar activePage="profile" />

      <div className={`main-content profile-page ${darkMode ? 'dark-mode-bg' : ''}`}>
        <div className="container-fluid pt-5 mt-4">
          <div className="row">
            {/* Sidebar Profile Info */}
            <div className="col-lg-4">
              <div className={`card card-profile mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                <div className="card-body text-center">
                  <p className="text-center">
                    <FaUserCircle className={`fa-4x ${darkMode ? 'text-light' : 'text-primary'}`} />
                  </p>

                  <h6 className={`card-title fw-bold ${darkMode ? 'text-light' : ''}`}>
                    {profile?.full_name || authUser?.full_name || 'مستخدم'}
                  </h6>
                  <p className={`card-text fs-12 ${darkMode ? 'text-light' : 'text-secondary'}`}>
                    {profile?.grade || 'طالب'}
                  </p>

                  <p className={`card-text fs-12 mb-2 ${darkMode ? 'text-light' : ''}`}>
                    <span className={darkMode ? 'text-light' : 'text-secondary'}>رقم الهاتف:</span>
                    <span className="fw-bold">
                      {' '}
                      {profile?.phone || authUser?.phone || 'غير مسجل'}
                    </span>
                  </p>

                  <ul className="nav nav-tabs flex-column gap-2 border-0 mt-3">
                    {profileTabs.map((tab) => (
                      <li className="nav-item" key={tab.id} role="presentation">
                        <button
                          className={`nav-link w-100 text-start align-items-center d-flex ${activeTab === tab.id ? 'active' : ''} ${darkMode ? 'nav-link-dark' : ''}`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          <span className={`me-2 ${darkMode ? 'text-light' : ''}`}>{tab.icon}</span>
                          <span className={`fs-14 ${darkMode ? 'text-light' : ''}`}>
                            {tab.label}
                          </span>
                          <FaChevronLeft className={`ms-auto ${darkMode ? 'text-light' : ''}`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content Areas */}
            <div className="col-lg-8">
              <div className="tab-content tabs-profile">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="tab-pane fade show active">
                    <div className={`card mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                      <BalanceSection
                        balance={`${wallet?.balance || '0'} جنية`}
                        darkMode={darkMode}
                        onRechargeSuccess={fetchData}
                      />

                      <div className="card-body pt-0">
                        <ul
                          className={`nav nav-tabs pt-3 nav-fatora ${darkMode ? 'border-secondary' : ''}`}
                        >
                          {subTabs.map((tab) => (
                            <li className="nav-item" key={tab.id}>
                              <button
                                className={`nav-link d-flex align-items-center gap-2 ${activeSubTab === tab.id ? 'active' : ''} ${darkMode ? 'nav-link-dark' : ''}`}
                                onClick={() => setActiveSubTab(tab.id)}
                              >
                                {tab.icon} {tab.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sub-tab Table Content */}
                    <div className={`card ${darkMode ? 'dark-mode-card' : ''}`}>
                      <div className="card-body">
                        {/* TRANSACTIONS TAB */}
                        {activeSubTab === 'transactions' && (
                          <div className="table-responsive">
                            {loading ? (
                              <div className="text-center py-4">
                                <FaSpinner className="fa-spin" size={24} />
                              </div>
                            ) : transactions.length > 0 ? (
                              <table
                                className={`table ${darkMode ? 'table-dark' : 'table-borderless'}`}
                              >
                                <thead>
                                  <tr>
                                    <th>التاريخ</th>
                                    <th>العملية</th>
                                    <th>المبلغ</th>
                                    <th>الحالة</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transactions.map((t) => {
                                    const isPositive = ['deposit', 'recharge_code'].includes(
                                      t.transaction_type
                                    )
                                    let label = t.transaction_type
                                    if (t.transaction_type === 'deposit') label = 'إيداع'
                                    else if (t.transaction_type === 'recharge_code')
                                      label = 'شحن رصيد'
                                    else if (t.transaction_type === 'purchase') label = 'شراء كورس'
                                    else if (t.transaction_type === 'refund') label = 'استرداد'

                                    return (
                                      <tr key={t.id}>
                                        <td>{formatDate(t.created_at)}</td>
                                        <td>{label}</td>
                                        <td className={isPositive ? 'text-success' : 'text-danger'}>
                                          {isPositive ? '+' : '-'} {t.amount} جنية
                                        </td>
                                        <td>
                                          <span className="badge bg-secondary">مكتملة</span>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center py-5 text-muted">
                                لا يوجد معاملات مالية حتى الان
                              </div>
                            )}
                          </div>
                        )}

                        {/* PURCHASES TAB */}
                        {activeSubTab === 'my-purchases' && (
                          <div className="table-responsive">
                            {loading ? (
                              <div className="text-center py-4">
                                <FaSpinner className="fa-spin" size={24} />
                              </div>
                            ) : purchases.length > 0 ? (
                              <table
                                className={`table ${darkMode ? 'table-dark' : 'table-borderless'}`}
                              >
                                <thead>
                                  <tr>
                                    <th>اسم الكورس</th>
                                    <th>السعر</th>
                                    <th>تاريخ الشراء</th>
                                    <th>الإجراء</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {purchases.map((p) => (
                                    <tr key={p.id}>
                                      <td>{p.course_title}</td>
                                      <td>{p.price_at_purchase} جنية</td>
                                      <td>{formatDate(p.purchased_at)}</td>
                                      <td>
                                        <Link
                                          to={`/course/${p.course}`}
                                          className="btn btn-sm btn-primary"
                                        >
                                          مشاهدة المحتوى
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center py-5 text-muted">
                                لم تقم بشراء أي كورسات بعد
                              </div>
                            )}
                          </div>
                        )}

                        {/* LINK TO COURSES */}
                        {activeSubTab === 'my-courses-link' && (
                          <div className="text-center py-5">
                            <FaGraduationCap size={40} className="mb-3 text-primary" />
                            <h5 className={`mb-3 ${darkMode ? 'text-light' : ''}`}>
                              تصفح جميع كورساتك المشترك بها
                            </h5>
                            <Link
                              to="/my-courses"
                              className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                            >
                              الذهاب لصفحة كورساتي
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="tab-pane fade show active">
                    {/* Edit Profile Form */}
                    <div className={`card mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                      <div className="card-body">
                        <h5 className={`card-title mb-4 ${darkMode ? 'text-light' : ''}`}>
                          تعديل البيانات الشخصية
                        </h5>
                        <form onSubmit={handleUpdateProfile}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className={`form-label ${darkMode ? 'text-light' : ''}`}>
                                الإسم بالكامل
                              </label>
                              <input
                                type="text"
                                className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                value={editData.full_name}
                                onChange={(e) =>
                                  setEditData({ ...editData, full_name: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className={`form-label ${darkMode ? 'text-light' : ''}`}>
                                رقم الهاتف
                              </label>
                              <input
                                type="text"
                                className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                value={editData.phone}
                                onChange={(e) =>
                                  setEditData({ ...editData, phone: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="col-md-12 mb-3">
                              <label className={`form-label ${darkMode ? 'text-light' : ''}`}>
                                الصف الدراسي
                              </label>
                              <select
                                className={`form-select ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                value={editData.grade}
                                onChange={(e) =>
                                  setEditData({ ...editData, grade: e.target.value })
                                }
                                required
                              >
                                <option value="Grade 10">الأول الثانوي (Grade 10)</option>
                                <option value="Grade 11">الثاني الثانوي (Grade 11)</option>
                                <option value="Grade 12">الثالث الثانوي (Grade 12)</option>
                              </select>
                            </div>
                          </div>

                          {updateMsg.text && (
                            <div
                              className={`alert ${updateMsg.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small`}
                            >
                              {updateMsg.text}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="btn btn-primary d-flex align-items-center"
                            disabled={updating}
                          >
                            {updating ? (
                              <FaSpinner className="fa-spin me-2" />
                            ) : (
                              <FaSave className="me-2" />
                            )}
                            حفظ التعديلات
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className={`card mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                      <div className="card-body">
                        <h5 className={`card-title mb-4 ${darkMode ? 'text-light' : ''}`}>
                          الأمان وتسجيل الدخول
                        </h5>
                        <div className="table-responsive">
                          <table
                            className={`table ${darkMode ? 'table-dark' : 'table-borderless'}`}
                          >
                            <thead>
                              <tr>
                                <th>الجهاز</th>
                                <th>نظام التشغيل</th>
                                <th>المتصفح</th>
                                <th>تاريخ الدخول</th>
                              </tr>
                            </thead>
                            <tbody>
                              {PROFILE_SECURITY.map((device, i) => (
                                <tr key={i}>
                                  <td>{device.device}</td>
                                  <td>{device.os}</td>
                                  <td>{device.browser}</td>
                                  <td>{device.loginTime}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab - Quiz Attempts */}
                {activeTab === 'activity' && (
                  <div className="tab-pane fade show active">
                    <div className={`card mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                      <div className="card-body">
                        <h5 className={`card-title mb-4 ${darkMode ? 'text-light' : ''}`}>
                          نتائج الإمتحانات
                        </h5>
                        <div className="table-responsive">
                          {loading ? (
                            <div className="text-center py-4">
                              <FaSpinner className="fa-spin" size={24} />
                            </div>
                          ) : quizAttempts.length > 0 ? (
                            <table
                              className={`table ${darkMode ? 'table-dark' : 'table-borderless'}`}
                            >
                              <thead>
                                <tr>
                                  <th>الأمتحان</th>
                                  <th>النتيجة</th>
                                  <th>الحالة</th>
                                  <th>بداية المحاولة</th>
                                  <th>نهاية المحاولة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {quizAttempts.map((attempt) => {
                                  const scoreValue = parseFloat(attempt.score) || 0
                                  const statusColor =
                                    scoreValue >= 70
                                      ? 'bg-success'
                                      : scoreValue >= 50
                                        ? 'bg-warning'
                                        : 'bg-danger'

                                  return (
                                    <tr key={attempt.id}>
                                      <td>{attempt.quiz_title}</td>
                                      <td className="fw-bold">
                                        <span className={`badge ${statusColor}`}>
                                          {attempt.score}%
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${attempt.status === 'graded' ? 'bg-success' : 'bg-secondary'}`}
                                        >
                                          {attempt.status === 'graded' ? 'مصححة' : 'قيد التصحيح'}
                                        </span>
                                      </td>
                                      <td>{formatDate(attempt.started_at)}</td>
                                      <td>{formatDate(attempt.submitted_at)}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-5 text-muted">
                              لم تقم بأي اختبارات حتى الآن
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {['homework', 'video-watch'].includes(activeTab) && (
                  <div className="tab-pane fade show active">
                    <div className={`card mb-4 ${darkMode ? 'dark-mode-card' : ''}`}>
                      <div className="card-body">
                        <h5 className={`card-title mb-4 ${darkMode ? 'text-light' : ''}`}>
                          {activeTab === 'homework' ? 'نتائج الواجب' : 'مشاهدات الفيديو'}
                        </h5>
                        <div className="table-responsive">
                          <table
                            className={`table ${darkMode ? 'table-dark' : 'table-borderless'}`}
                          >
                            <tbody>
                              <tr>
                                <td className="text-center">يتم جلب البيانات من الخادم...</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfilePage
