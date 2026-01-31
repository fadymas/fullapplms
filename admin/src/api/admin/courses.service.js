import apiClient from '../axiosConfig'

const adminCoursesService = {
  getAllCourses: async (page = 1, search = '', status = '', category = '') => {
    const response = await apiClient.get('/api/courses/courses/', {
      params: { page, search, status, category }
    })
    return response.data
  },

  getCourseDetail: async (courseId) => {
    const response = await apiClient.get(`/api/courses/courses/${courseId}/`)
    return response.data
  },

  updateCourse: async (courseId, data) => {
    const response = await apiClient.patch(`/api/courses/courses/${courseId}/`, data)
    return response.data
  },
  createCourse: async (data) => {
    const response = await apiClient.post(`/api/courses/courses/`, data)
    return response.data
  },

  submitCourseForApproval: async (courseId) => {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/submit_for_approval/`)
    return response.data
  },
  approveCourse: async (courseId) => {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/approve/`)
    return response.data
  },

  rejectCourse: async (courseId, reason) => {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/reject/`, { reason })
    return response.data
  },

  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`/api/courses/courses/${courseId}/`)
    return response.data
  },

  getCourseContent: async (courseId) => {
    const response = await apiClient.get(`/api/courses/courses/${courseId}/content/`)
    return response.data
  },

  // List all lectures (paginated)
  listLectures: async (page = 1) => {
    const response = await apiClient.get('/api/courses/lectures/', {
      params: { page }
    })
    return response.data
  },

  createLecture: async (data) => {
    const response = await apiClient.post('/api/courses/lectures/', data)
    return response.data
  },

  updateLecture: async (lectureId, data) => {
    const response = await apiClient.patch(`/api/courses/lectures/${lectureId}/`, data)
    return response.data
  },

  deleteLecture: async (lectureId) => {
    const response = await apiClient.delete(`/api/courses/lectures/${lectureId}/`)
    return response.data
  },

  // List all lectures (paginated)
  listSections: async (page = 1) => {
    const response = await apiClient.get('/api/courses/sections/', {
      params: { page }
    })
    return response.data
  },

  createSection: async (data) => {
    const response = await apiClient.post('/api/courses/sections/', data)
    return response.data
  },

  updateSection: async (sectionId, data) => {
    const response = await apiClient.patch(`/api/courses/sections/${sectionId}/`, data)
    return response.data
  },

  deleteSection: async (sectionId) => {
    const response = await apiClient.delete(`/api/courses/sections/${sectionId}/`)
    return response.data
  }
}

export default adminCoursesService
