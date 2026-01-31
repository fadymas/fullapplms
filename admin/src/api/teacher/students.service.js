import apiClient from '../axiosConfig'

const teacherStudentsService = {
  getMyStudents: async (page = 1, courseId = '', search = '') => {
    const response = await apiClient.get('/api/courses/enrollments/', {
      params: { page, course: courseId, search }
    })
    return response.data
  },

  getStudentDetail: async (studentId) => {
    const response = await apiClient.get(`/api/users/profiles/${studentId}/`)
    return response.data
  },

  getStudentProgress: async (studentId, courseId = '') => {
    const response = await apiClient.get(
      `/api/courses/enrollments/student/${studentId}/progress/`,
      {
        params: { course: courseId }
      }
    )
    return response.data
  },

  getStudentQuizAttempts: async (studentId, courseId = '') => {
    const response = await apiClient.get('/api/quizzes/attempts/my_attempts/', {
      params: { student: studentId, course: courseId }
    })
    return response.data
  },

  sendMessageToStudent: async (studentId, message, subject = '') => {
    const response = await apiClient.post(`/api/messages/send/`, {
      recipient: studentId,
      subject,
      message
    })
    return response.data
  },

  getStudentByEnrollment: async (enrollmentId) => {
    const response = await apiClient.get(`/api/courses/enrollments/${enrollmentId}/`)
    return response.data
  }
}

export default teacherStudentsService
