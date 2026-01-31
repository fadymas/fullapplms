// src/components/ui/CoursesGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaLink, FaEdit, FaTrash, FaUsers, FaStar } from 'react-icons/fa';

const CoursesGrid = ({ courses, onEdit, onDelete }) => {
    return (
        <div className="courses-grid">
            {courses.map((course) => (
                <div key={course.id} className="course-card-custom card">
                    <Link to={`/teacher/courses/${course.id}`}> {/* غير هنا */}
                        <img 
                            src={course.image} 
                            className="course-card-img card-img-top" 
                            alt={course.title}
                            onError={(e) => {
                                e.target.src = "/images/home.webp";
                            }}
                        />
                    </Link>
                    <div className="course-card-body">
                        <Link to={`/teacher/courses/${course.id}`} className="link-color"> {/* وغير هنا */}
                            <h5 className="course-card-title fw-bold">{course.title}</h5>
                        </Link>

                        <div className="course-card-meta">
                            <small className="course-card-date d-flex align-items-center">
                                <FaCalendarAlt className="me-1" />
                                {course.date}
                            </small>
                            <span className="course-card-price badge bg-success">
                                {course.price} جنية
                            </span>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                            <span className="badge bg-info">{course.gradeText}</span>
                            <span className="badge bg-warning text-dark">{course.categoryText}</span>
                        </div>

                        <p className="course-card-description">{course.description}</p>

                        <div className="d-flex justify-content-between mb-2 text-muted small">
                            <span className="d-flex align-items-center">
                                <FaUsers className="me-1" />
                                {course.studentsCount} طالب
                            </span>
                            <span className="d-flex align-items-center">
                                <FaStar className="me-1 text-warning" />
                                {course.rating}
                            </span>
                        </div>

                        <Link 
                            to={`/teacher/courses/${course.id}`} 
                            className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center"
                        >
                            <FaLink className="ms-2" />
                            رابط الكورس
                        </Link>
                        
                        <div className="course-card-actions">
                            <button 
                                className="btn btn-outline-success d-flex align-items-center justify-content-center"
                                onClick={() => onEdit(course)}
                            >
                                <FaEdit className="ms-1" />
                                تعديل
                            </button>
                            <button 
                                className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                                onClick={() => onDelete(course)}
                            >
                                <FaTrash className="ms-1" />
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CoursesGrid;