// src/pages/TeacherRequests.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import RequestsTabs from '../components/RequestsTabs';
import RequestsPagination from '../components/RequestsPagination';
import '../styles/teacher-requests.css';

const TeacherRequests = () => {
    // state لإدارة حالة الـ Sidebar
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    // state للتبويبات والصفحات
    const [activeTab, setActiveTab] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    
    // state لـ Dark Mode
    const [darkMode, setDarkMode] = useState(false);

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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // العودة للصفحة الأولى عند تغيير التبويب
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // هنا يمكن إضافة منطق لجلب البيانات للصفحة المحددة
    };

    return (
        <div className={`teacher-requests-page ${darkMode ? 'dark-mode' : ''}`}>
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
                    <h2 className="mb-4 text-center pt-2 text-dark-mode">طلبات الكورسات</h2>
                    
                    <RequestsTabs 
                        activeTab={activeTab} 
                        onTabChange={handleTabChange}
                        darkMode={darkMode}
                    />
                    
                    <RequestsPagination 
                        currentPage={currentPage}
                        totalPages={5}
                        onPageChange={handlePageChange}
                        darkMode={darkMode}
                    />
                </div>
            </div>
            {/* مرر حالة الـ Sidebar والـ Dark Mode للـ Footer */}
            <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
        </div>
    );
};

export default TeacherRequests;