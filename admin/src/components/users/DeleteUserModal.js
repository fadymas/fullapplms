// src/components/ui/DeleteUserModal.jsx
import React, { useState } from 'react'
import { FaTimes, FaTrash } from 'react-icons/fa'
import adminUsersService from '../../api/admin/users.service'

const DeleteUserModal = ({ user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      await adminUsersService.deleteUser(user.id)
      onConfirm()
    } catch {
      setError('تعذر حذف المستخدم. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">حذف المستخدم</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <p>
              هل أنت متأكد أنك تريد حذف المستخدم <strong>{user.name}</strong>؟
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء <FaTimes className="ms-1" />
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              حذف <FaTrash className="ms-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserModal
