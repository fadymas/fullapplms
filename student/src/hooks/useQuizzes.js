// src/hooks/useQuizzes.js
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { quizApi } from '../api/quiz.service'

export function useQuizzes(initialPage = 1) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pagination
  const [page, setPage] = useState(Number(initialPage) || 1)
  const [meta, setMeta] = useState({
    count: 0,
    next: null,
    previous: null,
    pageSize: 20 // default; will be updated from API response
  })

  const fetchQuizzes = useCallback(
    async (cancelToken, p) => {
      setLoading(true)
      setError(null)
      try {
        const data = await quizApi.listStudentQuizzes({ page: p }, cancelToken)
        if (Array.isArray(data)) {
          // Non-paginated fallback
          setQuizzes(data)
          setMeta({
            count: data.length,
            next: null,
            previous: null,
            pageSize: data.length || meta.pageSize
          })
        } else {
          const items = data?.results ?? []
          const count = data?.count ?? items.length
          setQuizzes(items)
          setMeta({
            count,
            next: data?.next ?? null,
            previous: data?.previous ?? null,
            pageSize: items.length || meta.pageSize
          })
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err?.response?.data?.detail || err.message || 'Failed to load quizzes')
        }
      } finally {
        setLoading(false)
      }
    },
    [meta.pageSize]
  )

  useEffect(() => {
    const source = axios.CancelToken.source()
    fetchQuizzes(source.token, page)
    return () => source.cancel('Component unmounted')
  }, [fetchQuizzes, page])

  const totalPages = useMemo(() => {
    const { count, pageSize } = meta
    if (!count || !pageSize) return 1
    return Math.max(1, Math.ceil(count / pageSize))
  }, [meta])

  const hasNext = useMemo(() => {
    if (meta.next != null) return true // server-driven
    return page < totalPages // derived
  }, [meta.next, page, totalPages])

  const hasPrev = useMemo(() => {
    if (meta.previous != null) return true // server-driven
    return page > 1
  }, [meta.previous, page])

  const nextPage = useCallback(() => {
    if (hasNext) setPage((p) => p + 1)
  }, [hasNext])

  const prevPage = useCallback(() => {
    if (hasPrev) setPage((p) => Math.max(1, p - 1))
  }, [hasPrev])

  const reload = useCallback(() => {
    const source = axios.CancelToken.source()
    fetchQuizzes(source.token, page)
    return () => source.cancel('Reload cancelled')
  }, [fetchQuizzes, page])

  // Helpers for "Showing X–Y of Z"
  const range = useMemo(() => {
    const size = meta.pageSize || quizzes.length || 0
    const start = size === 0 ? 0 : (page - 1) * size + 1
    const end = size === 0 ? 0 : (page - 1) * size + quizzes.length
    return { start, end }
  }, [meta.pageSize, page, quizzes.length])

  return {
    quizzes,
    loading,
    error,
    reload,
    // Pagination
    page,
    setPage,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    totalPages,
    meta,
    range
  }
}

export default useQuizzes
