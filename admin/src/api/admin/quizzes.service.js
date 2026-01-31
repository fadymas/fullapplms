import apiClient from '../axiosConfig'

const adminQuizzesService = {
  getAllQuizzes: async (page = 1, search = '', status = '') => {
    const response = await apiClient.get('/api/quizzes/quizzes/', {
      params: { page, search, status }
    })
    return response.data
  },

  getQuizDetail: async (quizId) => {
    const response = await apiClient.get(`/api/quizzes/quizzes/${quizId}/`)
    return response.data
  },

  createQuiz: async (quizData) => {
    const response = await apiClient.post('/api/quizzes/quizzes/', quizData)
    return response.data
  },

  updateQuiz: async (quizId, data) => {
    const response = await apiClient.patch(`/api/quizzes/quizzes/${quizId}/`, data)
    return response.data
  },

  deleteQuiz: async (quizId) => {
    const response = await apiClient.delete(`/api/quizzes/quizzes/${quizId}/`)
    return response.data
  },

  publishQuiz: async (quizId) => {
    const response = await apiClient.post(`/api/quizzes/quizzes/${quizId}/publish/`)
    return response.data
  },

  unpublishQuiz: async (quizId) => {
    const response = await apiClient.post(`/api/quizzes/quizzes/${quizId}/unpublish/`)
    return response.data
  },

  getQuizAttempts: async (quizId, page = 1) => {
    const response = await apiClient.get(`/api/quizzes/quizzes/${quizId}/attempts/`, {
      params: { page }
    })
    return response.data
  },

  getAttemptDetail: async (attemptId) => {
    const response = await apiClient.get(`/api/quizzes/attempts/${attemptId}/`)
    return response.data
  },

  resetStudentAttempt: async (attemptId) => {
    const response = await apiClient.post(`/api/quizzes/attempts/${attemptId}/reset/`)
    return response.data
  }
}

export default adminQuizzesService
