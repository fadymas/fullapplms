import apiClient from '../axiosConfig'

const teacherDashboardService = {
  getDashboard: async (period = 'year', startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/dashboard/', {
      params: { period, start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getFilterOptions: async () => {
    const response = await apiClient.get('/api/dashboard/filter-options/')
    return response.data
  },

  exportDashboard: async (format = 'csv', type = 'overview', startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/dashboard/export/', {
      responseType: 'blob'
    })
    return response.data
  },

  getTeacherRevenue: async (startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/reports/instructor-revenue/', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getTopCourses: async (limit = 5, startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/reports/top-courses/', {
      params: { limit, start_date: startDate, end_date: endDate }
    })
    return response.data
  }
}

export default teacherDashboardService
