// src/api/quiz.service.js
// Axios-based service for quizzes and attempts

import apiClient from './axiosConfig'
// Assumes a global Axios interceptor adds Authorization: Bearer <token>
// and baseURL is configured elsewhere via axios.defaults.baseURL or an axios instance.

const QUIZ_BASE = '/api/quizzes'

export const quizApi = {
  // GET /api/quizzes/quizzes/
  async listStudentQuizzes(page, cancelToken) {
    const res = await apiClient.get(`${QUIZ_BASE}/quizzes/`, {
      page,
      cancelToken
    })
    return res.data
  },
  async createStudentQuiz(data) {
    const res = await apiClient.post(`${QUIZ_BASE}/quizzes/`, data, { maxRedirects: 0 })
    return res
  },
  async deleteStudentQuiz(id) {
    const res = await apiClient.delete(`${QUIZ_BASE}/quizzes/${id}`)
    return res
  },
  async editStudentQuiz(id, data) {
    const res = await apiClient.patch(`${QUIZ_BASE}/quizzes/${id}`, data)
    return res
  },
  async listQuestions() {
    const res = await apiClient.patch(`${QUIZ_BASE}/questions/`)
    return res
  },
  async createQuestion(data) {
    const res = await apiClient.patch(`${QUIZ_BASE}/questions/`, data)
    return res
  },
  async editQuestion(id, data) {
    const res = await apiClient.patch(`${QUIZ_BASE}/questions/${id}/`, data)
    return res
  },
  async deleteQuestion(id) {
    const res = await apiClient.patch(`${QUIZ_BASE}/questions/${id}/`)
    return res
  },
  async questionDetails(id, data) {
    const res = await apiClient.patch(`${QUIZ_BASE}/questions/${id}/`)
    return res
  }
}

export default quizApi
