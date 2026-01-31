import apiClient from './axiosConfig'

const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/users/auth/login/', { email, password })

    return response.data
  },

  logout: async (refreshToken) => {
    const response = await apiClient.post('/api/users/auth/logout/', { refresh: refreshToken })
    return response.data
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/api/users/auth/refresh/', { refresh: refreshToken })
    return response.data
  }
}

export default authService
