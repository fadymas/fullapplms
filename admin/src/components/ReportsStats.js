// src/components/ui/ReportsStats.jsx
import React from 'react';
import { 
    FaUsers, 
    FaGraduationCap, 
    FaChartLine, 
    FaUserCheck,
    FaBook,
    FaCalendarCheck 
} from 'react-icons/fa';

const ReportsStats = ({ reports }) => {
    const calculateStats = () => {
        const totalStudents = reports.length;
        const presentCount = reports.filter(r => r.attendance === 'حاضر').length;
        const absentCount = totalStudents - presentCount;
        
        const averageExamScore = reports.length > 0 
            ? Math.round(reports.reduce((sum, r) => sum + r.examScore, 0) / reports.length)
            : 0;
        
        const averageHomeworkScore = reports.length > 0 
            ? Math.round(reports.reduce((sum, r) => sum + r.homeworkScore, 0) / reports.length)
            : 0;
        
        const uniqueCourses = [...new Set(reports.map(r => r.course))];
        const uniqueLectures = [...new Set(reports.map(r => r.lecture))];
        
        return {
            totalStudents,
            presentCount,
            absentCount,
            attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0,
            averageExamScore,
            averageHomeworkScore,
            totalCourses: uniqueCourses.length,
            totalLectures: uniqueLectures.length
        };
    };

    const stats = calculateStats();

    return (
        <div className="reports-stats-grid">
            <div className="stat-card">
                <FaUsers className="stat-icon text-primary" />
                <div className="stat-value">{stats.totalStudents}</div>
                <div className="stat-label">إجمالي الطلاب</div>
            </div>
            
            <div className="stat-card">
                <FaUserCheck className="stat-icon text-success" />
                <div className="stat-value">{stats.presentCount}</div>
                <div className="stat-label">طلاب حاضرين</div>
            </div>
            
            <div className="stat-card">
                <FaGraduationCap className="stat-icon text-warning" />
                <div className="stat-value">{stats.averageExamScore}%</div>
                <div className="stat-label">متوسط الامتحان</div>
            </div>
            
            <div className="stat-card">
                <FaChartLine className="stat-icon text-info" />
                <div className="stat-value">{stats.averageHomeworkScore}%</div>
                <div className="stat-label">متوسط الواجب</div>
            </div>
            
            <div className="stat-card">
                <FaBook className="stat-icon text-danger" />
                <div className="stat-value">{stats.totalCourses}</div>
                <div className="stat-label">عدد الكورسات</div>
            </div>
            
            <div className="stat-card">
                <FaCalendarCheck className="stat-icon text-purple" />
                <div className="stat-value">{stats.attendanceRate}%</div>
                <div className="stat-label">نسبة الحضور</div>
            </div>
        </div>
    );
};

export default ReportsStats;