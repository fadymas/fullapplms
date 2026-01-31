// src/components/ui/UsersTable.jsx
import React, { useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import EditUserModal from './users/EditUserModal'
import DeleteUserModal from './users/DeleteUserModal'

const UsersTable = ({
  users,
  onEdit: onEditCallback,
  onDelete: onDeleteCallback,
  currentPage,
  itemsPerPage,
  darkMode
}) => {
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)

  const startIndex = (currentPage - 1) * itemsPerPage

  return (
    <div className="table-responsive users-table-container">
      <table
        className={`table table-striped table-bordered users-table ${darkMode ? 'table-dark' : ''}`}
      >
        <thead>
          <tr>
            <th>الرقم</th>
            <th>البريد الإلكتروني</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{startIndex + index + 1}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span
                  className={`status-badge status-${user.status === 'نشط' ? 'active' : 'inactive'}`}
                >
                  {user.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => setEditUser(user)}
                    title="تعديل"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => setDeleteUser(user)}
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(updatedUser) => {
            onEditCallback(updatedUser)
            setEditUser(null)
          }}
        />
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <DeleteUserModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={() => {
            onDeleteCallback(deleteUser)
            setDeleteUser(null)
          }}
        />
      )}
    </div>
  )
}

export default UsersTable
