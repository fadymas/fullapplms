// src/components/ui/RolesTable.jsx
import React from 'react';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';

const RolesTable = ({ 
    roles, 
    onEdit, 
    onDelete, 
    currentPage, 
    itemsPerPage 
}) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    return (
        <div className="table-responsive roles-table-container">
            <table className="table table-striped table-bordered roles-table">
                <thead>
                    <tr>
                        <th>الرقم</th>
                        <th>اسم الدور</th>
                        <th>الوصف</th>
                        <th>عدد المستخدمين</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role, index) => (
                        <tr key={role.id}>
                            <td>{startIndex + index + 1}</td>
                            <td className="fw-bold">{role.name}</td>
                            <td className="role-description" title={role.description}>
                                {role.description}
                            </td>
                            <td>
                                <span className="users-count-badge d-inline-flex align-items-center">
                                    <FaUsers className="me-1" />
                                    {role.usersCount}
                                </span>
                            </td>
                            <td>
                                <div className="role-actions">
                                    <button 
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                        onClick={() => onEdit(role)}
                                        title="تعديل"
                                    >
                                        <FaEdit className="me-1" />
                                        تعديل
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                        onClick={() => onDelete(role)}
                                        title="حذف"
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
    );
};

export default RolesTable;