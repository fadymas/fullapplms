// src/components/requests/RequestCard.jsx
import React, { useState } from 'react';
import { 
    FaEye, 
    FaCheck, 
    FaTimes, 
    FaUndo, 
    FaCalendar,
    FaUser,
    FaBook,
    FaClock
} from 'react-icons/fa';
import { Badge } from 'react-bootstrap';

const RequestCard = ({ 
    request, 
    onApprove, 
    onReject, 
    onRevoke, 
    onReconsider, 
    onViewDetails,
    isPending = false,
    isApproved = false,
    isRejected = false
}) => {
    const [showMore, setShowMore] = useState(false);

    const getStatusBadge = () => {
        switch(request.status) {
            case 'pending':
                return <Badge bg="warning">معلق</Badge>;
            case 'approved':
                return <Badge bg="success">معتمد</Badge>;
            case 'rejected':
                return <Badge bg="danger">مرفوض</Badge>;
            default:
                return <Badge bg="secondary">غير معروف</Badge>;
        }
    };

    const getDateInfo = () => {
        if (isPending) return `تاريخ الطلب: ${request.date}`;
        if (isApproved) return `تاريخ الموافقة: ${request.approvedDate || request.date}`;
        if (isRejected) return `تاريخ الرفض: ${request.rejectedDate || request.date}`;
        return request.date;
    };

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                {/* رأس البطاقة */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <h5 className="card-title mb-1">
                            <FaBook className="text-primary me-2" />
                            {request.title}
                        </h5>
                        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                            <small className="text-muted">
                                <FaUser className="me-1" />
                                من: {request.userName}
                            </small>
                            <small className="text-muted">
                                <FaCalendar className="me-1" />
                                {getDateInfo()}
                            </small>
                            {request.category && (
                                <small className="text-muted">
                                    <FaBook className="me-1" />
                                    التصنيف: {request.category}
                                </small>
                            )}
                        </div>
                    </div>
                    <div className="d-flex flex-column align-items-end">
                        {getStatusBadge()}
                        {request.priority && (
                            <small className={`mt-1 badge ${request.priority === 'high' ? 'bg-danger' : 'bg-info'}`}>
                                {request.priority === 'high' ? 'عالي' : 'عادي'}
                            </small>
                        )}
                    </div>
                </div>

                {/* وصف الطلب */}
                <p className="card-text">
                    {request.description}
                </p>

                {/* معلومات إضافية */}
                {showMore && (
                    <div className="mt-3 p-3 bg-light rounded">
                        <h6 className="mb-2">تفاصيل إضافية:</h6>
                        <div className="row">
                            {request.duration && (
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">
                                        <FaClock className="me-1" />
                                        المدة المقترحة: {request.duration}
                                    </small>
                                </div>
                            )}
                            {request.level && (
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">
                                        المستوى: {request.level}
                                    </small>
                                </div>
                            )}
                            {request.expectedPrice && (
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">
                                        السعر المتوقع: {request.expectedPrice} جنيه
                                    </small>
                                </div>
                            )}
                            {request.estimatedStudents && (
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">
                                        عدد الطلاب المتوقع: {request.estimatedStudents}
                                    </small>
                                </div>
                            )}
                        </div>
                        {request.notes && (
                            <div className="mt-2">
                                <small className="text-muted">
                                    ملاحظات إضافية: {request.notes}
                                </small>
                            </div>
                        )}
                    </div>
                )}

                {/* سبب الرفض */}
                {isRejected && request.rejectionReason && (
                    <div className="alert alert-danger mt-3 py-2">
                        <strong>سبب الرفض:</strong> {request.rejectionReason}
                    </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="d-flex flex-wrap gap-2 mt-4">
                    <button 
                        className="btn btn-outline-primary btn-sm d-flex align-items-center"
                        onClick={onViewDetails}
                    >
                        <FaEye className="me-1" />
                        عرض التفاصيل
                    </button>

                    {isPending && (
                        <>
                            <button 
                                className="btn btn-success btn-sm d-flex align-items-center"
                                onClick={onApprove}
                            >
                                <FaCheck className="me-1" />
                                قبول الطلب
                            </button>
                            <button 
                                className="btn btn-danger btn-sm d-flex align-items-center"
                                onClick={onReject}
                            >
                                <FaTimes className="me-1" />
                                رفض الطلب
                            </button>
                        </>
                    )}

                    {isApproved && (
                        <button 
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                            onClick={onRevoke}
                        >
                            <FaUndo className="me-1" />
                            إلغاء الموافقة
                        </button>
                    )}

                    {isRejected && (
                        <button 
                            className="btn btn-outline-warning btn-sm d-flex align-items-center"
                            onClick={onReconsider}
                        >
                            <FaUndo className="me-1" />
                            إعادة النظر
                        </button>
                    )}

                    <button 
                        className="btn btn-outline-info btn-sm d-flex align-items-center"
                        onClick={() => setShowMore(!showMore)}
                    >
                        {showMore ? 'عرض أقل' : 'عرض المزيد'}
                    </button>
                </div>

                {/* معلومات الطلب السريعة */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <div>
                        {request.userEmail && (
                            <small className="text-muted">
                                البريد: {request.userEmail}
                            </small>
                        )}
                    </div>
                    <div>
                        {request.requestNumber && (
                            <small className="text-muted">
                                رقم الطلب: #{request.requestNumber}
                            </small>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;