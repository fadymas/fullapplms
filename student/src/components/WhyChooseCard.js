// src/components/WhyChooseCard.js
import React, { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'

function WhyChooseCard({
  icon: IconComponent, // تغيير من IconComponent إلى icon للتشابه مع المثال
  title,
  description,
  delay = 0,
  hasButton = false,
  buttonText = 'انضم الآن'
}) {
  const [hovered, setHovered] = useState(false)
  const [buttonHovered, setButtonHovered] = useState(false)

  return (
    <div className="col-lg-3 col-md-6">
      <div
        className="card h-100 border-0 why-choose-card"
        data-aos="flip-left"
        data-aos-delay={delay}
        data-aos-once="true"
        style={{
          backgroundColor: hovered ? '#4CACB7' : '#EBF7F6',
          borderRadius: '15px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: hovered ? '0 10px 25px rgba(76, 172, 183, 0.3)' : '0 2px 10px rgba(0,0,0,0.08)'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="card-body text-center d-flex flex-column align-items-center justify-content-center p-4">
          {/* الأيقونة */}
          <div
            className="mb-3 display-6"
            style={{
              color: hovered ? 'white' : '#4CACB7',
              fontSize: '3rem',
              transition: 'color 0.3s ease'
            }}
          >
            {IconComponent}
          </div>

          {/* العنوان */}
          <h5
            className="fw-bold mb-3"
            style={{
              color: hovered ? 'white' : 'inherit',
              transition: 'color 0.3s ease'
            }}
          >
            {title}
          </h5>

          {/* الوصف */}
          <p
            className="small mb-4"
            style={{
              color: hovered ? 'rgba(255,255,255,0.9)' : '#666',
              transition: 'color 0.3s ease',
              lineHeight: '1.6'
            }}
          >
            {description}
          </p>

          {/* الزر - إن وجد */}
          {hasButton && (
            <button
              className="btn why-choose-button"
              style={{
                backgroundColor: '#4CACB7',
                color: 'white',
                border: 'none',
                padding: '10px 25px',
                borderRadius: '25px',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transform: buttonHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: buttonHovered
                  ? '0 5px 15px rgba(76, 172, 183, 0.4)'
                  : '0 2px 8px rgba(76, 172, 183, 0.2)'
              }}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              {buttonText}
              <FaArrowLeft />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WhyChooseCard
