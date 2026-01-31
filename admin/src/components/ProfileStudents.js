// src/components/profile/ProfileStudents.jsx
import React, { useState } from 'react';
import { teacherData } from '../utils/teacherProfileData';

const ProfileStudents = () => {
    const [students, setStudents] = useState(teacherData.students);

    const handleViewStudent = (index) => {
        const student = students[index];
        alert(`عرض تفاصيل الطالب: ${student.name}\nالكورس: ${student.course}`);
    };

    const handleSuspendStudent = (index) => {
        if (window.confirm('هل أنت متأكد من إيقاف هذا الطالب؟')) {
            const updatedStudents = [...students];
            updatedStudents[index].status = "معلق";
            setStudents(updatedStudents);
            alert('تم إيقاف الطالب بنجاح');
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title mb-4">إدارة الطلاب</h5>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>اسم الطالب</th>
                                <th>الكورسات المسجلة</th>
                                <th>تاريخ التسجيل</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.name}</td>
                                    <td>{student.course}</td>
                                    <td>{student.registrationDate}</td>
                                    <td>
                                        <span className={`badge ${student.status === 'نشط' ? 'bg-success' : 'bg-warning'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-info me-1"
                                            onClick={() => handleViewStudent(index)}
                                        >
                                            عرض
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-warning"
                                            onClick={() => handleSuspendStudent(index)}
                                        >
                                            إيقاف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfileStudents;