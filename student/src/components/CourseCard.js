// src/components/CourseCard.js
import React from 'react'
import '../styles/CourseCard.css'

// استيراد الأيقونات من react-icons
import { FaVideo, FaCreditCard, FaCalendarAlt } from 'react-icons/fa'

function CourseCard({
  image,
  title,
  date,
  price,
  description,
  courseLink,
  enrolled = false,
  isOffer = false,
  showBothButtons = false,
  darkMode = false,
  isMyCourses = false
}) {
  // تحديد هل يجب عرض الزر الثانوي (اشتراك) أم لا
  const showSecondaryButton = (isOffer || showBothButtons) && !enrolled && !isMyCourses

  return (
    <div className={`card course-card ${darkMode ? 'dark-mode' : ''}`}>
      <img src={image} className="card-img-top course-card-img" alt={title} />
      <div className="card-body course-card-body">
        <h5 className="course-card-title">{title}</h5>

        <div className="course-card-date">
          <FaCalendarAlt className="date-icon" />
          <span>{date}</span>
        </div>

        <div className={`price-badge ${isOffer ? 'offer-badge' : 'regular-badge'}`}>{price}</div>

        <p className="course-card-description">{description}</p>

        <div className="buttons-container">
          {/* الزر الأساسي (الدخول للكورس) - يظهر دائماً */}
          <a href={courseLink} className="btn btn-course-primary w-100 mb-2">
            <span>
              {enrolled || isMyCourses
                ? isMyCourses
                  ? 'استمر في التعلم'
                  : 'الدخول للكورس'
                : 'الدخول للكورس'}
            </span>
            <FaVideo className="btn-icon" />
          </a>

          {/* الزر الثانوي أو مساحة محجوزة له */}
          {showSecondaryButton ? (
            <a href={courseLink} className="btn btn-course-secondary w-100">
              <span>اشترك الآن</span>
              <FaCreditCard className="btn-icon" />
            </a>
          ) : (
            // زر وهمي للحفاظ على نفس المساحة والشكل
            <div
              className="btn btn-course-secondary w-100"
              style={{ visibility: 'hidden', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              <span>placeholder</span>
              <FaCreditCard className="btn-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCard
