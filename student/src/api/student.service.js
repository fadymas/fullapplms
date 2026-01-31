import apiClient from './axiosConfig'

const studentService = {
  getProfile: async () => {
    const response = await apiClient.get('/api/users/profiles/me/') //changed to the alternate endpoint
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.patch('/api/users/profile/', profileData)
    return response.data
  },

  getDashboardData: async (params) => {
    const response = await apiClient.get('/api/dashboard/', { params })
    return response.data
  },

  getNotifications: async (params) => {
    const response = await apiClient.get('/api/notifications/notifications/', { params })
    return response.data
  },

  getUnreadNotificationsCount: async () => {
    const response = await apiClient.get('/api/notifications/notifications/unread_count/')
    return response.data
  },

  markNotificationAsRead: async (id) => {
    const response = await apiClient.post(`/api/notifications/notifications/${id}/mark_as_read/`)
    return response.data
  },

  getMyQuizAttempts: async (params) => {
    const response = await apiClient.get('/api/quizzes/attempts/my_attempts/', { params })
    return response.data
  }
}

export default studentService
