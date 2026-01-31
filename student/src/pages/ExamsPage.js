// src/pages/ExamsPage.jsx
import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useQuizzes from '../hooks/useQuizzes'
import { quizApi } from '../api/quiz.service'
import DashboardNavbar from '../components/DashboardNavbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

// Simple modern styles via inline objects to avoid extra CSS dependencies
const styles = {
  container: { maxWidth: 1100, margin: '32px auto', padding: '0 16px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  title: { fontSize: 28, fontWeight: 700, letterSpacing: 0.2, margin: 0 },
  subtitle: { color: '#6b7280', fontSize: 14 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    marginTop: 12
  },
  card: {
    position: 'relative',
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'transform 120ms ease, box-shadow 120ms ease'
  },
  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#eef2ff',
    color: '#4f46e5',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8
  },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: '4px 0 6px' },
  cardDesc: { color: '#4b5563', fontSize: 14, minHeight: 40, marginBottom: 10 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 8, rowGap: 4, color: '#374151', fontSize: 12 },
  metaPill: {
    background: '#f3f4f6',
    borderRadius: 999,
    padding: '4px 8px'
  },
  footer: { display: 'flex', justifyContent: 'flex-end', marginTop: 14 },
  startBtn: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    transition: 'background 120ms ease, transform 120ms ease, opacity 120ms ease'
  },
  startBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  error: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: 12,
    borderRadius: 10,
    margin: '12px 0'
  },
  empty: {
    textAlign: 'center',
    padding: '40px 12px',
    color: '#6b7280',
    border: '2px dashed #e5e7eb',
    borderRadius: 12,
    background: '#fafafa'
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 10
  },
  pageControls: { display: 'flex', alignItems: 'center', gap: 8 },
  pageBtn: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 600,
    opacity: 0.95
  },
  pageBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  pageInput: {
    width: 70,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px'
  },
  pageInfo: { color: '#6b7280', fontSize: 13 },
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    border: '1px solid #e5e7eb',
    background: 'linear-gradient(90deg,#f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)',
    backgroundSize: '400% 100%',
    animation: 'shine 1.4s ease-in-out infinite',
    height: 160
  }
  // Keyframes can't be declared inline; we append them once below.
}

// Append keyframes for skeleton shimmer on first import
if (typeof document !== 'undefined' && !document.getElementById('skeleton-keyframes')) {
  const style = document.createElement('style')
  style.id = 'skeleton-keyframes'
  style.textContent = `
      @keyframes shine {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
    `
  document.head.appendChild(style)
}

function QuizCard({ quiz, onStart, startingId }) {
  const {
    lecture_title,
    title,
    description,
    question_count,
    total_points,
    passing_grade,
    max_attempts,
    remaining_attempts,
    is_mandatory,
    can_take,
    id,
    questions
  } = quiz

  const canStart = can_take && remaining_attempts > 0
  const isStarting = startingId === id
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <div
        className="quiz-card"
        style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {lecture_title ? <div style={styles.badge}>{lecture_title}</div> : null}
        <div style={styles.cardTitle}>{title}</div>
        {description ? <div style={styles.cardDesc}>{description}</div> : null}

        <div style={styles.metaRow}>
          <span style={styles.metaPill}>Questions: {question_count}</span>
          <span style={styles.metaPill}>Points: {total_points}</span>
          <span style={styles.metaPill}>Passing: {passing_grade}</span>
          <span style={styles.metaPill}>
            Attempts: {remaining_attempts}/{max_attempts}
          </span>
          <span style={styles.metaPill}>{is_mandatory ? 'mandatory' : 'Optional'}</span>
        </div>

        <div style={styles.footer}>
          <button
            disabled={!canStart || isStarting}
            onClick={() => onStart(id)}
            style={{
              ...styles.startBtn,
              ...(!canStart || isStarting ? styles.startBtnDisabled : {})
            }}
          >
            {isStarting ? 'Starting...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </>
  )
}

function SkeletonCard() {
  return <div aria-hidden="true" style={styles.skeletonCard} />
}

export default function ExamsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1

  const {
    quizzes,
    loading,
    error,
    // pagination
    page,
    setPage,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    totalPages,
    meta,
    range
  } = useQuizzes(initialPage)

  // Keep ?page in sync with state
  React.useEffect(() => {
    const next = new URLSearchParams()
    if (page && page !== 1) next.set('page', String(page))
    setSearchParams(next)
  }, [page, setSearchParams])

  const [startError, setStartError] = useState(null)
  const [startingFor, setStartingFor] = useState(null)
  const navigate = useNavigate()

  const handleStart = async (quizId) => {
    if (startingFor) return
    setStartError(null)
    setStartingFor(quizId)
    try {
      const data = await quizApi.startAttempt(quizId)
      const quizez = await quizApi.listStudentQuizzes()
      const theQuiz = quizez.results.filter((quiz) => quiz.id === quizId)[0]

      navigate(`/quizzes/attempt/${data.id}`, {
        state: {
          questions: theQuiz.questions,
          timer: { remaining_seconds: data.time_remaining_seconds, started_at: data.started_at }
        }
      })
    } catch (e) {
      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e.message ||
        'Failed to start attempt'
      setStartError(message)
    } finally {
      setStartingFor(null)
    }
  }

  const totalCount = meta.count || quizzes.length || 0
  const headerSubtitle = useMemo(() => {
    if (loading && totalCount === 0) return 'Fetching quizzes...'
    return `Total quizzes: ${totalCount}`
  }, [loading, totalCount])

  return (
    <>
      {' '}
      <DashboardNavbar />
      <Sidebar />{' '}
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Exams</h1>
            <div style={styles.subtitle}>{headerSubtitle}</div>
          </div>
        </div>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}
        {startError && (
          <div role="alert" style={styles.error}>
            {startError}
          </div>
        )}

        <div style={styles.grid}>
          {loading && quizzes.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : null}

          {!loading && !error && quizzes?.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={styles.empty}>No quizzes available at the moment.</div>
            </div>
          ) : null}

          {quizzes?.map((q) => (
            <QuizCard key={q.id} quiz={q} onStart={handleStart} startingId={startingFor} />
          ))}
        </div>

        {/* Pagination */}
        <div style={styles.pagination} aria-label="Pagination">
          <div style={styles.pageInfo}>
            {totalCount > 0 ? `Showing ${range.start}–${range.end} of ${totalCount}` : 'No items'}
          </div>

          <div style={styles.pageControls}>
            <button
              onClick={prevPage}
              disabled={!hasPrev || loading}
              style={{ ...styles.pageBtn, ...(!hasPrev || loading ? styles.pageBtnDisabled : {}) }}
            >
              →
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min={1}
                value={page}
                onChange={(e) => setPage(Math.max(1, Number(e.target.value || 1)))}
                style={styles.pageInput}
                disabled={loading}
                aria-label="Current page"
              />
              <span style={{ color: '#6b7280', fontSize: 13 }}>of {totalPages}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={!hasNext || loading}
              style={{ ...styles.pageBtn, ...(!hasNext || loading ? styles.pageBtnDisabled : {}) }}
            >
              ←
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
