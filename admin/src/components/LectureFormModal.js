// src/components/ui/LectureFormModal.jsx
import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

const LectureFormModal = ({
  show,
  handleClose,
  handleSave,
  modalType,
  lectureData,
  gradeOptions, // kept to avoid breaking callers (unused)
  courseOptions // kept to avoid breaking callers (unused)
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    lecture_type: 'video',
    is_free: false,
    duration_minutes: '',
    order: ''
  })

  useEffect(() => {
    if (lectureData) {
      setFormData({
        title: lectureData.title ?? '',
        section: lectureData.section,
        description: lectureData.description ?? '',
        content: lectureData.content ?? '',
        video_url: lectureData.video_url ?? '',
        lecture_type: lectureData.lecture_type ?? 'video',
        is_free: !!lectureData.is_free,
        duration_minutes: lectureData.duration_minutes ?? '',
        order: lectureData.order ?? ''
      })
    } else {
      setFormData({
        title: '',
        section: '',
        description: '',
        content: '',
        video_url: '',
        lecture_type: 'video',
        is_free: false,
        duration_minutes: '',
        order: ''
      })
    }
  }, [lectureData])

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      title: formData.title,
      section: formData.section,
      description: formData.description || '',
      content: formData.content || '',
      lecture_type: formData.lecture_type,
      is_free: !!formData.is_free
    }
    if (formData.video_url) payload.video_url = formData.video_url
    if (formData.duration_minutes !== '')
      payload.duration_minutes = Number(formData.duration_minutes)
    if (formData.order !== '') payload.order = Number(formData.order)
    handleSave(payload)
    handleClose()
  }

  const modalTitle = modalType === 'add' ? 'إضافة محاضرة' : 'تعديل المحاضرة'
  const saveButtonText = modalType === 'add' ? 'حفظ' : 'حفظ التغييرات'

  return (
    <Modal show={show} onHide={handleClose} className="lecture-modal-lg" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="order">الترتيب</Form.Label>
              <Form.Control
                type="number"
                id="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="مثال: 1"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="section">قسم</Form.Label>
              <Form.Control
                type="number"
                id="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="مثال: 1"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="title">العنوان*</Form.Label>
              <Form.Control
                type="text"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="lecture_type">نوع المحاضرة</Form.Label>
              <Form.Select id="lecture_type" value={formData.lecture_type} onChange={handleChange}>
                <option value="video">فيديو</option>
                <option value="text">نص</option>
                <option value="file">ملف</option>
              </Form.Select>
            </div>
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="description">الوصف</Form.Label>
            <Form.Control
              as="textarea"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="content">المحتوى</Form.Label>
            <Form.Control
              as="textarea"
              id="content"
              rows={5}
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="video_url">رابط الفيديو</Form.Label>
              <Form.Control
                type="url"
                id="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://example.com/video.mp4"
              />
            </div>
            <div className="col-md-6 mb-3 d-flex align-items-center">
              <div className="form-check mt-4">
                <Form.Check
                  type="checkbox"
                  id="is_free"
                  checked={formData.is_free}
                  onChange={handleChange}
                  label="مجاني"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label htmlFor="duration_minutes">المدة (بالدقائق)</Form.Label>
              <Form.Control
                type="number"
                id="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="مثال: 25"
              />
            </div>
          </div>

          <div className="border-top pt-3 d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              {saveButtonText}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default LectureFormModal
