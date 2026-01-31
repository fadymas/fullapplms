// src/components/ui/LecturesTable.jsx
import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const LecturesTable = ({ 
    lectures, 
    onEdit, 
    onDelete, 
    currentPage, 
    itemsPerPage 
}) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    return (
        <div className="lectures-table-container">
            <table className="table table-striped table-hover align-middle lectures-table">
                <thead>
                    <tr>
                        <th style={{width: '5%'}}>#</th>
                        <th style={{minWidth: 220}}>العنوان</th>
                        <th style={{width: '12%'}}>النوع</th>
                        <th style={{width: '12%'}}>المدة (د)</th>
                        <th style={{width: '10%'}}>الترتيب</th>
                        <th style={{minWidth: 180}}>تاريخ الإنشاء</th>
                        <th style={{width: '16%'}}>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {lectures.map((lecture, index) => (
                        <tr key={lecture.id}>
                            <td>{startIndex + index + 1}</td>
                            <td className="text-truncate" title={lecture.title}>{lecture.title}</td>
                            <td>
                                <span className="badge bg-secondary">{lecture.lecture_type || '-'}</span>
                            </td>
                            <td>{lecture.durationMinutes ?? '-'}</td>
                            <td>{lecture.order ?? '-'}</td>
                            <td>{lecture.created_at ? new Date(lecture.created_at).toLocaleString('ar-EG') : '-'}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <button 
                                        className="btn btn-sm btn-warning d-flex align-items-center"
                                        onClick={() => onEdit(lecture)}
                                    >
                                        <FaEdit className="me-1" /> تعديل
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger d-flex align-items-center"
                                        onClick={() => onDelete(lecture)}
                                    >
                                        <FaTrash className="me-1" /> حذف
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LecturesTable;