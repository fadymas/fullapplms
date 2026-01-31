// src/components/ui/DeleteExamModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteExamModal = ({ 
    show, 
    handleClose, 
    handleDelete, 
    examName 
}) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>تأكيد الحذف</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: '2.5rem' }} />
                <p>هل أنت متأكد من حذف هذا الامتحان؟</p>
                <p className="fw-bold text-danger">{examName}</p>
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

export default DeleteExamModal;