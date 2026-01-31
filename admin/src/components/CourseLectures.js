// src/components/course/CourseLectures.jsx
import React from 'react';
import { 
    FaPlus, 
    FaBook, 
    FaSadTear,
    FaDownload,
    FaEdit,
    FaTrash
} from 'react-icons/fa';
import Pagination from '../components/Pagination';

const CourseLectures = ({ 
    lectures, 
    totalLectures,
    onAddLecture, 
    onEditLecture, 
    onDeleteLecture,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage
}) => {
    const handleDownload = (fileUrl, fileName) => {
        if (fileUrl) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName || 'ملف';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('لا يوجد ملف للتحميل');
        }
    };

    return (
        <div className="course-lectures">
            <div className="card">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="text-titles mb-0">
                            <FaBook className="me-2" />
                            المحاضرات
                        </h3>
                        <button 
                            className="btn btn-primary d-flex align-items-center"
                            onClick={onAddLecture}
                        >
                            <FaPlus className="me-2" />
                            إضافة محاضرة
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {lectures.length === 0 ? (
                        <div className="text-center py-5">
                            <FaSadTear className="fa-3x text-muted mb-3" />
                            <h5 className="text-muted">لا يوجد محاضرات حالياً</h5>
                            <p className="text-muted mb-4">
                                يمكنك إضافة محاضرة جديدة باستخدام الزر أعلاه
                            </p>
                            <button 
                                className="btn btn-primary px-5 d-flex align-items-center mx-auto"
                                onClick={onAddLecture}
                            >
                                <FaPlus className="me-2" />
                                إضافة محاضرة
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover lectures-table">
                                    <thead className="table-hover">
                                        <tr>
                                            <th scope="col">رقم المحاضرة</th>
                                            <th scope="col">المحاضرة الأولى - شرح</th>
                                            <th scope="col">المحاضرة الأولى - شرح جزء ثاني</th>
                                            <th scope="col">ملزمة الدرس الأول</th>
                                            <th scope="col">ملزمة واجب الدرس الأول</th>
                                            <th scope="col">فيديو واجب الدرس الأول شرح</th>
                                            <th scope="col">درجة الامتحان</th>
                                            <th scope="col">درجة الواجب المنزلي</th>
                                            <th scope="col">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lectures.map((lecture) => (
                                            <tr key={lecture.id}>
                                                <td>
                                                    <span className="lecture-number">
                                                        {lecture.lectureNumber}
                                                    </span>
                                                </td>
                                                <td className="lecture-title" title={lecture.titlePart1}>
                                                    {lecture.titlePart1}
                                                </td>
                                                <td className="lecture-title" title={lecture.titlePart2}>
                                                    {lecture.titlePart2}
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary download-btn d-flex align-items-center justify-content-center"
                                                        onClick={() => handleDownload(lecture.materialFile, 'ملزمة الدرس')}
                                                    >
                                                        <FaDownload className="me-1" />
                                                        تحميل الملزمة
                                                    </button>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary download-btn d-flex align-items-center justify-content-center"
                                                        onClick={() => handleDownload(lecture.homeworkFile, 'واجب الدرس')}
                                                    >
                                                        <FaDownload className="me-1" />
                                                        تحميل الواجب
                                                    </button>
                                                </td>
                                                <td className="lecture-title" title={lecture.videoDescription}>
                                                    {lecture.videoDescription}
                                                </td>
                                                <td>
                                                    <span className="lecture-score score-exam">
                                                        {lecture.examScore}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="lecture-score score-homework">
                                                        {lecture.homeworkScore}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            className="btn btn-sm btn-warning d-flex align-items-center"
                                                            onClick={() => onEditLecture(lecture)}
                                                        >
                                                            <FaEdit className="me-1" />
                                                            تعديل
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-danger d-flex align-items-center"
                                                            onClick={() => onDeleteLecture(lecture)}
                                                        >
                                                            <FaTrash className="me-1" />
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* معلومات الصفحة */}
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <small className="text-muted">
                                    عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, totalLectures)} من {totalLectures} محاضرة
                                </small>
                            </div>

                            {/* الجدولة */}
                            {totalPages > 1 && (
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={onPageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseLectures;