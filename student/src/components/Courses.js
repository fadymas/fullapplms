import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import courseImage from '../images/register.png'; // استيراد الصورة بشكل صحيح

const Courses = () => {
  useEffect(() => {
    // تهيئة Swiper بعد تحميل المكون
    const swiper = new Swiper('.swiper-course', {
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  const courses = [
    {
      id: 1,
      title: 'مراجعة شهر نوفمبر اولي ثانوي',
      date: '10 مارس 2025',
      description: 'دورة شاملة تغطي أهم الموضوعات مع شروحات مبسطة وتمارين تطبيقية ومراجعات سريعة لتثبيت المعلومات.',
      isFree: true
    },
    {
      id: 2,
      title: 'مراجعة شهر نوفمبر ثانية ثانوي',
      date: '22 أبريل 2025',
      description: 'تتضمن الدورة فيديوهات قصيرة، أوراق عمل قابلة للطباعة، واختبارات تقييم ذاتي لقياس التقدم.',
      isFree: true
    },
    {
      id: 3,
      title: 'مراجعة شهر نوفمبر ثالثة ثانوي',
      date: '05 مايو 2025',
      description: 'محتوى متدرج يتضمن شروحات نظرية وأمثلة محلولة وتمارين إضافية لدعم الفهم العميق.',
      isFree: true
    },
    {
      id: 4,
      title: 'مراجعة شهر نوفمبر ثالثة ثانوي',
      date: '15 يونيو 2025',
      description: 'دورة مركزة للطلاب المستعدين للامتحانات النهائية مع ملخصات ونماذج امتحان مشابهة للأصلية.',
      isFree: true
    }
  ];

  return (
    <div className="courses pb-5" style={{ position: 'relative' }}>
      <div className="container">
        <h2 className="mb-5 fw-bold text-center"> الكورسات المتاحة </h2>
        <div className="swiper swiper-course">
          <div className="swiper-wrapper pt-5">
            {courses.map((course) => (
              <div className="swiper-slide d-flex align-items-stretch" key={course.id}>
                <div className="card h-100 w-100 card-course" style={{ backgroundColor: '#EBF7F6' }}>
                  <a href="#">
                    <img 
                      src={courseImage} // استخدام الصورة المستوردة مباشرة
                      className="card-img-top" 
                      alt={course.title}
                      style={{
                        width: '100%',
                        maxWidth: '418px',
                        height: '169px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/418x169/EBF7F6/4CACB7?text=Course+Image';
                      }}
                    />
                  </a>
                  <div className="card-body">
                    <h5 className="card-title-course fw-bold">{course.title}</h5>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <small className="text-muted">
                        <FaCalendarAlt className="me-1" />
                        {course.date}
                      </small>
                      <span className="badge bg-success">مجاني</span>
                    </div>
                    <p className="card-text card-description">{course.description}</p>
                    <Link 
                      to={`/course-details/${course.id}`} 
                      className="btn w-100"
                      style={{
                        backgroundColor: '#4CACB7',
                        color: 'white',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#3a8d99';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4CACB7';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      ابدأ الدورة <FaPlay className="ms-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* أزرار التنقل - تم تعديل موقعها */}
          <div className="swiper-button-next" style={{ 
            top: '50px',
            right: '10px',
            color: '#4CACB7'
          }}>
            <FaChevronLeft />
          </div>
          <div className="swiper-button-prev" style={{ 
            top: '50px',
            left: '10px',
            color: '#4CACB7'
          }}>
            <FaChevronRight />
          </div>
        </div>
        <div className="d-flex justify-content-center mt-5">
          <Link 
            to="/courses" 
            className="btn btn-lg px-5"
            style={{
              backgroundColor: '#EBF7F6',
              color: '#4CACB7',
              border: '1px solid #4CACB7',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#4CACB7';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#EBF7F6';
              e.target.style.color = '#4CACB7';
            }}
          >
            عرض المزيد
          </Link>
        </div>
      </div>

      <style jsx>{`
        /* تخصيص أزرار التنقل */
        .swiper-button-next,
        .swiper-button-prev {
          background-color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: #4CACB7;
          color: white !important;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          display: none;
        }
        
        /* تحسين ظهور الصور */
        .card-img-top {
          width: 100%;
          max-width: 418px;
          height: 169px;
          object-fit: cover;
        }
        
        /* جعل جميع الكروت متساوية الارتفاع */
        .swiper-slide {
          height: auto;
        }
        
        .card-course {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .card-body {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        .card-description {
          flex-grow: 1;
          min-height: 120px;
        }
        
        /* تحسين زر ابدأ الدورة */
        .btn:hover {
          box-shadow: 0 4px 8px rgba(76, 172, 183, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Courses;