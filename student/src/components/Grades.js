import React from 'react';
import { FaDesktop } from 'react-icons/fa';

// استيراد الصورة باستخدام require
import posterImage from '../images/register.png';

const Grades = () => {
  const grades = [
    {
      title: 'الصف الأول الثانوي',
      description: 'تعلم أساسيات المواد الدراسية للصف الأول الثانوي بطريقة ممتعة وتفاعلية.',
      image: posterImage,
      delay: 0
    },
    {
      title: 'الصف الثاني الثانوي',
      description: 'تعلم أساسيات المواد الدراسية للصف الثاني الثانوي بطريقة ممتعة وتفاعلية.',
      image: posterImage,
      delay: 100
    },
    {
      title: 'الصف الثالث الثانوي',
      description: 'تعلم أساسيات المواد الدراسية للصف الثالث الثانوي بطريقة ممتعة وتفاعلية.',
      image: posterImage,
      delay: 200
    }
  ];

  return (
    <div className="courses pb-5 pt-2" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="row text-start">
          <h2 className="mb-5 text-center fw-bold"> الصفوف الدراسية </h2>
          {grades.map((grade, index) => (
            <div className="col-lg-4 col-md-6 mb-4 d-flex justify-content-center" key={index}>
              <div 
                className="card card-course" 
                data-aos="fade-up" 
                data-aos-delay={grade.delay}
                style={{
                  width: '414px',
                  height: '333px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <a href="#">
                  <img 
                    src={grade.image} 
                    className="card-img-top" 
                    alt={grade.title}
                    style={{
                      width: '100%',
                      height: '161px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/415x161/4CACB7/ffffff?text=الصف+الدراسي';
                    }}
                  />
                </a>
                <div className="card-body" style={{ padding: '20px' }}>
                  <h5 className="card-title-course fw-bold" style={{ marginBottom: '10px' }}>
                    {grade.title}
                  </h5>
                  <p className="card-text small text-muted" style={{ marginBottom: '20px' }}>
                    {grade.description}
                  </p>
                  <a 
                    href="#" 
                    className="btn w-100 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: '#4CACB7',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#3a9a9a'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4CACB7'}
                  >
                    عرض الكورسات <FaDesktop />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grades;