// src/components/profile/ProfileEarnings.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { teacherData } from '../utils/teacherProfileData';

const ProfileEarnings = () => {
    const { earnings } = teacherData;

    return (
        <>
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-4">المحفظة والإيرادات</h5>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card bg-primary text-white mb-3">
                                <div className="card-body">
                                    <h4>{earnings.currentBalance} جنيه</h4>
                                    <p>الرصيد الحالي</p>
                                </div>
                            </div>
                            <button className="btn btn-success w-100">سحب الأموال</button>
                        </div>
                        <div className="col-md-6">
                            <div className="card bg-success text-white mb-3">
                                <div className="card-body">
                                    <h4>{earnings.totalRevenue} جنيه</h4>
                                    <p>إجمالي الإيرادات</p>
                                </div>
                            </div>
                            <button className="btn btn-outline-primary w-100">عرض تفاصيل الإيرادات</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title mb-4">سجل الإيرادات</h5>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>المصدر</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.transactions.map((transaction, index) => (
                                    <tr key={index}>
                                        <td>{transaction.date}</td>
                                        <td>{transaction.amount} جنيه</td>
                                        <td>{transaction.source}</td>
                                        <td>
                                            <span className="badge bg-success">مكتمل</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileEarnings;