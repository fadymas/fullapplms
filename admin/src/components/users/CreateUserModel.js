import React, { useState } from 'react'
import { FaTimes, FaSave } from 'react-icons/fa'
import adminUsersService from '../../api/admin/users.service'

const CreateUserModal = ({ show, onClose, onUserCreated }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student',
    is_active: true,
    email_verified: false,
    type: 'student',
    first_name: '',
    last_name: '',
    phone: '',
    guardian_phone: '',
    grade: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e, nestedKey) => {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
        is_active: form.is_active,
        email_verified: form.email_verified,

        type: form.type,
        full_name: form.first_name + form.last_name,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        guardian_phone: form.guardian_phone,
        grade: form.grade
      }
      debugger
      const response = await adminUsersService.createUser(payload)
      onUserCreated(response) // callback to refresh list
      onClose()
      setForm({
        email: '',
        role: 'student',
        is_active: true,
        email_verified: false,
        type: 'student',
        first_name: '',
        last_name: '',
        phone: '',
        guardian_phone: '',
        grade: ''
      })
    } catch (err) {
      let error = ''
      for (const key in err.response.data) {
        if (!Object.hasOwn(err.response.data, key)) continue

        const errorObject = err.response.data[key]
        for (const meesage of errorObject) {
          error += meesage
        }
      }
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">إضافة مستخدم جديد</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
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
                <div className="col-md-6">
                  <label className="form-label"> كلمة المرور</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
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

                <div className="col-md-6">
                  <label className="form-label">الاسم الأول</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={form.first_name}
                    onChange={(e) => handleChange(e, 'profile')}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">الاسم الأخير</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={form.last_name}
                    onChange={(e) => handleChange(e, 'profile')}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => handleChange(e, 'profile')}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">رقم ولي الأمر</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="guardian_phone"
                    value={form.guardian_phone}
                    onChange={(e) => handleChange(e, 'profile')}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">الصف الدراسي</label>
                  <input
                    type="text"
                    className="form-control"
                    name="grade"
                    value={form.grade}
                    onChange={(e) => handleChange(e, 'profile')}
                  />
                </div>

                <div className="col-md-6 d-flex align-items-center mt-4">
                  <div className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">نشط</label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="email_verified"
                      checked={form.email_verified}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">تم التحقق من البريد</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer d-flex">
              <button type="button" className="btn btn-secondary w-25" onClick={onClose}>
                إغلاق <FaTimes className="ms-1" />
              </button>
              <button type="submit" className="btn btn-primary w-50" disabled={loading}>
                حفظ <FaSave className="ms-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateUserModal
