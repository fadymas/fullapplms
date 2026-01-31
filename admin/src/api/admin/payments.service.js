import apiClient from '../axiosConfig'

const adminPaymentsService = {
  getAllWallets: async (page = 1, search = '') => {
    const response = await apiClient.get('/api/payments/wallets/', {
      params: { page, search }
    })
    return response.data
  },

  getWalletDetail: async (walletId) => {
    const response = await apiClient.get(`/api/payments/wallets/${walletId}/`)
    return response.data
  },

  manualDeposit: async (walletId, amount, reason, student_id) => {
    const response = await apiClient.post(`/api/payments/wallets/${walletId}/manual_deposit/`, {
      amount,
      reason,
      student_id
    })
    return response.data
  },

  getAllTransactions: async (page = 1, type = '', startDate = '', endDate = '') => {
    const response = await apiClient.get('/api/payments/transactions/', {
      params: { page, transaction_type: type, start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  getTransactionDetail: async (transactionId) => {
    const response = await apiClient.get(`/api/payments/transactions/${transactionId}/`)
    return response.data
  },

  getAllPurchases: async (page = 1, search = '') => {
    const response = await apiClient.get('/api/payments/purchases/', {
      params: { page, search }
    })
    return response.data
  },

  getPurchaseDetail: async (purchaseId) => {
    const response = await apiClient.get(`/api/payments/purchases/${purchaseId}/`)
    return response.data
  },

  refundPurchase: async (purchaseId, reason) => {
    const response = await apiClient.post(`/api/payments/purchases/${purchaseId}/refund/`, {
      reason
    })
    return response.data
  }
}

export default adminPaymentsService
