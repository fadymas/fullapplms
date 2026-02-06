// src/pages/teacher/QuizDetail.jsx
import React, { useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaQuestionCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUsers,
  FaChartBar,
  FaSave,
  FaSpinner,
  FaGraduationCap,
  FaClipboardList,
  FaPen,
  FaEye,
  FaImage,
  FaTimes
} from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import teacherQuizzesService from '../api/teacher/quizzes.service'
import '../styles/quiz-detail.css'

import useAuthStore from '../store/authStore'

const QuizDetail = () => {
  const { quizId } = useParams()

  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [attempts, setAttempts] = useState([])
  const [activeTab, setActiveTab] = useState('questions') // questions, attempts
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showAttemptDetail, setShowAttemptDetail] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const { user } = useAuthStore()

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question_type: 'multiple_choice',
    text: '',
    points: '',
    order: '',
    image: null,
    choices: [
      { text: '', image: null, is_correct: false, order: 1 },
      { text: '', image: null, is_correct: false, order: 2 },
      { text: '', image: null, is_correct: false, order: 3 },
      { text: '', image: null, is_correct: false, order: 4 }
    ]
  })
  const [questionImagePreview, setQuestionImagePreview] = useState(null)
  const [choiceImagePreviews, setChoiceImagePreviews] = useState({})

  // Grading state - store individual question scores
  const [questionScores, setQuestionScores] = useState({})
  const [gradingFeedback, setGradingFeedback] = useState('')

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    })
  }, [])

  useEffect(() => {
    if (quizId) {
      fetchQuizData()
      fetchQuestions()
      fetchAttempts()
    }
  }, [quizId])

  useEffect(() => {
    // Initialize question scores when attempt is selected
    if (selectedAttempt && selectedAttempt.answers) {
      setGradingFeedback(selectedAttempt.feedback || '')
    }
  }, [selectedAttempt])

  const fetchQuizData = async () => {
    try {
      const data = await teacherQuizzesService.getQuizDetail(quizId)
      setQuiz(data)
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const data = await teacherQuizzesService.getQuizQuestions(quizId)
      setQuestions(data.results || [])
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttempts = async () => {
    try {
      const data = await teacherQuizzesService.getQuizAttempts(quizId)
      setAttempts(data.results || [])
    } catch (error) {
      console.error('Failed to fetch attempts:', error)
    }
  }

  const handleCreateQuestion = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()

      // Add basic fields
      formData.append('quiz', quizId)
      formData.append('question_type', questionForm.question_type)
      formData.append('text', questionForm.text)
      formData.append('points', questionForm.points)

      if (questionForm.order) {
        formData.append('order', questionForm.order)
      }

      // Add question image if exists
      if (questionForm.image instanceof File) {
        formData.append('image', questionForm.image)
      }

      // For multiple choice and true/false, add choices
      if (questionForm.question_type !== 'essay') {
        const correctChoise = questionForm.choices.filter((choice) => choice.is_correct === true)
        const choices = questionForm.choices
          .filter((choice) => choice.text.trim() !== '')
          .map((choice, index) => ({
            text: choice.text,
            is_correct: choice.is_correct,
            image: choice.image,
            order: index + 1
          }))

        formData.append('choices', JSON.stringify(choices))
        formData.append('correct_answer', correctChoise[0].text)
      }

      const newQuestion = await teacherQuizzesService.createQuestion(formData)
      setQuestions([...questions, newQuestion])
      setShowQuestionModal(false)
      resetQuestionForm()
    } catch (error) {
      console.error('Failed to create question:', error)
      alert('فشل إضافة السؤال')
    }
  }

  const handleUpdateQuestion = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()

      // Add basic fields
      formData.append('question_type', questionForm.question_type)
      formData.append('text', questionForm.text)
      formData.append('points', questionForm.points)

      if (questionForm.order) {
        formData.append('order', questionForm.order)
      }

      // Add question image if changed
      if (questionForm.image instanceof File) {
        formData.append('image', questionForm.image)
      } else if (questionForm.image === 'DELETE') {
        formData.append('delete_image', 'true')
      }

      // For multiple choice and true/false, add choices
      if (questionForm.question_type !== 'essay') {
        const choices = questionForm.choices
          .filter((choice) => choice.text.trim() !== '')
          .map((choice, index) => ({
            text: choice.text,
            is_correct: choice.is_correct,
            order: index + 1
          }))

        formData.append('choices', JSON.stringify(choices))

        // Add choice images for ALL choices
        questionForm.choices.forEach((choice, index) => {
          if (choice.image instanceof File) {
            formData.append(`choice_${index}_image`, choice.image)
          } else if (choice.image === 'DELETE') {
            formData.append(`choice_${index}_delete_image`, 'true')
          }
        })
      }

      const updated = await teacherQuizzesService.updateQuestion(selectedQuestion.id, formData)
      setQuestions(questions.map((q) => (q.id === updated.id ? updated : q)))
      setShowQuestionModal(false)
      setSelectedQuestion(null)
      resetQuestionForm()
    } catch (error) {
      console.error('Failed to update question:', error)
      alert('فشل تحديث السؤال')
    }
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    try {
      await teacherQuizzesService.deleteQuestion(selectedQuestion.id)
      setQuestions(questions.filter((q) => q.id !== selectedQuestion.id))
      setShowDeleteModal(false)
      setSelectedQuestion(null)
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('فشل حذف السؤال')
    }
  }

  // Handle essay question score input
  const handleEssayScoreChange = (questionId, score) => {
    setQuestionScores((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        points_earned: parseFloat(score) || 0
      }
    }))
  }

  const handleGradeAttempt = async () => {
    if (!selectedAttempt) return

    try {
      const scores = {}

      selectedAttempt.answers.forEach(async (answer) => {
        if (answer.question_type === 'essay') {
          const questionId = answer.question
          const pointsEarned =
            questionScores[questionId]?.points_earned || answer.points_earned || 0

          scores[questionId] = pointsEarned
        }
      })
      await teacherQuizzesService.gradeAttempt(selectedAttempt.id, scores, gradingFeedback)

      const gradingData = {
        scores: scores,
        feedback: gradingFeedback
      }

      await fetchAttempts()
      setShowAttemptDetail(false)
      setSelectedAttempt(null)
      setQuestionScores({})
      setGradingFeedback('')

      alert('تم حفظ التقييم بنجاح')
    } catch (error) {
      console.error('Failed to grade attempt:', error)
      alert('فشل تقييم المحاولة')
    }
  }

  const openQuestionModal = (question = null) => {
    if (question) {
      setSelectedQuestion(question)

      // Convert question data to form format
      const choices = question.choices || []
      const formChoices =
        question.question_type === 'true_false'
          ? [
              {
                text: 'صح',
                image: null,
                is_correct: choices.find((c) => c.text === 'True')?.is_correct || false,
                order: 1
              },
              {
                text: 'خطأ',
                image: null,
                is_correct: choices.find((c) => c.text === 'False')?.is_correct || false,
                order: 2
              }
            ]
          : choices.length > 0
            ? choices.map((choice, index) => ({
                text: choice.text || '',
                image: choice.image || null,
                is_correct: choice.is_correct || false,
                order: index + 1
              }))
            : [
                { text: '', image: null, is_correct: false, order: 1 },
                { text: '', image: null, is_correct: false, order: 2 },
                { text: '', image: null, is_correct: false, order: 3 },
                { text: '', image: null, is_correct: false, order: 4 }
              ]

      setQuestionForm({
        question_type: question.question_type || 'multiple_choice',
        text: question.text || '',
        points: question.points || '',
        order: question.order || '',
        image: question.image || null,
        choices: formChoices
      })

      setQuestionImagePreview(question.image || null)

      // Set choice image previews
      const previews = {}
      formChoices.forEach((choice, index) => {
        if (choice.image) {
          previews[index] = choice.image
        }
      })
      setChoiceImagePreviews(previews)
    } else {
      resetQuestionForm()
    }
    setShowQuestionModal(true)
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      question_type: 'multiple_choice',
      text: '',
      points: '',
      order: '',
      image: null,
      choices: [
        { text: '', image: null, is_correct: false, order: 1 },
        { text: '', image: null, is_correct: false, order: 2 },
        { text: '', image: null, is_correct: false, order: 3 },
        { text: '', image: null, is_correct: false, order: 4 }
      ]
    })
    setSelectedQuestion(null)
    setQuestionImagePreview(null)
    setChoiceImagePreviews({})
  }

  const handleQuestionTypeChange = (type) => {
    setQuestionForm((prev) => {
      const newForm = { ...prev, question_type: type }

      if (type === 'true_false') {
        newForm.choices = [
          { text: 'صح', image: null, is_correct: false, order: 1 },
          { text: 'خطأ', image: null, is_correct: false, order: 2 }
        ]
      } else if (type === 'multiple_choice') {
        newForm.choices = [
          { text: '', image: null, is_correct: false, order: 1 },
          { text: '', image: null, is_correct: false, order: 2 },
          { text: '', image: null, is_correct: false, order: 3 },
          { text: '', image: null, is_correct: false, order: 4 }
        ]
      } else if (type === 'essay') {
        newForm.choices = []
      }

      return newForm
    })
    setChoiceImagePreviews({})
  }

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...questionForm.choices]
    newChoices[index] = { ...newChoices[index], [field]: value }
    setQuestionForm((prev) => ({ ...prev, choices: newChoices }))
  }

  const handleCorrectAnswerChange = (index) => {
    const newChoices = questionForm.choices.map((choice, i) => ({
      ...choice,
      is_correct: i === index
    }))
    setQuestionForm((prev) => ({ ...prev, choices: newChoices }))
  }

  const handleQuestionImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQuestionForm((prev) => ({ ...prev, image: file }))
      setQuestionImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveQuestionImage = () => {
    setQuestionForm((prev) => ({ ...prev, image: 'DELETE' }))
    setQuestionImagePreview(null)
  }

  const handleChoiceImageChange = (index, e) => {
    const file = e.target.files[0]
    if (file) {
      handleChoiceChange(index, 'image', file)
      setChoiceImagePreviews((prev) => ({
        ...prev,
        [index]: URL.createObjectURL(file)
      }))
    }
  }

  const handleRemoveChoiceImage = (index) => {
    handleChoiceChange(index, 'image', 'DELETE')
    setChoiceImagePreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[index]
      return newPreviews
    })
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const getQuestionTypeLabel = (type) => {
    const types = {
      multiple_choice: 'اختيار من متعدد',
      true_false: 'صح أو خطأ',
      essay: 'مقالي'
    }
    return types[type] || type
  }

  if (!quiz) {
    return (
      <div className={`quiz-detail-page ${darkMode ? 'dark-mode' : ''}`}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <Sidebar
          collapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          activePage="exams"
          darkMode={darkMode}
        />
        <div className="main-content">
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>جاري تحميل الامتحان...</p>
          </div>
        </div>
        <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />
      </div>
    )
  }

  return (
    <div
      className={`quiz-detail-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}
    >
      <Header
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activePage="exams"
        darkMode={darkMode}
      />

      <div className="main-content">
        <div className="quiz-detail-container">
          {/* Header */}
          <div className="detail-header" data-aos="fade-down">
            <button className="btn-back" onClick={() => navigate(`/${user.role}/exams`)}>
              <FaArrowLeft />
              <span>العودة للقائمة</span>
            </button>

            <div className="quiz-info-header">
              <h1>{quiz.title}</h1>
              <p>{quiz.description || 'لا يوجد وصف'}</p>
            </div>
          </div>

          {/* Quiz Overview */}
          <div className="quiz-overview" data-aos="fade-up">
            <div className="overview-card">
              <FaQuestionCircle />
              <div>
                <h3>{questions.length}</h3>
                <p>سؤال</p>
              </div>
            </div>

            <div className="overview-card">
              <FaClock />
              <div>
                <h3>{quiz.time_limit_minutes || '∞'}</h3>
                <p>دقيقة</p>
              </div>
            </div>

            <div className="overview-card">
              <FaUsers />
              <div>
                <h3>{attempts.length}</h3>
                <p>محاولة</p>
              </div>
            </div>

            <div className="overview-card">
              <FaChartBar />
              <div>
                <h3>{quiz.passing_grade}%</h3>
                <p>درجة النجاح</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container" data-aos="fade-up">
            <button
              className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              <FaQuestionCircle />
              <span>الأسئلة ({questions.length})</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'attempts' ? 'active' : ''}`}
              onClick={() => setActiveTab('attempts')}
            >
              <FaClipboardList />
              <span>المحاولات ({attempts.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'questions' && (
            <div className="questions-section" data-aos="fade-up">
              <div className="section-header">
                <h2>أسئلة الامتحان</h2>
                <button className="btn-add-question" onClick={() => openQuestionModal()}>
                  <FaPlus />
                  <span>إضافة سؤال</span>
                </button>
              </div>

              {loading ? (
                <div className="loading-container">
                  <FaSpinner className="spinner" />
                  <p>جاري تحميل الأسئلة...</p>
                </div>
              ) : questions.length > 0 ? (
                <div className="questions-list">
                  {questions.map((question, index) => (
                    <div key={question.id} className="question-card" data-aos="fade-up">
                      <div className="question-header">
                        <div className="question-number">
                          <span>#{index + 1}</span>
                        </div>
                        <div className="question-type-badge">
                          {getQuestionTypeLabel(question.question_type)}
                        </div>
                        <div className="question-points">{question.points} نقطة</div>
                        <div className="question-actions">
                          <button
                            className="btn-action edit"
                            onClick={() => openQuestionModal(question)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setShowDeleteModal(true)
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <div className="question-body">
                        <p className="question-text">{question.text}</p>

                        {/* Display question image if exists */}
                        {question.image_url && (
                          <div className="question-image-container">
                            <img
                              src={process.env.REACT_APP_API_URL + question.image_url}
                              alt="Question"
                              className="question-image"
                            />
                          </div>
                        )}

                        {question.question_type !== 'essay' && question.choices && (
                          <div className="question-options">
                            {question.choices.map((choice, optIndex) => (
                              <div
                                key={optIndex}
                                className={`option-item ${choice.is_correct ? 'correct' : ''}`}
                              >
                                {choice.is_correct && <FaCheckCircle className="correct-icon" />}
                                <div className="option-content">
                                  <span>{choice.text}</span>
                                  {choice.image && (
                                    <img
                                      src={choice.image}
                                      alt={`Choice ${optIndex + 1}`}
                                      className="choice-image"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.question_type === 'essay' && (
                          <div className="essay-note">
                            <FaPen />
                            <span>سؤال مقالي - يتطلب تقييم يدوي</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaQuestionCircle />
                  <h3>لا توجد أسئلة</h3>
                  <p>ابدأ بإضافة أسئلة للامتحان</p>
                  <button className="btn-add-question" onClick={() => openQuestionModal()}>
                    <FaPlus />
                    <span>إضافة أول سؤال</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attempts' && (
            <div className="attempts-section" data-aos="fade-up">
              <div className="section-header">
                <h2>محاولات الطلاب</h2>
              </div>

              {attempts.length > 0 ? (
                <div className="attempts-list">
                  {attempts.map((attempt) => (
                    <div key={attempt.id} className="attempt-card" data-aos="fade-up">
                      <div className="attempt-header">
                        <div className="student-info">
                          <FaGraduationCap />
                          <div>
                            <h4>{attempt.student_name || 'طالب'}</h4>
                            <span>
                              {new Date(attempt.submitted_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>

                        <div className="attempt-score">
                          <span className={`score ${attempt.passed ? 'passed' : 'failed'}`}>
                            {attempt.score || 0}/{attempt.quiz_total_points || 100}
                          </span>
                          {attempt.passed ? (
                            <FaCheckCircle className="status-icon passed" />
                          ) : (
                            <FaTimesCircle className="status-icon failed" />
                          )}
                        </div>
                      </div>

                      <div className="attempt-details">
                        <div className="detail-item">
                          <span>الحالة:</span>
                          <strong className={attempt.passed ? 'text-success' : 'text-danger'}>
                            {attempt.passed ? 'ناجح' : 'راسب'}
                          </strong>
                        </div>
                        <div className="detail-item">
                          <span>الوقت المستغرق:</span>
                          <strong>{attempt.time_taken_seconds || '---'}</strong>
                        </div>
                        <div className="detail-item">
                          <span>رقم المحاولة:</span>
                          <strong>{attempt.attempt_number || 1}</strong>
                        </div>
                      </div>

                      <button
                        className="btn-view-attempt"
                        onClick={() => {
                          setSelectedAttempt(attempt)
                          setShowAttemptDetail(true)
                        }}
                      >
                        <FaEye />
                        <span>عرض التفاصيل وتقييم</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaClipboardList />
                  <h3>لا توجد محاولات</h3>
                  <p>لم يقم أي طالب بحل هذا الامتحان بعد</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer sidebarCollapsed={sidebarCollapsed} darkMode={darkMode} />

      {/* Question Modal */}
      {showQuestionModal && (
        <>
          <div className="modal-container">
            <div className="modal-content modal-large">
              <div className="modal-header">
                <h2>{selectedQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h2>
                <button className="btn-close-modal" onClick={() => setShowQuestionModal(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={selectedQuestion ? handleUpdateQuestion : handleCreateQuestion}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>نوع السؤال *</label>
                    <div className="question-type-selector">
                      <button
                        type="button"
                        className={`type-btn ${questionForm.question_type === 'multiple_choice' ? 'active' : ''}`}
                        onClick={() => handleQuestionTypeChange('multiple_choice')}
                      >
                        اختيار من متعدد
                      </button>
                      <button
                        type="button"
                        className={`type-btn ${questionForm.question_type === 'true_false' ? 'active' : ''}`}
                        onClick={() => handleQuestionTypeChange('true_false')}
                      >
                        صح أو خطأ
                      </button>
                      <button
                        type="button"
                        className={`type-btn ${questionForm.question_type === 'essay' ? 'active' : ''}`}
                        onClick={() => handleQuestionTypeChange('essay')}
                      >
                        مقالي
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>نص السؤال *</label>
                    <textarea
                      value={questionForm.text}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, text: e.target.value }))
                      }
                      required
                      rows="3"
                      placeholder="اكتب السؤال هنا..."
                    />
                  </div>

                  {/* Question Image Upload */}
                  <div className="form-group">
                    <label>صورة السؤال (اختياري)</label>
                    <div className="image-upload-container">
                      {questionImagePreview ? (
                        <div className="image-preview">
                          <img src={questionImagePreview} alt="Question preview" />
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={handleRemoveQuestionImage}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <label className="image-upload-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQuestionImageChange}
                            style={{ display: 'none' }}
                          />
                          <FaImage />
                          <span>اضغط لرفع صورة</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>النقاط *</label>
                      <input
                        type="number"
                        value={questionForm.points}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({ ...prev, points: e.target.value }))
                        }
                        required
                        min="0"
                        step="0.01"
                        placeholder="10"
                      />
                    </div>

                    <div className="form-group">
                      <label>الترتيب</label>
                      <input
                        type="number"
                        value={questionForm.order}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({ ...prev, order: e.target.value }))
                        }
                        min="0"
                        placeholder="اختياري"
                      />
                    </div>
                  </div>

                  {questionForm.question_type !== 'essay' && (
                    <>
                      <div className="form-group">
                        <label>الخيارات *</label>
                        <div className="options-list">
                          {questionForm.choices.map((choice, index) => (
                            <div key={index} className="option-input-container">
                              <div className="option-input">
                                <span className="option-label">{index + 1}.</span>
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(e) =>
                                    handleChoiceChange(index, 'text', e.target.value)
                                  }
                                  required={
                                    questionForm.question_type === 'true_false' || index < 2
                                  }
                                  placeholder={`الخيار ${index + 1}`}
                                  disabled={questionForm.question_type === 'true_false'}
                                />
                                <input
                                  type="radio"
                                  name="correct_answer"
                                  checked={choice.is_correct}
                                  onChange={() => handleCorrectAnswerChange(index)}
                                  title="الإجابة الصحيحة"
                                />
                              </div>

                              {/* Choice Image Upload */}
                              <div className="choice-image-upload">
                                {choiceImagePreviews[index] ? (
                                  <div className="choice-image-preview">
                                    <img
                                      src={choiceImagePreviews[index]}
                                      alt={`Choice ${index + 1}`}
                                    />
                                    <button
                                      type="button"
                                      className="btn-remove-image-small"
                                      onClick={() => handleRemoveChoiceImage(index)}
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="choice-image-upload-label">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleChoiceImageChange(index, e)}
                                      style={{ display: 'none' }}
                                    />
                                    <FaImage />
                                  </label>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <small className="form-help-text">
                          اختر الإجابة الصحيحة باستخدام الدائرة بجانب الخيار
                        </small>
                      </div>
                    </>
                  )}

                  {questionForm.question_type === 'essay' && (
                    <div className="info-note">
                      <FaPen />
                      <p>الأسئلة المقالية تتطلب تقييم يدوي من المعلم</p>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowQuestionModal(false)}
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowQuestionModal(false)}></div>
        </>
      )}

      {/* Delete Question Modal */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal-container">
            <div className="modal-content modal-small">
              <div className="modal-header delete">
                <h2>تأكيد الحذف</h2>
                <button className="btn-close-modal" onClick={() => setShowDeleteModal(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="delete-warning">
                  <FaTrash />
                  <p>هل أنت متأكد من حذف هذا السؤال؟</p>
                  <p className="warning-text">هذا الإجراء لا يمكن التراجع عنه.</p>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  إلغاء
                </button>
                <button className="btn-danger" onClick={handleDeleteQuestion}>
                  حذف السؤال
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attempt Detail Modal */}
      {showAttemptDetail && selectedAttempt && (
        <>
          <div className="modal-backdrop" onClick={() => setShowAttemptDetail(false)}></div>
          <div className="modal-container">
            <div className="modal-content modal-large">
              <div className="modal-header">
                <h2>تفاصيل المحاولة</h2>
                <button className="btn-close-modal" onClick={() => setShowAttemptDetail(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="attempt-info-card">
                  <div className="info-row">
                    <span>الطالب:</span>
                    <strong>{selectedAttempt.student_name || 'طالب'}</strong>
                  </div>
                  <div className="info-row">
                    <span>التاريخ:</span>
                    <strong>
                      {new Date(selectedAttempt.submitted_at).toLocaleString('ar-EG')}
                    </strong>
                  </div>
                  <div className="info-row">
                    <span>الدرجة الحالية:</span>
                    <strong className={selectedAttempt.passed ? 'text-success' : 'text-danger'}>
                      {selectedAttempt.score || 0}/{selectedAttempt.quiz_total_points || 100}
                    </strong>
                  </div>
                  <div className="info-row">
                    <span>الحالة:</span>
                    <strong className={selectedAttempt.passed ? 'text-success' : 'text-danger'}>
                      {selectedAttempt.passed ? 'ناجح' : 'راسب'}
                    </strong>
                  </div>
                </div>

                {selectedAttempt.answers && selectedAttempt.answers.length > 0 && (
                  <div className="answers-section">
                    <h3>إجابات الطالب</h3>
                    {selectedAttempt.answers.map((answer, index) => (
                      <div key={index} className="answer-card">
                        <div className="answer-header">
                          <span className="answer-number">سؤال {index + 1}</span>
                          <span className="answer-type-badge">
                            {getQuestionTypeLabel(answer.question_type)}
                          </span>
                          <span className="answer-points">
                            {questionScores[answer.question]?.points_earned ||
                              answer.points_earned ||
                              0}{' '}
                            / {answer.question_points || 0} نقطة
                          </span>
                        </div>
                        <div className="answer-body">
                          <p className="question-text">{answer.question_text}</p>

                          {/* Display question image if exists */}
                          {answer.question_image && (
                            <div className="question-image-container">
                              <img
                                src={answer.question_image}
                                alt="Question"
                                className="question-image"
                              />
                            </div>
                          )}

                          <div className="student-answer">
                            <strong>إجابة الطالب:</strong>
                            <p>
                              {answer.answer_text || answer.selected_option || 'لم يتم الإجابة'}
                            </p>
                          </div>

                          {/* Show grade input for essay questions */}
                          {answer.question_type === 'essay' && (
                            <div className="essay-grading">
                              <label htmlFor={`grade-${answer.question}`}>
                                <strong>الدرجة:</strong>
                              </label>
                              <input
                                id={`grade-${answer.question}`}
                                type="number"
                                min="0"
                                max={answer.question_points || 100}
                                step="0.01"
                                value={questionScores[answer.question]?.points_earned || ''}
                                onChange={(e) =>
                                  handleEssayScoreChange(answer.question, e.target.value)
                                }
                                placeholder={`أدخل الدرجة (من 0 إلى ${answer.question_points})`}
                                className="grade-input"
                              />
                            </div>
                          )}

                          {/* Show correct/incorrect status for non-essay questions */}
                          {answer.question_type !== 'essay' &&
                            (answer.is_correct ? (
                              <div className="correct-answer">
                                <FaCheckCircle className="text-success" />
                                <strong className="text-success">الإجابة صحيحة</strong>
                              </div>
                            ) : (
                              <div className="wrong-answer">
                                <FaTimesCircle className="text-danger" />
                                <strong className="text-danger">الإجابة خاطئة</strong>
                                {answer.correct_answer && (
                                  <p className="correct-answer-text">
                                    الإجابة الصحيحة: <strong>{answer.correct_answer}</strong>
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grading-section">
                  <h3>ملاحظات التقييم</h3>
                  <div className="form-group">
                    <label>ملاحظات للطالب</label>
                    <textarea
                      value={gradingFeedback}
                      onChange={(e) => setGradingFeedback(e.target.value)}
                      rows="4"
                      placeholder="اكتب ملاحظاتك هنا..."
                    />
                  </div>

                  <div className="total-score-display">
                    <strong>الدرجة الإجمالية المحسوبة:</strong>
                    <span className="total-score">
                      {Object.values(questionScores)
                        .reduce((sum, item) => sum + (parseFloat(item.points_earned) || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAttemptDetail(false)}>
                  إغلاق
                </button>
                <button className="btn-primary" onClick={handleGradeAttempt}>
                  <FaSave />
                  <span>حفظ التقييم</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default QuizDetail
