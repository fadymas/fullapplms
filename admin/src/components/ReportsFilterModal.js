// src/components/ui/ReportsFilterModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaFilter, FaRedo } from 'react-icons/fa';

const ReportsFilterModal = ({ 
    show, 
    handleClose, 
    applyFilter,
    resetFilter,
    courseOptions,
    lectureOptions,
    attendanceOptions 
}) => {
    const [filters, setFilters] = useState({
        studentName: '',
        course: '',
        lecture: '',
        attendance: ''
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
            course: '',
            lecture: '',
            attendance: ''
        });
        resetFilter();
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FaFilter className="me-2" />
                    تصفية التقارير
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="filterForm" onSubmit={handleSubmit}>
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
                    
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="lecture">المحاضرة</Form.Label>
                        <Form.Select 
                            id="lecture"
                            value={filters.lecture}
                            onChange={handleChange}
                        >
                            {lectureOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="attendance">الحضور</Form.Label>
                        <Form.Select 
                            id="attendance"
                            value={filters.attendance}
                            onChange={handleChange}
                        >
                            {attendanceOptions.map(option => (
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
                    <FaRedo className="me-2" />
                    إعادة تعيين
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    تطبيق التصفية
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReportsFilterModal;