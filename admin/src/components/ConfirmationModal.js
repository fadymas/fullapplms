// src/components/ui/ConfirmationModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({ 
    show, 
    handleClose, 
    title, 
    message, 
    type = 'success',
    onConfirm 
}) => {
    const getIcon = () => {
        switch(type) {
            case 'success':
                return <FaCheckCircle className="text-success mb-3" style={{ fontSize: '3rem' }} />;
            case 'warning':
                return <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: '3rem' }} />;
            case 'danger':
                return <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: '3rem' }} />;
            default:
                return <FaCheckCircle className="text-success mb-3" style={{ fontSize: '3rem' }} />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch(type) {
            case 'danger': return 'danger';
            case 'warning': return 'warning';
            default: return 'primary';
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                {getIcon()}
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                {type !== 'success' && (
                    <Button variant="secondary" onClick={handleClose}>
                        إلغاء
                    </Button>
                )}
                <Button 
                    variant={getConfirmButtonVariant()} 
                    onClick={() => {
                        if (onConfirm) onConfirm();
                        handleClose();
                    }}
                >
                    {type === 'success' ? 'حسناً' : 'تأكيد'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;