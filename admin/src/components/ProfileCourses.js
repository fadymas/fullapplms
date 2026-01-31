// src/components/profile/ProfileCourses.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherData } from '../utils/teacherProfileData';

const ProfileCourses = () => {
    const [courses, setCourses] = useState(teacherData.courses);

    const handleDeleteCourse = (index) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
            const updatedCourses = courses.filter((_, i) => i !== index);
            setCourses(updatedCourses);
            alert('تم حذف الكورس بنجاح');
        }
    };

    const handleEditCourse = (index) => {
        alert(`ستتم إعادة التوجيه لتعديل الكورس: ${courses[index].name}`);
        // في التطبيق الحقيقي: navigate(`/teacher/courses/edit/${index}`)
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title mb-4">إدارة الكورسات</h5>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>اسم الكورس</th>
                                <th>عدد الطلاب</th>
                                <th>التقييم</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course, index) => (
                                <tr key={index}>
                                    <td>{course.name}</td>
                                    <td>{course.students}</td>
                                    <td>{course.rating}</td>
                                    <td>
                                        <span className="badge bg-success">نشط</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-primary me-1"
                                            onClick={() => handleEditCourse(index)}
                                        >
                                            تعديل
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteCourse(index)}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Link to="/teacher/courses" className="btn btn-primary mt-3">
                    إضافة كورس جديد
                </Link>
            </div>
        </div>
    );
};

export default ProfileCourses;