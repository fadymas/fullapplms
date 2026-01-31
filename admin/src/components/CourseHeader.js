// src/components/course/CourseHeader.jsx
import React from 'react';
import { 
    FaUser, 
    FaClock, 
    FaCalendarAlt, 
    FaUsers, 
    FaBook,
    FaPlayCircle 
} from 'react-icons/fa';

const CourseHeader = ({ course, onWatchVideo }) => {
    return (
        <div className="course-header mb-4">
            <div className="card">
                <img 
                    src={course.image || 'images/home.webp'} 
                    className="card-img-top course-image" 
                    alt={course.title}
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
                
                <div className="card-body">
                    <div className="d-lg-flex justify-content-between align-items-start mb-4">
                        <h1 className="card-title fw-bold mb-3">
                            {course.title}
                        </h1>
                        <button 
                            onClick={onWatchVideo}
                            className="btn btn-primary px-5 d-flex align-items-center"
                        >
                            <FaPlayCircle className="me-2" />
                            مشاهدة الفيديو
                        </button>
                    </div>
                    
                    <p className="card-text lead course-description">
                        {course.description}
                    </p>
                    
                    <div className="row mb-1 pt-2">
                        <div className="col-md-6 mb-2">
                            <p className="course-info">
                                <FaUser className="me-2 text-primary" />
                                <strong>المعلم:</strong> {course.teacher}
                            </p>
                        </div>
                        <div className="col-md-6 mb-2">
                            <p className="course-info">
                                <FaClock className="me-2 text-primary" />
                                <strong>المدة:</strong> {course.duration}
                            </p>
                        </div>
                    </div>
                    
                    <div className="row mb-3">
                        <div className="col-md-6 mb-2">
                            <p className="course-info">
                                <FaCalendarAlt className="me-2 text-primary" />
                                <strong>تاريخ البدء:</strong> {course.startDate}
                            </p>
                        </div>
                        <div className="col-md-6 mb-2">
                            <p className="course-info">
                                <FaUsers className="me-2 text-primary" />
                                <strong>عدد الطلاب:</strong> {course.studentsCount} طالب
                            </p>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-md-6 mb-2">
                            <p className="course-info">
                                <FaBook className="me-2 text-primary" />
                                <strong>التخصص:</strong> {course.specialization}
                            </p>
                        </div>
                        <div className="col-md-6 mb-2">
                            <p className="course-info">
                                <FaCalendarAlt className="me-2 text-primary" />
                                <strong>تاريخ النشر:</strong> {course.publishDate}
                            </p>
                        </div>
                    </div>
                    
                    {course.price && (
                        <div className="mt-3">
                            <span className="badge bg-success fs-6 p-2">
                                السعر: {course.price} جنيه
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseHeader;