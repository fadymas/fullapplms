// src/components/ui/CourseFormModal.jsx
import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

const CourseFormModal = ({
  show,
  handleClose,
  handleSave,
  modalType,
  courseData,
  gradeOptions,
  categoryOptions
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    category: '',
    price: '',
    link: '',
    imagePreview: '',
    imageFile: null,
    status: ''
  })

  useEffect(() => {
    if (courseData) {
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        grade: courseData.grade || '',
        category: courseData.categoryText || courseData.category || '',
        price: courseData.price || '',
        link: courseData.link || '',
        imagePreview: courseData.image || '',
        imageFile: null,
        status: courseData.status || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        grade: '',
        category: '',
        price: '',
        link: '',
        imagePreview: '',
        imageFile: null,
        status: ''
      })
    }
  }, [courseData])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagePreview: reader.result,
          imageFile: file
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setFormData((prev) => ({
        ...prev,
        imagePreview: '',
        imageFile: null
      }))
    }
  }

  const handleSubmit = () => {
    const dataToSave = {
      ...formData,
      gradeText: gradeOptions.find((g) => g.value === formData.grade)?.label || '',
      categoryText: formData.category,
      // Provide a separate field with the actual File object for the parent to send via FormData
      thumbnailFile: formData.imageFile
    }
    handleSave(dataToSave)
    handleClose()
  }

  const modalTitle = modalType === 'create' ? 'إنشاء كورس جديد' : 'تعديل الكورس'
  const saveButtonText = modalType === 'create' ? 'إنشاء الكورس' : 'حفظ التغييرات'

  return (
    <Modal show={show} onHide={handleClose} className="course-modal-lg" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form encType="multipart/form-data">
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="grade">الصف الدراسي</Form.Label>
              <Form.Select id="grade" value={formData.grade} onChange={handleChange} required>
                <option value="">اختر الصف الدراسي</option>
                {gradeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="title">عنوان الكورس</Form.Label>
              <Form.Control
                type="text"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="image">صورة الكورس</Form.Label>
              <Form.Control type="file" id="image" accept="image/*" onChange={handleFileChange} />
              {formData.imagePreview && (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="course-form-image-preview mt-2"
                />
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="link">رابط الكورس</Form.Label>
              <Form.Control
                type="url"
                id="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://example.com/course-link"
              />
            </div>
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="description">وصف الكورس</Form.Label>
            <Form.Control
              as="textarea"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="price">السعر</Form.Label>
              <Form.Control
                type="number"
                id="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="category">الفئة</Form.Label>
              <Form.Control
                type="text"
                id="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="اكتب الفئة"
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="status">الحالة</Form.Label>
              <Form.Select id="status" value={formData.status} onChange={handleChange} required>
                <option value="">اختر الحالة</option>
                <option value="draft">مسودة</option>
                <option value="pending">قيد المراجعة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </Form.Select>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
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

export default CourseFormModal
