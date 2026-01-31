// src/pages/CourseDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import CourseHeader from '../components/CourseHeader';
import CourseLectures from '../components/CourseLectures';
import LectureFormModal from '../components/LectureFormModal';
import DeleteLectureModal from '../components/DeleteLectureModal';
import VideoPlayer from '../components/VideoPlayer';
import { courseDetailsData, lecturesData } from '../utils/courseDetailsData';
import '../styles/course-details.css';
import '../styles/video-player.css';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [filteredLectures, setFilteredLectures] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    
    // حالة المودالات
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    
    const [modalType, setModalType] = useState('add');
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [lectureToDelete, setLectureToDelete] = useState(null);
    
    // 🎯 الحل: إضافة حالة Sidebar محلية مع حفظ في localStorage
    const [collapsed, setCollapsed] = useState(() => {
        // قراءة الحالة من localStorage عند التحميل الأولي
        const savedState = localStorage.getItem('sidebarCollapsed');
        return savedState === 'true' ? true : false;
    });

    // 🎯 إضافة حالة Dark Mode
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    });

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', newState.toString());
    };
    
    // تحميل بيانات الكورس
    useEffect(() => {
        const fetchCourseData = () => {
            const foundCourse = courseDetailsData.find(c => c.id === parseInt(id));
            if (!foundCourse) {
                navigate('/teacher/courses');
                return;
            }
            
            setCourse(foundCourse);
            
            // فلترة المحاضرات الخاصة بهذا الكورس
            const courseLectures = lecturesData.filter(
                lecture => lecture.courseId === parseInt(id)
            );
            setLectures(courseLectures);
            setFilteredLectures(courseLectures);
        };
        
        fetchCourseData();
    }, [id, navigate]);

    // إضافة محاضرة جديدة
    const handleAddLecture = () => {
        setModalType('add');
        setSelectedLecture(null);
        setShowAddModal(true);
    };

    // تعديل محاضرة
    const handleEditLecture = (lecture) => {
        setModalType('edit');
        setSelectedLecture(lecture);
        setShowAddModal(true);
    };

    // حذف محاضرة
    const handleDeleteLecture = (lecture) => {
        setLectureToDelete(lecture);
        setShowDeleteModal(true);
    };

    // تأكيد الحذف
    const confirmDeleteLecture = () => {
        if (lectureToDelete) {
            const updatedLectures = lectures.filter(
                lecture => lecture.id !== lectureToDelete.id
            );
            setLectures(updatedLectures);
            setFilteredLectures(updatedLectures);
            setShowDeleteModal(false);
            setLectureToDelete(null);
        }
    };

    // حفظ المحاضرة
    const handleSaveLecture = (lectureData) => {
        if (modalType === 'add') {
            const newLecture = {
                id: lectures.length + 1,
                courseId: parseInt(id),
                courseName: course.title,
                lectureNumber: `Lecture ${lectures.length + 1}`,
                ...lectureData
            };
            
            setLectures([...lectures, newLecture]);
            setFilteredLectures([...filteredLectures, newLecture]);
        } else {
            const updatedLectures = lectures.map(lecture =>
                lecture.id === selectedLecture.id 
                    ? { ...lecture, ...lectureData }
                    : lecture
            );
            setLectures(updatedLectures);
            setFilteredLectures(updatedLectures);
        }
    };

    // مشاهدة الفيديو
    const handleWatchVideo = () => {
        setShowVideoModal(true);
    };

    // حساب العناصر للصفحة الحالية
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLectures = filteredLectures.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLectures.length / itemsPerPage);

    if (!course) {
        return (
            <div className={`loading-container ${darkMode ? 'dark-mode' : ''}`}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-3 text-dark-mode">جاري تحميل بيانات الكورس...</p>
            </div>
        );
    }

    return (
        <div className={`course-details-page ${darkMode ? 'dark-mode' : ''}`}>
            <Header 
                sidebarCollapsed={collapsed} 
                toggleSidebar={toggleSidebar}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />
            <Sidebar 
                collapsed={collapsed} 
                toggleSidebar={toggleSidebar}
                darkMode={darkMode}
            />
            
            <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}>
                <div className="container mt-5 pt-4">
                    <CourseHeader 
                        course={course}
                        onWatchVideo={handleWatchVideo}
                        darkMode={darkMode}
                    />
                    
                    <CourseLectures
                        lectures={currentLectures}
                        totalLectures={lectures.length}
                        onAddLecture={handleAddLecture}
                        onEditLecture={handleEditLecture}
                        onDeleteLecture={handleDeleteLecture}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        darkMode={darkMode}
                    />
                </div>
            </div>
            
            <Footer sidebarCollapsed={collapsed} darkMode={darkMode} />

            {/* مودال إضافة/تعديل محاضرة */}
            <LectureFormModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                handleSave={handleSaveLecture}
                modalType={modalType}
                lectureData={selectedLecture}
                gradeOptions={[
                    { value: 'first', label: 'الأول الثانوي' },
                    { value: 'second', label: 'الثاني الثانوي' },
                    { value: 'third', label: 'الثالث الثانوي' }
                ]}
                courseOptions={[
                    { value: 'history', label: 'تاريخ' },
                    { value: 'physics', label: 'فيزياء' },
                    { value: 'math', label: 'رياضيات' }
                ]}
                darkMode={darkMode}
            />

            {/* مودال تأكيد الحذف */}
            <DeleteLectureModal
                show={showDeleteModal}
                handleClose={() => {
                    setShowDeleteModal(false);
                    setLectureToDelete(null);
                }}
                handleDelete={confirmDeleteLecture}
                lectureNumber={lectureToDelete?.lectureNumber}
                courseName={lectureToDelete?.courseName}
                darkMode={darkMode}
            />

            {/* مودال مشاهدة الفيديو */}
            <VideoPlayer
                show={showVideoModal}
                handleClose={() => setShowVideoModal(false)}
                videoId={course.videoId}
                title={course.title}
                darkMode={darkMode}
            />
        </div>
    );
};

export default CourseDetails;