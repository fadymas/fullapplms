import apiClient from '../axiosConfig'

const adminEnrollmentsService = {
  getAllEnrollments: async (page = 1, courseId = '', studentId = '') => {
    const response = await apiClient.get('/api/courses/enrollments/', {
      params: { page, course: courseId, student: studentId }
    })
    return response.data
  },

  getEnrollmentDetail: async (enrollmentId) => {
    const response = await apiClient.get(`/api/courses/enrollments/${enrollmentId}/`)
    return response.data
  },

  createEnrollment: async (studentId, courseId) => {
    const response = await apiClient.post('/api/courses/enrollments/', {
      student: studentId,
      course: courseId
    })
    return response.data
  },

  removeEnrollment: async (enrollmentId) => {
    const response = await apiClient.delete(`/api/courses/enrollments/${enrollmentId}/`)
    return response.data
  },

  getEnrollmentsByStudent: async (studentId, page = 1) => {
    const response = await apiClient.get('/api/courses/enrollments/', {
      params: { page, student: studentId }
    })
    return response.data
  },

  getEnrollmentsByCourse: async (courseId, page = 1) => {
    const response = await apiClient.get('/api/courses/enrollments/', {
      params: { page, course: courseId }
    })
    return response.data
  }
}

export default adminEnrollmentsService
