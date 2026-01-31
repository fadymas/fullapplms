// src/components/ui/CoursesGrid.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarAlt, FaEye, FaBullhorn } from 'react-icons/fa'
import authService from '../api/auth.service'
import useAuthStore from '../store/authStore'

const CoursesGrid = ({ courses }) => {
  const { user } = useAuthStore()(courses)
  return (
    <div className="suggested-courses-section">
      <h5 className="mb-4 pt-5 fw-bold">الكورسات المقترحة للترويج</h5>
      <div className="courses pt-2">
        <div className="row text-start">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div className="col-lg-4 col-md-6 mb-4" key={index}>
                <div className="card h-100 w-100 card-course">
                  <Link to={`/course-details/${course.id || index}`}>
                    <img
                      src={course.image || '/images/home.webp'}
                      className="card-img-top"
                      alt={course.title || 'Course'}
                      onError={(e) => {
                        e.target.src = '/images/home.webp'
                      }}
                    />
                  </Link>
                  <div className="card-body">
                    <h5 className="card-title-course fw-bold">
                      {course.title || 'مراجعة شهر نوفمبر اولي ثانوي'}
                    </h5>

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-success">
                        {course.price ? `${course.price} جنية` : '100 جنية'}
                      </span>
                    </div>

                    {/* زر "عرض التفاصيل" موجه لمسار /teacher/courses/1 */}
                    <Link
                      to={`/${user.role}/courses/${course.id || index}`}
                      className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center"
                    >
                      عرض التفاصيل
                      <FaEye className="ms-2" />
                    </Link>

                    <button className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center">
                      ترويج الكورس
                      <FaBullhorn className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12"> لا توجد كورسات حالياً</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursesGrid
