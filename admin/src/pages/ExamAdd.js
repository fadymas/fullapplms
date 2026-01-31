// src/pages/teacher/ExamAdd.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import QuestionTypeModal from '../components/QuestionTypeModal';
import ExamForm from '../components/ExamForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { sampleQuestions, questionTypes } from '../utils/questionsData';
import { FaPlus, FaUpload, FaListOl, FaCalculator } from 'react-icons/fa';
import '../styles/exam-add.css';
import '../styles/modals.css';

const ExamAdd = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({});
    const [examData, setExamData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });

        // Check if editing
        const searchParams = new URLSearchParams(location.search);
        const editId = searchParams.get('edit');
        
        if (editId || id) {
            setIsEditing(true);
            // Load exam data from localStorage
            const savedExams = JSON.parse(localStorage.getItem('teacherExams')) || [];
            const examToEdit = savedExams.find(exam => exam.id == (editId || id));
            
            if (examToEdit) {
                setExamData({
                    name: examToEdit.name || '',
                    grade: examToEdit.grade || '',
                    course: examToEdit.course || '',
                    lecture: examToEdit.lecture || '',
                    examDate: examToEdit.date || '',
                    examDuration: examToEdit.duration || 60,
                    examType: examToEdit.type || 'exam'
                });
                
                if (examToEdit.questions) {
                    setQuestions(examToEdit.questions);
                }
            }
        } else {
            // Load sample questions for new exam
            setQuestions(sampleQuestions);
        }
    }, [id, location.search]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleAddQuestion = (typeId) => {
        const newQuestionId = questions.length + 1;
        let newQuestion;

        switch(typeId) {
            case 'multiple-choice':
                newQuestion = {
                    id: newQuestionId,
                    type: 'multiple-choice',
                    questionText: '',
                    options: [
                        { id: 1, text: '', isCorrect: true },
                        { id: 2, text: '', isCorrect: false }
                    ],
                    points: 1
                };
                break;
            case 'true-false':
                newQuestion = {
                    id: newQuestionId,
                    type: 'true-false',
                    questionText: '',
                    correctAnswer: true,
                    points: 1
                };
                break;
            case 'short-answer':
                newQuestion = {
                    id: newQuestionId,
                    type: 'short-answer',
                    questionText: '',
                    correctAnswer: '',
                    points: 1
                };
                break;
            default:
                return;
        }

        setQuestions([...questions, newQuestion]);
    };

    const handleUpdateQuestion = (updatedQuestion) => {
        setQuestions(questions.map(q => 
            q.id === updatedQuestion.id ? updatedQuestion : q
        ));
    };

    const handleDeleteQuestion = (questionId) => {
        setConfirmationConfig({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا السؤال؟',
            type: 'danger',
            onConfirm: () => {
                setQuestions(questions.filter(q => q.id !== questionId));
            }
        });
        setShowConfirmationModal(true);
    };

    const handleSaveExam = (formData) => {
        if (questions.length === 0) {
            setConfirmationConfig({
                title: 'تحذير',
                message: 'يجب إضافة سؤال واحد على الأقل',
                type: 'warning'
            });
            setShowConfirmationModal(true);
            return;
        }

        // Calculate total points
        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const totalQuestions = questions.length;

        // Prepare exam data
        const examToSave = {
            ...formData,
            id: isEditing ? (id || new URLSearchParams(location.search).get('edit')) : Date.now().toString(),
            date: formData.examDate,
            duration: formData.examDuration,
            type: formData.examType,
            status: 'مسودة',
            totalPoints,
            totalQuestions,
            questions: questions.map(q => ({
                ...q,
                // Ensure options are properly formatted
                options: q.options?.map(opt => ({
                    ...opt,
                    isCorrect: Boolean(opt.isCorrect)
                }))
            }))
        };

        // Save to localStorage
        const savedExams = JSON.parse(localStorage.getItem('teacherExams')) || [];
        let updatedExams;

        if (isEditing) {
            updatedExams = savedExams.map(exam => 
                exam.id === examToSave.id ? examToSave : exam
            );
        } else {
            updatedExams = [...savedExams, examToSave];
        }

        localStorage.setItem('teacherExams', JSON.stringify(updatedExams));

        // Show success message
        setConfirmationConfig({
            title: 'نجاح',
            message: 'تم حفظ الامتحان بنجاح!',
            type: 'success',
            onConfirm: () => navigate('/teacher/exams')
        });
        setShowConfirmationModal(true);
    };

    const handleBulkUpload = () => {
        // For demo purposes, add sample questions
        const newQuestions = [
            ...questions,
            ...sampleQuestions.map((q, index) => ({
                ...q,
                id: questions.length + index + 1
            }))
        ];
        setQuestions(newQuestions);
    };

    // Calculate statistics
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const totalQuestions = questions.length;
    const multipleChoiceCount = questions.filter(q => q.type === 'multiple-choice').length;
    const trueFalseCount = questions.filter(q => q.type === 'true-false').length;
    const shortAnswerCount = questions.filter(q => q.type === 'short-answer').length;

    return (
        <div className={`exam-add-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Header 
                sidebarCollapsed={sidebarCollapsed} 
                toggleSidebar={toggleSidebar}
            />
            
            <Sidebar 
                collapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
                activePage="exams"
            />
            
            <div className="main-content">
                <div className="container mt-5 pt-4">
                    {/* Exam Form */}
                    <ExamForm 
                        initialData={examData}
                        onSave={handleSaveExam}
                        isEditing={isEditing}
                    />

                    {/* Statistics */}
                    <div className="exam-stats">
                        <div className="row">
                            <div className="col-3">
                                <div className="stat-item">
                                    <div className="stat-value">{totalQuestions}</div>
                                    <div className="stat-label">عدد الأسئلة</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="stat-item">
                                    <div className="stat-value">{totalPoints}</div>
                                    <div className="stat-label">إجمالي الدرجات</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="stat-item">
                                    <div className="stat-value">{multipleChoiceCount}</div>
                                    <div className="stat-label">اختيار متعدد</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="stat-item">
                                    <div className="stat-value">{trueFalseCount + shortAnswerCount}</div>
                                    <div className="stat-label">أخرى</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="card exam-form-card mt-4">
                        <div className="card-header">
                            <h5 className="mb-0">الأسئلة</h5>
                        </div>
                        <div className="card-body">
                            <div className="questions-container">
                                {questions.length > 0 ? (
                                    questions.map((question, index) => (
                                        <QuestionCard 
                                            key={question.id}
                                            question={question}
                                            index={index}
                                            onUpdate={handleUpdateQuestion}
                                            onDelete={handleDeleteQuestion}
                                        />
                                    ))
                                ) : (
                                    <div className="no-questions-placeholder">
                                        <FaListOl className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                                        <h5 className="text-muted">لا توجد أسئلة</h5>
                                        <p className="text-muted mb-4">ابدأ بإضافة أسئلة جديدة</p>
                                        <button 
                                            className="btn btn-primary d-flex align-items-center mx-auto"
                                            onClick={() => setShowQuestionTypeModal(true)}
                                        >
                                            <FaPlus className="me-2" />
                                            إضافة أول سؤال
                                        </button>
                                    </div>
                                )}
                            </div>

                            {questions.length > 0 && (
                                <div className="d-flex gap-2 mt-3">
                                    <button 
                                        type="button" 
                                        className="btn btn-primary add-question-btn"
                                        onClick={() => setShowQuestionTypeModal(true)}
                                    >
                                        <FaPlus className="me-2" />
                                        إضافة سؤال
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={handleBulkUpload}
                                    >
                                        <FaUpload className="me-2" />
                                        رفع أسئلة
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer sidebarCollapsed={sidebarCollapsed} />

            {/* Modals */}
            <QuestionTypeModal 
                show={showQuestionTypeModal}
                handleClose={() => setShowQuestionTypeModal(false)}
                onSelectType={handleAddQuestion}
            />

            <ConfirmationModal 
                show={showConfirmationModal}
                handleClose={() => setShowConfirmationModal(false)}
                title={confirmationConfig.title}
                message={confirmationConfig.message}
                type={confirmationConfig.type}
                onConfirm={confirmationConfig.onConfirm}
            />
        </div>
    );
};

export default ExamAdd;