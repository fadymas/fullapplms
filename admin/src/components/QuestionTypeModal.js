// src/components/ui/QuestionTypeModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaListUl, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { questionTypes } from '../utils/questionsData';

const QuestionTypeModal = ({ show, handleClose, onSelectType }) => {
    const handleTypeSelect = (typeId) => {
        onSelectType(typeId);
        handleClose();
    };

    const getIcon = (iconName) => {
        switch(iconName) {
            case 'list-ul': return <FaListUl />;
            case 'check-circle': return <FaCheckCircle />;
            case 'edit': return <FaEdit />;
            default: return <FaListUl />;
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="question-type-modal">
            <Modal.Header closeButton>
                <Modal.Title>اختر نوع السؤال</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-grid gap-3">
                    {questionTypes.map((type) => (
                        <Button
                            key={type.id}
                            variant={`outline-${type.color}`}
                            className="question-type-btn d-flex flex-column align-items-center justify-content-center py-4"
                            onClick={() => handleTypeSelect(type.id)}
                        >
                            <div className="mb-2" style={{ fontSize: '2rem' }}>
                                {getIcon(type.icon)}
                            </div>
                            <h6 className="mb-1">{type.name}</h6>
                            <small className="text-muted">{type.description}</small>
                        </Button>
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default QuestionTypeModal;