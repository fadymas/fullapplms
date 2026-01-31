// src/components/CourseCard.js (محدث مع Dark Mode تفاعلي)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';

function CourseCard({ 
  image, 
  title, 
  date, 
  price = 'مجاني', 
  description, 
  courseLink = "/course-details",
  enrolled = false,
  isOffer = false,
  showBothButtons = false,
  delay = 0,
  darkMode = false // إضافة prop للوضع الداكن
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : darkMode;
  });

  // تحديث Dark Mode من localStorage
  useEffect(() => {
    const checkDarkMode = () => {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        const isDark = JSON.parse(saved);
        setIsDarkMode(isDark);
      }
    };

    // تحقق عند التحميل
    checkDarkMode();
    
    // استمع لتغيرات localStorage من الـ Navbar
    window.addEventListener('storage', checkDarkMode);
    
    // التحقق كل 500ms للتأكد من المزامنة
    const interval = setInterval(checkDarkMode, 500);
    
    return () => {
      window.removeEventListener('storage', checkDarkMode);
      clearInterval(interval);
    };
  }, []);

  // تحديث عند تغيير prop
  useEffect(() => {
    setIsDarkMode(darkMode);
  }, [darkMode]);

  const cardStyle = {
    width: '414px',
    height: '333px',
    border: isDarkMode ? '1px solid #2d2d44' : '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    direction: 'rtl',
    backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
    color: isDarkMode ? '#e0e0e0' : '#333333',
    transition: 'all 0.3s ease',
    boxShadow: isDarkMode 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.05)'
  };

  const titleStyle = {
    marginBottom: '10px',
    textAlign: 'right',
    color: isDarkMode ? '#ffffff' : '#08345B',
    fontSize: '1rem',
    fontWeight: '700',
    minHeight: '3em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  };

  const dateStyle = {
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
    direction: 'rtl',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.85rem'
  };

  const descriptionStyle = {
    marginBottom: '20px',
    textAlign: 'right',
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    minHeight: '3.6em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  };

  const badgeStyle = {
    padding: '5px 12px',
    fontSize: '0.85rem',
    borderRadius: '20px',
    fontWeight: '600',
    backgroundColor: isOffer ? '#FFC107' : (price === 'مجاني' ? '#28a745' : '#4CACB7'),
    color: isOffer ? '#212529' : 'white'
  };

  const primaryButtonStyle = {
    backgroundColor: '#4CACB7',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    textDecoration: 'none',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    flexDirection: 'row-reverse',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  };

  const secondaryButtonStyle = {
    backgroundColor: isDarkMode ? '#2d2d44' : '#f8f9fa',
    color: isDarkMode ? '#e0e0e0' : '#08345B',
    border: `2px solid ${isDarkMode ? '#4CACB7' : '#4CACB7'}`,
    padding: '10px',
    borderRadius: '6px',
    textDecoration: 'none',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    flexDirection: 'row-reverse',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  };

  const handleButtonHover = (e, isPrimary = true) => {
    if (isPrimary) {
      e.target.style.backgroundColor = '#3a9a9a';
    } else {
      e.target.style.backgroundColor = '#4CACB7';
      e.target.style.color = 'white';
      e.target.style.borderColor = '#4CACB7';
    }
  };

  const handleButtonLeave = (e, isPrimary = true) => {
    if (isPrimary) {
      e.target.style.backgroundColor = '#4CACB7';
    } else {
      e.target.style.backgroundColor = isDarkMode ? '#2d2d44' : '#f8f9fa';
      e.target.style.color = isDarkMode ? '#e0e0e0' : '#08345B';
      e.target.style.borderColor = isDarkMode ? '#4CACB7' : '#4CACB7';
    }
  };

  return (
    <div className="col-lg-4 col-md-6 mb-4 d-flex justify-content-center">
      <div 
        className={`card card-course ${isDarkMode ? 'dark-mode-card' : ''}`}
        data-aos="fade-up"
        data-aos-delay={delay}
        style={cardStyle}
      >
        <Link to={courseLink} style={{ display: 'block', textDecoration: 'none' }}>
          <img 
            src={image} 
            className="card-img-top" 
            alt={title}
            style={{
              width: '100%',
              height: '161px',
              objectFit: 'cover',
              transition: 'all 0.3s ease'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/415x161/4CACB7/ffffff?text=الكورس+التعليمي';
            }}
            onMouseOver={(e) => {
              if (isDarkMode) {
                e.target.style.filter = 'brightness(0.8)';
              } else {
                e.target.style.filter = 'brightness(0.9)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        
        <div className="card-body" style={{ padding: '20px', direction: 'rtl' }}>
          <h5 
            className={`card-title-course fw-bold ${isDarkMode ? 'text-light' : ''}`}
            style={titleStyle}
          >
            {title}
          </h5>
          
          <div className="d-flex align-items-center justify-content-between mb-3" style={{ direction: 'ltr' }}>
            {/* سعر الكورس */}
            <span 
              className="badge"
              style={badgeStyle}
            >
              {price}
            </span>
            
            {/* تاريخ الكورس */}
            <small className={`d-flex align-items-center gap-2 ${isDarkMode ? 'text-light' : ''}`} style={dateStyle}>
              <span>{date}</span>
              <FaCalendarAlt style={{ 
                fontSize: '0.9rem', 
                color: isDarkMode ? '#4CACB7' : '#4CACB7' 
              }} />
            </small>
          </div>

          <p 
            className={`card-text small ${isDarkMode ? 'text-light' : ''}`}
            style={descriptionStyle}
          >
            {description}
          </p>
          
          {/* الأزرار */}
          <div className="buttons-container">
            {enrolled ? (
              <Link 
                to={courseLink} 
                className="btn w-100 d-flex align-items-center justify-content-center"
                style={primaryButtonStyle}
                onMouseOver={(e) => handleButtonHover(e, true)}
                onMouseOut={(e) => handleButtonLeave(e, true)}
              >
                <span>الدخول للكورس</span>
                <FaVideo style={{ fontSize: '1rem' }} />
              </Link>
            ) : showBothButtons ? (
              <>
                <Link 
                  to={courseLink} 
                  className="btn w-100 d-flex align-items-center justify-content-center mb-2"
                  style={primaryButtonStyle}
                  onMouseOver={(e) => handleButtonHover(e, true)}
                  onMouseOut={(e) => handleButtonLeave(e, true)}
                >
                  <span>الدخول للكورس</span>
                  <FaVideo style={{ fontSize: '1rem' }} />
                </Link>
                <Link 
                  to="/subscribe" 
                  className="btn w-100 d-flex align-items-center justify-content-center"
                  style={secondaryButtonStyle}
                  onMouseOver={(e) => handleButtonHover(e, false)}
                  onMouseOut={(e) => handleButtonLeave(e, false)}
                >
                  <span>الإشتراك في الكورس</span>
                  <FaCreditCard style={{ fontSize: '1rem' }} />
                </Link>
              </>
            ) : (
              <Link 
                to="/subscribe" 
                className="btn w-100 d-flex align-items-center justify-content-center"
                style={primaryButtonStyle}
                onMouseOver={(e) => handleButtonHover(e, true)}
                onMouseOut={(e) => handleButtonLeave(e, true)}
              >
                <span>الإشتراك في الكورس</span>
                <FaCreditCard style={{ fontSize: '1rem' }} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;