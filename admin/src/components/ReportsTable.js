// src/components/ui/ReportsTable.jsx
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const ReportsTable = ({ reports, currentPage, itemsPerPage }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    const getGradeClass = (score) => {
        if (score >= 90) return 'grade-excellent';
        if (score >= 80) return 'grade-good';
        if (score >= 70) return 'grade-average';
        return 'grade-average';
    };

    const getAttendanceClass = (attendance) => {
        return attendance === 'حاضر' ? 'attendance-present' : 'attendance-absent';
    };

    return (
        <div className="table-responsive">
            <table className="table table-striped table-hover reports-table">
                <thead className="table-hover">
                    <tr>
                        <th>اسم الطالب</th>
                        <th>اسم الكورس</th>
                        <th>اسم المحاضرة</th>
                        <th>رقم التليفون</th>
                        <th>رقم ولي الأمر</th>
                        <th>الحضور</th>
                        <th>درجة الإمتحان</th>
                        <th>درجة الواجب</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report, index) => (
                        <tr key={report.id} data-course={report.course} data-lecture={report.lecture}>
                            <td className="student-name">{report.studentName}</td>
                            <td className="course-name">{report.course}</td>
                            <td className="lecture-name">{report.lecture}</td>
                            <td>
                                <a 
                                    href={`https://wa.me/${report.phone}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-success whatsapp-btn"
                                >
                                    <FaWhatsapp className="me-2" />
                                    {report.phone}
                                </a>
                            </td>
                            <td>
                                <a 
                                    href={`https://wa.me/${report.guardianPhone}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-success whatsapp-btn"
                                >
                                    <FaWhatsapp className="me-2" />
                                    {report.guardianPhone}
                                </a>
                            </td>
                            <td>
                                <span className={`attendance-badge ${getAttendanceClass(report.attendance)}`}>
                                    {report.attendance}
                                </span>
                            </td>
                            <td>
                                <span className={`grade-score ${getGradeClass(report.examScore)}`}>
                                    {report.examScore}
                                </span>
                            </td>
                            <td>
                                <span className={`grade-score ${getGradeClass(report.homeworkScore)}`}>
                                    {report.homeworkScore}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportsTable;