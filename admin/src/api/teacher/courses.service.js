import apiClient from '../axiosConfig'

const teacherCoursesService = {
  getAllMyCourses: async (page = 1, search = '', status = '') => {
    const response = await apiClient.get('/api/courses/courses/', {
      params: { page, search, status, instructor: 'me' }
    })
    return response.data
  },

  getCourseDetail: async (courseId) => {
    const response = await apiClient.get(`/api/courses/courses/${courseId}/`)
    return response.data
  },

  createCourse: async (courseData) => {
    const response = await apiClient.post('/api/courses/courses/', courseData)
    return response.data
  },

  updateCourse: async (courseId, data) => {
    const response = await apiClient.patch(`/api/courses/courses/${courseId}/`, data)
    return response.data
  },

  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`/api/courses/courses/${courseId}/`)
    return response.data
  },

  submitForApproval: async (courseId) => {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/submit_for_approval/`)
    return response.data
  },

  getCourseContent: async (courseId) => {
    const response = await apiClient.get(`/api/courses/courses/${courseId}/content/`)
    return response.data
  },

  getCourseEnrollments: async (courseId, page = 1, search = '') => {
    const response = await apiClient.get('/api/courses/enrollments/', {
      params: { page, course: courseId, search }
    })
    return response.data
  },

  getCourseRevenue: async (courseId, startDate = '', endDate = '') => {
    const response = await apiClient.get(`/api/courses/courses/${courseId}/revenue/`, {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getCoursePurchases: async (courseId, page = 1) => {
    const response = await apiClient.get('/api/payments/purchases/', {
      params: { page, course: courseId }
    })
    return response.data
  }
}

export default teacherCoursesService
