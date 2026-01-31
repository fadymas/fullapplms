// src/pages/TeacherNotifications.jsx
import React, { useState, useEffect } from 'react';
import { 
    FaBell, 
    FaGraduationCap, 
    FaUsers, 
    FaWallet, 
    FaStar, 
    FaCheckDouble, 
    FaEye, 
    FaTrash,
    FaBook,
    FaMoneyBillWave,
    FaComment,
    FaEnvelope,
    FaCalendarAlt,
    FaClock
} from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/teacher-notifications.css';

const TeacherNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'course_request',
            title: 'طلب كورس جديد',
            message: 'تم تقديم طلب لإنشاء كورس جديد بعنوان "رياضيات متقدمة". يرجى مراجعته.',
            icon: <FaGraduationCap className="text-primary" />,
            time: 'منذ 2 ساعات',
            isRead: false,
            priority: 'high',
            category: 'طلبات',
            action: 'review_request'
        },
        {
            id: 2,
            type: 'course_enrollment',
            title: 'تم الاشتراك في كورسك',
            message: 'قام الطالب محمد أحمد بالاشتراك في كورس "أساسيات الفيزياء".',
            icon: <FaUsers className="text-success" />,
            time: 'منذ 5 ساعات',
            isRead: false,
            priority: 'medium',
            category: 'تسجيلات',
            action: 'view_student'
        },
        {
            id: 3,
            type: 'payment_reminder',
            title: 'تذكير بدفع المحفظة',
            message: 'يرجى دفع المبلغ المستحق في محفظتك لتفعيل الكورسات.',
            icon: <FaWallet className="text-warning" />,
            time: 'منذ يوم واحد',
            isRead: false,
            priority: 'high',
            category: 'مالية',
            action: 'view_wallet'
        },
        {
            id: 4,
            type: 'new_rating',
            title: 'تقييم جديد',
            message: 'حصل كورسك على تقييم 5 نجوم من الطالبة فاطمة علي.',
            icon: <FaStar className="text-info" />,
            time: 'منذ 3 أيام',
            isRead: true,
            priority: 'low',
            category: 'تقييمات',
            action: 'view_rating'
        },
        {
            id: 5,
            type: 'new_comment',
            title: 'تعليق جديد',
            message: 'قام الطالب أحمد بتعليق جديد على محاضرة "الدرس الأول" في كورس التاريخ.',
            icon: <FaComment className="text-secondary" />,
            time: 'منذ 4 أيام',
            isRead: true,
            priority: 'low',
            category: 'تفاعلات',
            action: 'view_comment'
        },
        {
            id: 6,
            type: 'course_update',
            title: 'تحديث كورس',
            message: 'تم تحديث محتوى كورس "الفيزياء الحديثة" بإضافة 3 محاضرات جديدة.',
            icon: <FaBook className="text-success" />,
            time: 'منذ 5 أيام',
            isRead: true,
            priority: 'medium',
            category: 'كورسات',
            action: 'view_course'
        },
        {
            id: 7,
            type: 'withdrawal_request',
            title: 'طلب سحب أموال',
            message: 'تم تقديم طلب سحب مبلغ 500 جنيه من محفظتك. يرجى المراجعة.',
            icon: <FaMoneyBillWave className="text-danger" />,
            time: 'منذ أسبوع',
            isRead: true,
            priority: 'high',
            category: 'مالية',
            action: 'view_withdrawal'
        },
        {
            id: 8,
            type: 'system_update',
            title: 'تحديث النظام',
            message: 'تم تحديث النظام بإضافة ميزات جديدة. يرجى مراجعة الإعدادات.',
            icon: <FaEnvelope className="text-primary" />,
            time: 'منذ أسبوعين',
            isRead: true,
            priority: 'medium',
            category: 'نظام',
            action: 'view_system'
        }
    ]);

    const [filter, setFilter] = useState('all'); // all, unread, read
    const [categoryFilter, setCategoryFilter] = useState('all'); // all, category
    const [priorityFilter, setPriorityFilter] = useState('all'); // all, priority
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const [showFilters, setShowFilters] = useState(false);
    
    // state لـ Dark Mode
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // تحميل تفضيل Dark Mode من localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) {
            setDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    // دالة لتصغير/تكبير الـ Sidebar
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // تصفية الإشعارات
    const filteredNotifications = notifications.filter(notification => {
        // تصفية حسب حالة القراءة
        if (filter === 'unread' && notification.isRead) return false;
        if (filter === 'read' && !notification.isRead) return false;
        
        // تصفية حسب التصنيف
        if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
        
        // تصفية حسب الأولوية
        if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
        
        return true;
    });

    // حساب الصفحات
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

    // دالة تحديد الكل كمقروء
    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        alert('تم تحديد جميع الإشعارات كمقروءة!');
    };

    // دالة تحديد إشعار كمقروء
    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
        ));
    };

    // دالة حذف إشعار
    const deleteNotification = (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
            setNotifications(notifications.filter(notif => notif.id !== id));
        }
    };

    // دالة حذف الكل
    const deleteAll = () => {
        if (window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
            setNotifications([]);
        }
    };

    // دالة عرض تفاصيل الإشعار
    const handleViewNotification = (notification) => {
        markAsRead(notification.id);
        
        switch (notification.action) {
            case 'review_request':
                alert('سيتم توجيهك لمراجعة طلب الكورس الجديد');
                break;
            case 'view_student':
                alert('سيتم توجيهك لعرض تفاصيل الطالب المسجل');
                break;
            case 'view_wallet':
                alert('سيتم توجيهك لعرض محفظتك');
                break;
            case 'view_rating':
                alert('سيتم توجيهك لعرض التقييمات');
                break;
            default:
                alert(`عرض تفاصيل الإشعار: ${notification.title}`);
        }
    };

    // التصنيفات المتاحة
    const categories = ['طلبات', 'تسجيلات', 'مالية', 'تقييمات', 'تفاعلات', 'كورسات', 'نظام'];

    // معالجة تغيير الصفحة
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // التمرير للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // إحصائيات
    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        read: notifications.filter(n => n.isRead).length,
        highPriority: notifications.filter(n => n.priority === 'high').length,
        mediumPriority: notifications.filter(n => n.priority === 'medium').length,
        lowPriority: notifications.filter(n => n.priority === 'low').length
    };

    return (
        <div className={`teacher-notifications-page ${darkMode ? 'dark-mode' : ''}`}>
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
            />
            <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}>
                <div className="container mt-5 pt-4">
                    {/* رأس الصفحة */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="mb-0 text-dark-mode">
                                <FaBell className="me-2 text-primary" />
                                الإشعارات
                            </h2>
                            <p className="text-muted-dark mb-0">
                                إدارة جميع إشعاراتك في مكان واحد
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-outline-primary d-flex align-items-center"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <FaEye className="me-2" />
                                {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                            </button>
                            <button 
                                className="btn btn-outline-success d-flex align-items-center"
                                onClick={markAllAsRead}
                            >
                                <FaCheckDouble className="me-2" />
                                تحديد الكل كمقروء
                            </button>
                            <button 
                                className="btn btn-outline-danger d-flex align-items-center"
                                onClick={deleteAll}
                            >
                                <FaTrash className="me-2" />
                                حذف الكل
                            </button>
                        </div>
                    </div>

                    {/* إحصائيات سريعة */}
                    <div className="row mb-4">
                        <div className="col-md-2 col-6 mb-3">
                            <div className="card stat-card bg-primary text-white">
                                <div className="card-body text-center">
                                    <h3>{stats.total}</h3>
                                    <p className="mb-0">إجمالي الإشعارات</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 col-6 mb-3">
                            <div className="card stat-card bg-warning text-white">
                                <div className="card-body text-center">
                                    <h3>{stats.unread}</h3>
                                    <p className="mb-0">غير مقروء</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 col-6 mb-3">
                            <div className="card stat-card bg-success text-white">
                                <div className="card-body text-center">
                                    <h3>{stats.read}</h3>
                                    <p className="mb-0">مقروء</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 col-6 mb-3">
                            <div className="card stat-card bg-danger text-white">
                                <div className="card-body text-center">
                                    <h3>{stats.highPriority}</h3>
                                    <p className="mb-0">عالي الأهمية</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 col-6 mb-3">
                            <div className="card stat-card bg-info text-white">
                                <div className="card-body text-center">
                                    <h3>{stats.mediumPriority}</h3>
                                    <p className="mb-0">متوسط الأهمية</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 col-6 mb-3">
                            <div className="card stat-card bg-secondary text-white">
                                <div className="card-body text-center">
                                    <h3>{stats.lowPriority}</h3>
                                    <p className="mb-0">منخفض الأهمية</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الفلاتر */}
                    {showFilters && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h6 className="mb-0 text-dark-mode">فلترة الإشعارات</h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-dark-mode">حالة القراءة</label>
                                        <select 
                                            className="form-select"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            <option value="all">الكل</option>
                                            <option value="unread">غير مقروء فقط</option>
                                            <option value="read">مقروء فقط</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-dark-mode">التصنيف</label>
                                        <select 
                                            className="form-select"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="all">كل التصنيفات</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-dark-mode">الأولوية</label>
                                        <select 
                                            className="form-select"
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                        >
                                            <option value="all">كل الأولويات</option>
                                            <option value="high">عالي</option>
                                            <option value="medium">متوسط</option>
                                            <option value="low">منخفض</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setFilter('all');
                                            setCategoryFilter('all');
                                            setPriorityFilter('all');
                                        }}
                                    >
                                        إعادة التعيين
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* قائمة الإشعارات */}
                    <div className="notifications-list">
                        {currentNotifications.length === 0 ? (
                            <div className="card text-center py-5">
                                <div className="card-body">
                                    <FaBell className="fa-3x text-muted-dark mb-3" />
                                    <h5 className="text-muted-dark">لا توجد إشعارات</h5>
                                    <p className="text-muted-dark">جميع إشعاراتك محدثة</p>
                                </div>
                            </div>
                        ) : (
                            currentNotifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`card mb-3 notification-card ${!notification.isRead ? 'notification-unread' : ''} ${darkMode ? 'dark-mode' : ''}`}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-start">
                                            {/* أيقونة الإشعار */}
                                            <div className="notification-icon me-3">
                                                <div className={`icon-circle ${notification.priority}-priority`}>
                                                    {notification.icon}
                                                </div>
                                            </div>
                                            
                                            {/* محتوى الإشعار */}
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="card-title mb-0 text-dark-mode">
                                                            {notification.title}
                                                            {!notification.isRead && (
                                                                <span className="badge bg-warning ms-2">جديد</span>
                                                            )}
                                                        </h6>
                                                        <small className="text-muted-dark">
                                                            <FaCalendarAlt className="me-1" />
                                                            {notification.category}
                                                            <span className="mx-2">•</span>
                                                            <FaClock className="me-1" />
                                                            {notification.time}
                                                        </small>
                                                    </div>
                                                    <span className={`badge priority-${notification.priority}`}>
                                                        {notification.priority === 'high' ? 'عالي' : 
                                                         notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                                    </span>
                                                </div>
                                                
                                                <p className="card-text mb-2 text-dark-mode">{notification.message}</p>
                                            </div>
                                            
                                            {/* أزرار الإجراءات */}
                                            <div className="notification-actions ms-3">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary d-flex align-items-center mb-2"
                                                    onClick={() => handleViewNotification(notification)}
                                                >
                                                    <FaEye className="me-1" />
                                                    عرض
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                                    onClick={() => deleteNotification(notification.id)}
                                                >
                                                    <FaTrash className="me-1" />
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* الجدولة */}
                    {totalPages > 1 && (
                        <nav aria-label="جدولة الإشعارات" className="mt-4 mb-5">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        السابق
                                    </button>
                                </li>
                                
                                {/* عرض أرقام الصفحات */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <li 
                                        key={number} 
                                        className={`page-item ${currentPage === number ? 'active' : ''}`}
                                    >
                                        <button 
                                            className="page-link"
                                            onClick={() => handlePageChange(number)}
                                        >
                                            {number}
                                        </button>
                                    </li>
                                ))}
                                
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        التالي
                                    </button>
                                </li>
                            </ul>
                            
                            {/* معلومات الصفحة */}
                            <div className="text-center mt-2">
                                <small className="text-muted-dark">
                                    عرض {indexOfFirstItem + 1} إلى {Math.min(indexOfLastItem, filteredNotifications.length)} 
                                    من {filteredNotifications.length} إشعار
                                </small>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
            
            <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
        </div>
    );
};

export default TeacherNotifications;