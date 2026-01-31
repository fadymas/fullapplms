// src/components/ui/DeleteRoleModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';

const DeleteRoleModal = ({ 
    show, 
    handleClose, 
    handleDelete, 
    roleName 
}) => {
    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            className="delete-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>حذف الدور</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <h2><FaTrashAlt className="text-danger" style={{ fontSize: '3rem' }} /></h2>
                <p>هل أنت متأكد من حذف هذا الدور؟</p>
                <p id="deleteRoleName" className="fw-bold">{roleName}</p>
                <small className="text-muted">سيتم إزالة جميع المستخدمين المرتبطين بهذا الدور</small>
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

export default DeleteRoleModal;