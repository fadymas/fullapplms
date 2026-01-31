// src/components/ui/UserModal.jsx
import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'

const UserModal = ({ show, handleClose, handleSave, modalType, userData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: ''
  })

  useEffect(() => {
    if (userData) {
      setFormData(userData)
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: ''
      })
    }
  }, [userData])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id.replace('add', '').replace('edit', '').toLowerCase()]: value
    }))

    // إظهار/إخفاء حقل الهاتف بناءً على الدور
    if (id.includes('Role')) {
      if (value === 'طالب') {
        document
          .getElementById(id.replace('Role', 'PhoneContainer'))
          ?.style.setProperty('display', 'block')
      } else {
        document
          .getElementById(id.replace('Role', 'PhoneContainer'))
          ?.style.setProperty('display', 'none')
      }
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
    handleClose()
  }

  const modalTitle = modalType === 'add' ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'
  const saveButtonText = modalType === 'add' ? 'حفظ' : 'حفظ التغييرات'

  return (
    <Modal show={show} onHide={handleClose} className="users-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={`${modalType}UserForm`}>
          <div className="mb-3">
            <label htmlFor={`${modalType}Name`} className="form-label">
              الاسم
            </label>
            <input
              type="text"
              className="form-control"
              id={`${modalType}Name`}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor={`${modalType}Email`} className="form-label">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="form-control"
              id={`${modalType}Email`}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor={`${modalType}Role`} className="form-label">
              الدور
            </label>
            <select
              className="form-select"
              id={`${modalType}Role`}
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">اختر الدور</option>
              <option value="طالب">طالب</option>
              <option value="معلم">معلم</option>
              <option value="إداري">إداري</option>
            </select>
          </div>
          <div
            className="mb-3"
            id={`${modalType}PhoneContainer`}
            style={{ display: formData.role === 'طالب' ? 'block' : 'none' }}
          >
            <label htmlFor={`${modalType}Phone`} className="form-label">
              رقم الهاتف
            </label>
            <input
              type="tel"
              className="form-control"
              id={`${modalType}Phone`}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor={`${modalType}Status`} className="form-label">
              الحالة
            </label>
            <select
              className="form-select"
              id={`${modalType}Status`}
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">اختر الحالة</option>
              <option value="نشط">نشط</option>
              <option value="غير نشط">غير نشط</option>
            </select>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer className="d-flex ">
        <Button variant="secondary" onClick={handleClose}>
          إلغاء
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {saveButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UserModal
