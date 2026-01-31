// src/api/quiz.service.js
// Axios-based service for quizzes and attempts

import apiClient from './axiosConfig'
// Assumes a global Axios interceptor adds Authorization: Bearer <token>
// and baseURL is configured elsewhere via axios.defaults.baseURL or an axios instance.

const QUIZ_BASE = '/api/quizzes'

export const quizApi = {
  // GET /api/quizzes/quizzes/
  async listStudentQuizzes(params = {}, cancelToken) {
    const res = await apiClient.get(`${QUIZ_BASE}/quizzes/`, {
      params,
      cancelToken
    })
    return res.data
  },

  // POST /api/quizzes/quizzes/{quiz_id}/start_attempt/
  async startAttempt(quizId) {
    const res = await apiClient.post(`${QUIZ_BASE}/quizzes/${quizId}/start_attempt/`)
    return res.data // expects: { attempt_id, questions, time_limit_seconds, ... }
  },

  // POST /api/quizzes/attempts/{attempt_id}/submit_answer/
  async submitAnswer(attemptId, payload) {
    // payload example: { question: 1, answer_payload: { selected_option: 1 } }
    const res = await apiClient.post(`${QUIZ_BASE}/attempts/${attemptId}/submit_answer/`, payload)
    return res.data
  },

  // POST /api/quizzes/attempts/{attempt_id}/submit/
  async submitAttempt(attemptId) {
    const res = await apiClient.post(`${QUIZ_BASE}/attempts/${attemptId}/submit/`)
    return res.data // expects: { score, status, submitted_at, ... }
  }
}

export default quizApi
