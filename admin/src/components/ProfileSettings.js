// src/components/profile/ProfileSettings.jsx
import React from 'react';
import { teacherData } from '../utils/teacherProfileData';

const ProfileSettings = () => {
    const { security } = teacherData;

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title mb-4">الأمان وتسجيل الدخول</h5>
                <div className="text-center">
                    <h6>عدد مرات تسجيل الخروج خلال اليوم</h6>
                    <h6 className="fw-bold bg-danger rounded-pill text-center p-2">
                        {security.logoutToday}
                    </h6>
                    
                    <h6 className="mt-3">عدد مرات تسجيل الخروج خلال الأسبوع</h6>
                    <h6 className="fw-bold bg-danger rounded-pill text-center p-2">
                        {security.logoutWeek}
                    </h6>
                    
                    <h6 className="mt-3 fw-bold bg-warning rounded-pill text-center p-2">
                        {security.autoLogout.reason} 
                        <span className="bg-white text-black rounded-circle px-2 mx-2">
                            {security.autoLogout.count}
                        </span>
                        مرة واحدة
                    </h6>
                </div>
                
                <div className="table-responsive pb-2 pt-3">
                    <table className="table table-borderless">
                        <thead className="border-bottom">
                            <tr>
                                <th scope="row">نوع الجهاز</th>
                                <th>اسم الجهاز</th>
                                <th>نظام التشغيل</th>
                                <th>المتصفح</th>
                                <th>آخر نشاط</th>
                                <th>تاريخ تسجيل الدخول</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {security.devices.map((device, index) => (
                                <tr key={index}>
                                    <td scope="row">{device.type}</td>
                                    <td>{device.deviceName}</td>
                                    <td>{device.os}</td>
                                    <td>{device.browser}</td>
                                    <td>{device.lastActivity}</td>
                                    <td>{device.loginDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;