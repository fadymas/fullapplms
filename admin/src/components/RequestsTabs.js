// src/components/requests/RequestsTabs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import RequestCard from './RequestCard';
import { requestsData } from '../utils/teacherRequestsData';

// ⭐⭐⭐ الحل: تعريف الأيقونات خارج المكون لمنع إعادة الإنشاء ⭐⭐⭐
const TAB_ICONS = {
    pending: FaClock,
    approved: FaCheckCircle,
    rejected: FaTimesCircle
};

const RequestsTabs = ({ activeTab, onTabChange }) => {
    const [requests, setRequests] = useState(() => {
        const savedRequests = localStorage.getItem('teacherRequests');
        return savedRequests ? JSON.parse(savedRequests) : requestsData;
    });

    useEffect(() => {
        localStorage.setItem('teacherRequests', JSON.stringify(requests));
    }, [requests]);

    // ⭐⭐⭐ الحل: استخدام useMemo مع استقرار الأيقونات ⭐⭐⭐
    const tabData = useMemo(() => {
        const getRequestsByStatus = (status) => {
            return requests.filter(request => request.status === status);
        };

        return [
            {
                key: 'pending',
                title: 'طلبات معلقة',
                icon: TAB_ICONS.pending, // استخدام المرجع الثابت
                badgeClass: 'bg-warning',
                requests: getRequestsByStatus('pending'),
                emptyMessage: 'لا توجد طلبات معلقة حالياً'
            },
            {
                key: 'approved',
                title: 'طلبات معتمدة',
                icon: TAB_ICONS.approved, // استخدام المرجع الثابت
                badgeClass: 'bg-success',
                requests: getRequestsByStatus('approved'),
                emptyMessage: 'لا توجد طلبات معتمدة حالياً'
            },
            {
                key: 'rejected',
                title: 'طلبات مرفوضة',
                icon: TAB_ICONS.rejected, // استخدام المرجع الثابت
                badgeClass: 'bg-danger',
                requests: getRequestsByStatus('rejected'),
                emptyMessage: 'لا توجد طلبات مرفوضة حالياً'
            }
        ];
    }, [requests]); // يعتمد فقط على requests

    const getRequestsByStatus = (status) => {
        return requests.filter(request => request.status === status);
    };

    const handleApprove = (id) => {
        if (window.confirm('هل أنت متأكد من قبول هذا الطلب؟')) {
            const updatedRequests = requests.map(request => {
                if (request.id === id) {
                    return { 
                        ...request, 
                        status: 'approved', 
                        approvedDate: new Date().toLocaleDateString('ar-EG'),
                        rejectionReason: undefined
                    };
                }
                return request;
            });
            setRequests(updatedRequests);
            alert('تم قبول الطلب بنجاح');
        }
    };

    const handleReject = (id) => {
        const reason = prompt('يرجى كتابة سبب الرفض:');
        if (reason) {
            const updatedRequests = requests.map(request => {
                if (request.id === id) {
                    return { 
                        ...request, 
                        status: 'rejected', 
                        rejectionReason: reason, 
                        rejectedDate: new Date().toLocaleDateString('ar-EG'),
                        approvedDate: undefined
                    };
                }
                return request;
            });
            setRequests(updatedRequests);
            alert('تم رفض الطلب بنجاح');
        }
    };

    const handleRevoke = (id) => {
        if (window.confirm('هل أنت متأكد من إلغاء الموافقة على هذا الطلب؟')) {
            const updatedRequests = requests.map(request => {
                if (request.id === id) {
                    return { 
                        ...request, 
                        status: 'pending', 
                        approvedDate: undefined 
                    };
                }
                return request;
            });
            setRequests(updatedRequests);
            alert('تم إلغاء الموافقة بنجاح');
        }
    };

    const handleReconsider = (id) => {
        if (window.confirm('هل تريد إعادة النظر في هذا الطلب المرفوض؟')) {
            const updatedRequests = requests.map(request => {
                if (request.id === id) {
                    return { 
                        ...request, 
                        status: 'pending', 
                        rejectionReason: undefined,
                        rejectedDate: undefined
                    };
                }
                return request;
            });
            setRequests(updatedRequests);
            alert('تم إعادة الطلب للمراجعة');
        }
    };

    const handleViewDetails = (request) => {
        alert(`
تفاصيل الطلب:
العنوان: ${request.title}
المستخدم: ${request.userName}
التاريخ: ${request.date}
الحالة: ${request.status === 'pending' ? 'معلق' : request.status === 'approved' ? 'معتمد' : 'مرفوض'}
${request.rejectionReason ? `سبب الرفض: ${request.rejectionReason}` : ''}
الوصف: ${request.description}
`);
    };

    const activeTabData = tabData.find(tab => tab.key === activeTab) || tabData[0];

    return (
        <div className="requests-container">
            {/* التبويبات - باستخدام مراجع ثابتة للأيقونات */}
            <div className="courses-tabs-container mb-4">
                <ul className="nav courses-tabs nav-tabs justify-content-center gap-2 pb-3" role="tablist">
                    {tabData.map((tab) => {
                        const IconComponent = tab.icon; // هذا الآن مرجع ثابت
                        return (
                            <li className="nav-item" key={tab.key} role="presentation">
                                <button
                                    className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => onTabChange(tab.key)}
                                    role="tab"
                                    aria-selected={activeTab === tab.key}
                                    id={`tab-${tab.key}`}
                                >
                                    <span className="me-2">
                                        <IconComponent /> {/* استخدام المرجع الثابت */}
                                    </span>
                                    {tab.title}
                                    {tab.requests.length > 0 && (
                                        <span className={`badge ${tab.badgeClass} ms-2`}>
                                            {tab.requests.length}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* محتوى التبويبات */}
            <div className="tab-content courses pt-4">
                <div 
                    className={`tab-pane fade ${activeTab === activeTabData.key ? 'show active' : ''}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTabData.key}`}
                >
                    <div className="row">
                        {activeTabData.requests.length > 0 ? (
                            activeTabData.requests.map((request) => (
                                <div className="col-12 mb-4" key={request.id}>
                                    <RequestCard
                                        request={request}
                                        onApprove={() => handleApprove(request.id)}
                                        onReject={() => handleReject(request.id)}
                                        onRevoke={() => handleRevoke(request.id)}
                                        onReconsider={() => handleReconsider(request.id)}
                                        onViewDetails={() => handleViewDetails(request)}
                                        isPending={activeTabData.key === 'pending'}
                                        isApproved={activeTabData.key === 'approved'}
                                        isRejected={activeTabData.key === 'rejected'}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="card text-center py-5">
                                    <div className="card-body">
                                        <div className="mb-3">
                                            {/* ⭐⭐⭐ الحل: استخدام المرجع الثابت مباشرة بدون cloneElement ⭐⭐⭐ */}
                                            {activeTabData.key === 'pending' && (
                                                <FaClock className="fa-3x text-muted" />
                                            )}
                                            {activeTabData.key === 'approved' && (
                                                <FaCheckCircle className="fa-3x text-muted" />
                                            )}
                                            {activeTabData.key === 'rejected' && (
                                                <FaTimesCircle className="fa-3x text-muted" />
                                            )}
                                        </div>
                                        <h5 className="text-muted">{activeTabData.emptyMessage}</h5>
                                        {activeTabData.key === 'pending' && (
                                            <p className="text-muted mb-4">
                                                سيظهر هنا أي طلبات جديدة من المستخدمين
                                            </p>
                                        )}
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                if (activeTabData.key === 'pending') {
                                                    const newRequest = {
                                                        id: Date.now(),
                                                        title: 'طلب جديد للمراجعة',
                                                        userName: 'مستخدم جديد',
                                                        date: new Date().toLocaleDateString('ar-EG'),
                                                        status: 'pending',
                                                        description: 'هذا طلب تجريبي للمراجعة'
                                                    };
                                                    setRequests([...requests, newRequest]);
                                                }
                                            }}
                                        >
                                            {activeTabData.key === 'pending' ? 'إنشاء طلب تجريبي' : 'تحديث القائمة'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestsTabs;