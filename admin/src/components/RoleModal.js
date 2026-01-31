// src/components/ui/RoleModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const RoleModal = ({ 
    show, 
    handleClose, 
    handleSave, 
    modalType, 
    roleData,
    roleOptions 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selectedRole: ''
    });

    useEffect(() => {
        if (roleData) {
            setFormData({
                name: roleData.name || '',
                description: roleData.description || '',
                selectedRole: roleData.name || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                selectedRole: ''
            });
        }
    }, [roleData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id.replace('add', '').replace('edit', '').toLowerCase()]: value
        }));
    };

    const handleSubmit = () => {
        const dataToSave = {
            name: formData.selectedRole || formData.name,
            description: formData.description
        };
        handleSave(dataToSave);
        handleClose();
    };

    const modalTitle = modalType === 'add' ? 'إضافة دور جديد' : 'تعديل الدور';
    const saveButtonText = modalType === 'add' ? 'حفظ' : 'حفظ التغييرات';

    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            className="users-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id={`${modalType}RoleForm`}>
                    <Form.Group className="mb-3">
                        <Form.Label>الاسم</Form.Label>
                        <Form.Control 
                            type="text" 
                            id={`${modalType}Name`}
                            value={formData.name}
                            onChange={handleChange}
                            required 
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>اسم الدور</Form.Label>
                        <Form.Select 
                            id={`${modalType}RoleSelect`}
                            value={formData.selectedRole}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>اختر دور</option>
                            {roleOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>الوصف</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            id={`${modalType}Description`}
                            value={formData.description}
                            onChange={handleChange}
                            required 
                        />
                    </Form.Group>
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
    );
};

export default RoleModal;