// src/components/ui/DeleteLectureModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteLectureModal = ({ 
    show, 
    handleClose, 
    handleDelete, 
    lectureNumber,
    courseName 
}) => {
    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>تأكيد الحذف</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <h2><FaExclamationTriangle className="text-danger" style={{ fontSize: '3rem' }} /></h2>
                <p>هل أنت متأكد من حذف هذه المحاضرة؟</p>
                <p className="fw-bold">
                    {courseName} - {lectureNumber}
                </p>
                <p className="text-muted">لا يمكن التراجع عن هذا الإجراء.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    إلغاء
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    حذف
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteLectureModal;