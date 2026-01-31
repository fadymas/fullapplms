// src/components/ui/ExamForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ExamForm = ({ 
    initialData, 
    onSave, 
    isEditing 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        course: '',
        lecture: '',
        examDate: '',
        examDuration: 60,
        examType: 'exam'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="card exam-form-card">
            <div className="card-body">
                <h5 className="mb-4 fw-bold">
                    {isEditing ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
                </h5>
                
                <Form id="examForm" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="name">اسم الامتحان</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="أدخل اسم الامتحان"
                                />
                            </Form.Group>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="grade">الصف</Form.Label>
                                <Form.Select 
                                    id="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">اختر الصف</option>
                                    <option value="الأول الثانوي">الأول الثانوي</option>
                                    <option value="الثاني الثانوي">الثاني الثانوي</option>
                                    <option value="الثالث الثانوي">الثالث الثانوي</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="course">الكورس</Form.Label>
                                <Form.Select 
                                    id="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">اختر الكورس</option>
                                    <option value="تاريخ">تاريخ</option>
                                    <option value="رياضيات">رياضيات</option>
                                    <option value="فيزياء">فيزياء</option>
                                    <option value="كيمياء">كيمياء</option>
                                    <option value="لغة عربية">لغة عربية</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="lecture">المحاضرة</Form.Label>
                                <Form.Select 
                                    id="lecture"
                                    value={formData.lecture}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">اختر المحاضرة</option>
                                    <option value="المحاضرة 1">المحاضرة 1</option>
                                    <option value="المحاضرة 2">المحاضرة 2</option>
                                    <option value="المحاضرة 3">المحاضرة 3</option>
                                    <option value="المحاضرة 4">المحاضرة 4</option>
                                    <option value="المحاضرة 5">المحاضرة 5</option>
                                    <option value="جميع المحاضرات">جميع المحاضرات</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="examDate">تاريخ الامتحان</Form.Label>
                                <Form.Control 
                                    type="datetime-local" 
                                    id="examDate"
                                    value={formData.examDate || getCurrentDateTime()}
                                    onChange={handleChange}
                                    required
                                    min={getCurrentDateTime()}
                                />
                            </Form.Group>
                        </div>

                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="examDuration">مدة الامتحان (بالدقائق)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    id="examDuration"
                                    value={formData.examDuration}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    placeholder="مثال: 60"
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label htmlFor="examType">نوع النشاط</Form.Label>
                                <Form.Select 
                                    id="examType"
                                    value={formData.examType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="exam">امتحان</option>
                                    <option value="homework">واجب منزلي</option>
                                    <option value="quiz">اختبار قصير</option>
                                    <option value="midterm">منتصف الفصل</option>
                                    <option value="final">نهائي</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                        <Link to="/teacher/exams" className="btn btn-secondary">
                            <FaArrowLeft className="me-2" />
                            العودة لقائمة الامتحانات
                        </Link>
                        
                        <Button type="submit" variant="success">
                            <FaSave className="me-2" />
                            {isEditing ? 'تحديث الامتحان' : 'حفظ الامتحان'}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ExamForm;