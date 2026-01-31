import apiClient from '../axiosConfig'

const adminReportsService = {
  getTopCourses: async (limit = 10, orderBy = 'revenue', startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/payments/reports/top-courses/', {
      params: { limit, order_by: orderBy, start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getStudentActivity: async (page = 1, startDate = '', endDate = '', minPurchases = '') => {
    const response = await apiClient.get('/api/payments/reports/student-activity/', {
      params: { page, start_date: startDate, end_date: endDate, min_purchases: minPurchases }
    })
    return response.data
  },

  getInstructorRevenue: async (page = 1, instructorId = '', startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/payments/reports/instructor-revenue/', {
      params: { page, instructor: instructorId, start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getRechargeCodesReport: async () => {
    const response = await apiClient.get('/api/payments/reports/recharge-codes/')
    return response.data
  },

  getRefundsReport: async (page = 1, startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/payments/reports/refunds/', {
      params: { page, start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getFailedTransactionsReport: async (page = 1, startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/payments/reports/failed-transactions/', {
      params: { page, start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  exportReport: async (reportType, format = 'csv', startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/reports/export/', {
      params: { report_type: reportType, format, start_date: startDate, end_date: endDate },
      responseType: 'blob'
    })
    return response.data
  }
}

export default adminReportsService
