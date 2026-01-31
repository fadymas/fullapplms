// src/components/ui/FilterModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';

const FilterModal = ({ 
    show, 
    handleClose, 
    applyFilter,
    gradeOptions,
    courseOptions 
}) => {
    const [filters, setFilters] = useState({
        studentName: '',
        grade: '',
        course: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        applyFilter(filters);
        handleClose();
    };

    const handleReset = () => {
        setFilters({
            studentName: '',
            grade: '',
            course: ''
        });
        applyFilter({
            studentName: '',
            grade: '',
            course: ''
        });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FaFilter className="me-2" />
                    تصفية الإمتحانات
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="filterForm">
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="studentName">اسم الطالب</Form.Label>
                        <Form.Control 
                            type="text" 
                            id="studentName"
                            placeholder="أدخل اسم الطالب"
                            value={filters.studentName}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="grade">الصف</Form.Label>
                        <Form.Select 
                            id="grade"
                            value={filters.grade}
                            onChange={handleChange}
                        >
                            {gradeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="course">الكورس</Form.Label>
                        <Form.Select 
                            id="course"
                            value={filters.course}
                            onChange={handleChange}
                        >
                            {courseOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleReset}>
                    إعادة تعيين
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    تطبيق التصفية
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FilterModal;