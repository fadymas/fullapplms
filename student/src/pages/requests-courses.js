import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

// Stores
import useUIStore from '../store/uiStore';

// Style & Icons
import '../styles/requests-courses.css';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaVideo, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Assets
import homeImage1 from '../images/home.webp';

function RequestsCoursesPage() {
  const { darkMode } = useUIStore();
  const [courses] = useState([
    {
      id: 1,
      title: "مراجعة شهر نوفمبر اولي ثانوي",
      date: "10 مارس 2025",
      price: "100 جنية",
      description: "دورة شاملة تغطي أهم الموضوعات مع شروحات مبسطة وتمارين تطبيقية.",
      image: homeImage1
    },
    // ... other courses
  ]);

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({ duration: 800 });
    }
  }, []);

  return (
    <div className={`requests-courses-page ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardNavbar />
      <Sidebar activePage="requests-courses" />

      <div className="main-content">
        <div className="container mt-5 pt-4">
          <h2 className="mb-4 text-center">كورساتنا المقترحة</h2>

          <div className="courses pt-2">
            <div className="row text-start">
              {courses.map((course) => (
                <div className="col-lg-4 col-md-6 mb-4" key={course.id}>
                  <div className="card h-100 w-100 card-course">
                    <Link to={`/course-details/${course.id}`}>
                      <img src={course.image} className="card-img-top" alt={course.title} />
                    </Link>
                    <div className="card-body">
                      <h5 className="card-title-course fw-bold">{course.title}</h5>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <small className="d-flex align-items-center text-muted-custom">
                          <FaCalendarAlt className="me-1" /> {course.date}
                        </small>
                        <span className="badge bg-success">{course.price}</span>
                      </div>
                      <p className="card-text card-description">{course.description}</p>
                      <Link to={`/course-details/${course.id}`} className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center">
                        <span className="me-2">الدخول للكورس</span> <FaVideo />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mt-4 mb-5">
              <li className="page-item"><button className="page-link"><FaChevronRight /></button></li>
              <li className="page-item active"><button className="page-link">1</button></li>
              <li className="page-item"><button className="page-link"><FaChevronLeft /></button></li>
            </ul>
          </nav>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RequestsCoursesPage;