import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import TablePagination from '../components/TablePagination';
import useUIStore from '../store/uiStore';
import '../styles/MyCoursesPage.css';
import courseImage from '../images/home.webp';

import courseService from '../api/course.service';

function MyCoursesPage() {
  const { darkMode } = useUIStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState([]);
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await courseService.getMyEnrollments();
        setMyCourses(data.results.map(enroll => ({
          id: enroll.course,
          image: courseImage, // API might need to provide thumbnail in enrollment list for better UX
          title: enroll.course_title,
          date: new Date(enroll.enrolled_at).toLocaleDateString('ar-EG'),
          price: '', // Price is not typically relevant in 'My Courses'
          description: '',
          courseLink: `/course/${enroll.course}`,
          enrolled: true,
          progress: enroll.progress_percentage
        })));
      } catch (err) {
        console.error('Failed to fetch enrollments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const totalPages = Math.ceil(myCourses.length / coursesPerPage);
  const currentCourses = myCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`my-courses-container ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardNavbar />
      <Sidebar activePage="my-courses" />

      <div className={`main-content my-courses-page ${darkMode ? 'dark-mode-bg' : ''}`}>
        <div className="container mt-5 pt-4">
          <h2 className={`mb-4 text-center section-title ${darkMode ? 'text-light' : ''}`}>كورساتي</h2>

          <div className="courses pt-2">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-info" role="status"></div>
                <p className={`mt-3 ${darkMode ? 'text-light' : 'text-muted'}`}>جار تحميل كورساتك...</p>
              </div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-5">
                <h5 className={darkMode ? 'text-light' : ''}>لا يوجد كورسات مسجلة بعد</h5>
                <Link to="/courses" className="btn btn-primary mt-3">تصفح الكورسات</Link>
              </div>
            ) : (
              <>
                <div className="row justify-content-center g-4">
                  {currentCourses.map(course => (
                    <div className="col-lg-4 col-md-6" key={course.id}>
                      <CourseCard {...course} darkMode={darkMode} isMyCourses={true} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-5">
                    <TablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={myCourses.length}
                      itemsPerPage={coursesPerPage}
                      onPageChange={handlePageChange}
                      darkMode={darkMode}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MyCoursesPage;