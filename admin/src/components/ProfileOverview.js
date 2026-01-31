// src/components/profile/ProfileOverview.jsx
import React, { useState, useEffect } from 'react';
import ProfileStats from './ProfileStats';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ProfileOverview = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "محمد",
        lastName: "غانم",
        birthDate: "1990-01-01",
        gender: "male",
        specialization: "تاريخ",
        bio: "معلم متخصص في التاريخ مع خبرة تزيد عن 10 سنوات في التعليم."
    });

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true
        });
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        // هنا يمكن إضافة API call لحفظ البيانات
        alert('تم حفظ التغييرات بنجاح!');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        // إعادة تعيين البيانات الأصلية
        setFormData({
            firstName: "محمد",
            lastName: "غانم",
            birthDate: "1990-01-01",
            gender: "male",
            specialization: "تاريخ",
            bio: "معلم متخصص في التاريخ مع خبرة تزيد عن 10 سنوات في التعليم."
        });
    };

    return (
        <>
            <div className="card mb-4" data-aos="fade-up">
                <div className="card-body">
                    <h5 className="card-title mb-4">معلومات شخصية</h5>
                    <form>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="firstName" className="form-label">الاسم الأول</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="firstName" 
                                    value={formData.firstName}
                                    readOnly={!isEditing}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="lastName" className="form-label">الاسم الأخير</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="lastName" 
                                    value={formData.lastName}
                                    readOnly={!isEditing}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="birthDate" className="form-label">تاريخ الميلاد</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    id="birthDate" 
                                    value={formData.birthDate}
                                    readOnly={!isEditing}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="gender" className="form-label">الجنس</label>
                                <select 
                                    className="form-select" 
                                    id="gender" 
                                    disabled={!isEditing}
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="specialization" className="form-label">التخصص</label>
                                <input 
                                type="text" 
                                className="form-control" 
                                id="specialization" 
                                value={formData.specialization}
                                readOnly={!isEditing}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="bio" className="form-label">السيرة الذاتية</label>
                            <textarea 
                                className="form-control" 
                                id="bio" 
                                rows="4"
                                readOnly={!isEditing}
                                value={formData.bio}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={isEditing ? handleSave : handleEdit}
                            >
                                {isEditing ? 'حفظ التغييرات' : 'تعديل المعلومات'}
                            </button>
                            {isEditing && (
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                >
                                    إلغاء
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <ProfileStats />
        </>
    );
};

export default ProfileOverview;