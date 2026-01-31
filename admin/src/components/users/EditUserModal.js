// src/components/ui/EditUserModal.jsx
import React, { useState } from 'react'
import { FaTimes, FaSave } from 'react-icons/fa'
import adminUsersService from '../../api/admin/users.service'

const EditUserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    email: user.email,
    role: user.role,
    is_active: user.status === 'نشط',

    phone: user.phone || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e, nestedKey) => {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        email: form.email,
        role: form.role,
        is_active: form.is_active,
        phone: form.phone
      }
      const updatedUser = await adminUsersService.updateUserProfile(user.id, payload)
      onSave(updatedUser)
    } catch {
      setError('تعذر تعديل المستخدم. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">تعديل المستخدم</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">الدور</label>
                <select
                  className="form-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="student">طالب</option>
                  <option value="teacher">معلم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <label className="form-check-label">نشط</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                إغلاق <FaTimes className="ms-1" />
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                حفظ <FaSave className="ms-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal
