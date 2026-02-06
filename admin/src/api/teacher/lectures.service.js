import apiClient from '../axiosConfig'

const teacherLecturesService = {
  getLecturesByCourse: async (courseId, page = 1) => {
    const response = await apiClient.get('/api/courses/lectures/', {
      params: { page, course: courseId }
    })
    return response.data
  },

  listLectures: async () => {
    const response = await apiClient.get('/api/courses/lectures/')
    return response.data
  },

  getLecturesBySection: async (sectionId, page = 1) => {
    const response = await apiClient.get('/api/courses/lectures/', {
      params: { page, section: sectionId }
    })
    return response.data
  },

  getLectureDetail: async (lectureId) => {
    const response = await apiClient.get(`/api/courses/lectures/${lectureId}/`)
    return response.data
  },

  createLecture: async (lectureData) => {
    const response = await apiClient.post('/api/courses/lectures/', lectureData)
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

  uploadLectureVideo: async (lectureId, videoFile) => {
    const formData = new FormData()
    formData.append('video', videoFile)
    const response = await apiClient.post(
      `/api/courses/lectures/${lectureId}/upload_video/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  uploadLectureFile: async (lectureId, file, fileName) => {
    const formData = new FormData()
    formData.append('lecture', lectureId)
    formData.append('file', file)
    formData.append('title', fileName)
    const response = await apiClient.post(
      `/api/courses/lecture-files/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  downloadLectureFile: async (fileId) => {
    const response = await apiClient.get(`/api/courses/files/${fileId}/download/`, {
      responseType: 'blob'
    })
    return response.data
  },

  reorderLectures: async (courseId, lectureOrder) => {
    const response = await apiClient.post(`/api/courses/courses/${courseId}/reorder_lectures/`, {
      lectures: lectureOrder
    })
    return response.data
  }
}

export default teacherLecturesService
