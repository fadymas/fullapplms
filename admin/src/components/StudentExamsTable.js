// src/components/ui/StudentExamsTable.jsx
import React from 'react';

const StudentExamsTable = ({ exams, currentPage, itemsPerPage }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    const getGradeClass = (percentage) => {
        if (percentage >= 85) return 'grade-excellent';
        if (percentage >= 70) return 'grade-good';
        return 'grade-average';
    };

    const getGradeText = (percentage) => {
        if (percentage >= 85) return 'ممتاز';
        if (percentage >= 70) return 'جيد';
        return 'متوسط';
    };

    return (
        <div className="table-responsive">
            <table className="table table-striped table-bordered exams-table">
                <thead>
                    <tr>
                        <th>اسم الطالب</th>
                        <th>الصف</th>
                        <th>الكورس</th>
                        <th>الدرجة</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.map((exam, index) => (
                        <tr key={exam.id}>
                            <td className="fw-semibold">{exam.studentName}</td>
                            <td>
                                <span className="badge bg-info">{exam.grade}</span>
                            </td>
                            <td className="fw-semibold">{exam.course}</td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <span className={`exam-grade ${getGradeClass(exam.percentage)} me-2`}>
                                        {exam.score}/{exam.totalScore}
                                    </span>
                                    <span className="text-muted small">
                                        ({getGradeText(exam.percentage)})
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentExamsTable;