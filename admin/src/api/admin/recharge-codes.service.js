import apiClient from '../axiosConfig'

const adminRechargeCodesService = {
  getAllCodes: async (page = '', isUsed = '', createdBy = '') => {
    const response = await apiClient.get('/api/payments/recharge-codes/', {
      params: { page, is_used: isUsed, created_by: createdBy }
    })
    return response.data
  },

  getCodeDetail: async (codeId) => {
    const response = await apiClient.get(`/api/payments/recharge-codes/${codeId}/`)
    return response.data
  },

  createCode: async (code, amount, expiresAt) => {
    const response = await apiClient.post('/api/payments/recharge-codes/', {
      code,
      amount,
      expires_at: expiresAt
    })
    return response.data
  },

  bulkGenerateCodes: async (amount, count, prefix = '', expiresAt) => {
    const response = await apiClient.post('/api/payments/recharge-codes/bulk_generate/', {
      amount,
      count,
      prefix,
      expires_at: expiresAt
    })
    return response.data
  },

  useCode: async (code) => {
    const response = await apiClient.post('/api/payments/recharge-codes/use_code/', {
      code
    })
    return response.data
  },

  deleteCode: async (codeId) => {
    const response = await apiClient.delete(`/api/payments/recharge-codes/${codeId}/`)
    return response.data
  },

  extendCodeExpiry: async (codeId, newExpiryDate) => {
    const response = await apiClient.patch(`/api/payments/recharge-codes/${codeId}/`, {
      expires_at: newExpiryDate
    })
    return response.data
  },

  deactivateCode: async (codeId) => {
    const response = await apiClient.post(`/api/payments/recharge-codes/${codeId}/deactivate/`)
    return response.data
  }
}

export default adminRechargeCodesService
