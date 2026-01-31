import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import quizApi from '../api/quiz.service'

// ================= Timer =================
function getElapsedSeconds(startedAtISO) {
  const now = new Date()
  const startedAt = new Date(startedAtISO)

  const diffMs = now - startedAt
  return diffMs > 0 ? Math.floor(diffMs / 1000) : 0
}

function getRemainingSeconds(startedAtISO, timeLimitSeconds) {
  const elapsed = getElapsedSeconds(startedAtISO)
  const remaining = timeLimitSeconds - elapsed
  return remaining > 0 ? remaining : 0
}

function Timer({ startedAt, timeLimitSeconds, onTimeUp }) {
  const [remaining, setRemaining] = useState(getRemainingSeconds(startedAt, timeLimitSeconds))

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemainingSeconds(startedAt, timeLimitSeconds)
      setRemaining(next)

      if (next === 0) {
        clearInterval(interval)
        onTimeUp?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, timeLimitSeconds])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const pad = (n) => n.toString().padStart(2, '0')

  return (
    <span className="badge bg-danger fs-6 p-2">
      ⏱ {pad(m)}:{pad(s)}
    </span>
  )
}

// ================= Question View =================
function QuestionView({ question, value, onChange, disabled }) {
  if (!question) return null

  const { id, text, question_type, options = [] } = question

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body justify-content-end">
        <h5 className="fw-bold mb-4">{text}</h5>

        {/* Multiple Choice */}
        {(question_type === 'multiple_choice' || question_type === 'true_false') &&
          options.map((opt, i) => (
            <div className="form-check mb-2" key={i}>
              <input
                className="form-check-input"
                type="radio"
                name={`q_${id}`}
                checked={value === opt}
                disabled={disabled}
                onChange={() => onChange(opt)}
              />
              <label className="form-check-label ms-2">{opt}</label>
            </div>
          ))}

        {/* Essay */}
        {question_type === 'essay' && (
          <textarea
            className="form-control"
            rows={5}
            placeholder="اكتب إجابتك هنا..."
            value={value || ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  )
}

// ================= Result Modal =================
function ResultModal({ open, result, onClose }) {
  if (!open) return null
  return (
    <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">تم تسليم الاختبار</h5>
          </div>
          <div className="modal-body text-center">
            <h2 className="fw-bold">{result?.score}%</h2>
            <p>الحالة: {result?.status}</p>
            <small>{result?.submitted_at}</small>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary w-100" onClick={onClose}>
              رجوع
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================= Main Page =================
export default function QuizAttemptPage() {
  const { attemptId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const questions = location.state?.questions || []
  const initialTimer = location.state?.timer

  const [answers, setAnswers] = useState({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(initialTimer)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const currentQuestion = questions[activeIndex]

  // ================= Timer =================
  useEffect(() => {
    if (!remainingSeconds) return
    if (remainingSeconds <= 0) handleSubmitQuiz()

    const i = setInterval(() => {
      setRemainingSeconds((s) => s - 1)
    }, 1000)

    return () => clearInterval(i)
  }, [remainingSeconds])

  // ================= Submit Answer =================
  const submitAnswer = async () => {
    if (!currentQuestion) return

    const answer = answers[currentQuestion.id]
    if (!answer) return

    try {
      if (
        currentQuestion.question_type === 'multiple_choice' ||
        currentQuestion.question_type === 'true_false'
      ) {
        await quizApi.submitAnswer(attemptId, {
          question_id: currentQuestion.id,
          selected_option: answer
        })
      } else {
        await quizApi.submitAnswer(attemptId, {
          question_id: currentQuestion.id,
          answer_text: answer
        })
      }

      if (activeIndex < questions.length - 1) {
        setActiveIndex((i) => i + 1)
      }
    } catch (err) {
    } finally {
      setSubmitting(false)
    }
  }

  // ================= Submit Quiz =================
  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true)
      submitAnswer()

      const data = await quizApi.submitAttempt(attemptId)
      setResult(data)
    } catch (err) {
      alert('خطأ أثناء تسليم الاختبار')
    } finally {
      setSubmitting(false)
      navigate('/exams')
    }
  }

  const progress = useMemo(
    () => Math.round(((activeIndex + 1) / questions.length) * 100),
    [activeIndex, questions.length]
  )

  if (!questions.length) {
    return <div className="text-center py-5">لا يوجد اختبار</div>
  }

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between mb-3">
        <h4>Quiz Attempt</h4>
        <Timer
          startedAt={initialTimer.started_at}
          timeLimitSeconds={initialTimer.remaining_seconds}
          onTimeUp={handleSubmitQuiz}
        />{' '}
      </div>

      <div className="progress mb-3">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <QuestionView
        question={currentQuestion}
        value={answers[currentQuestion.id]}
        disabled={submitting}
        onChange={(val) =>
          setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: val
          }))
        }
      />

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => i - 1)}
        >
          السابق
        </button>

        {activeIndex === questions.length - 1 ? (
          <button className="btn btn-danger" onClick={handleSubmitQuiz} disabled={submitting}>
            إنهاء الاختبار
          </button>
        ) : (
          <button className="btn btn-success" onClick={submitAnswer} disabled={submitting}>
            التالى
          </button>
        )}
      </div>
    </div>
  )
}
