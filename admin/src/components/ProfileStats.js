// src/components/profile/ProfileStats.jsx
import React from 'react';
import { FaUsers, FaChalkboardTeacher, FaStar, FaClock } from 'react-icons/fa';

const ProfileStats = () => {
    const stats = [
        {
            id: 1,
            title: "إجمالي الطلاب",
            value: "156",
            icon: <FaUsers className="fs-4 text-primary" />,
            color: "primary"
        },
        {
            id: 2,
            title: "الكورسات النشطة",
            value: "4",
            icon: <FaChalkboardTeacher className="fs-4 text-success" />,
            color: "success"
        },
        {
            id: 3,
            title: "التقييم العام",
            value: "4.8/5",
            icon: <FaStar className="fs-4 text-warning" />,
            color: "warning"
        },
        {
            id: 4,
            title: "ساعات التدريس",
            value: "120",
            icon: <FaClock className="fs-4 text-info" />,
            color: "info"
        }
    ];

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title mb-4">إحصائيات عامة</h5>
                <div className="row">
                    {stats.map((stat) => (
                        <div className="col-md-3 col-sm-6 mb-3" key={stat.id}>
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center">
                                    <div className="mb-3">{stat.icon}</div>
                                    <h4 className="fw-bold">{stat.value}</h4>
                                    <p className="text-secondary mb-0">{stat.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileStats;