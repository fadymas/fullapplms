import apiClient from '../axiosConfig'

const adminUsersService = {
  getAllProfiles: async (page = 1, search = '', role = '') => {
    const response = await apiClient.get('/api/users/profiles/all/', {
      params: { page, search, role }
    })
    return response.data
  },
  getAllUsers: async (page = 1, search = '', role = '') => {
    const response = await apiClient.get('/api/users/users/', {
      params: { page, search, role }
    })
    return response.data
  },

  getAllStudents: async (page = 1, search = '') => {
    const response = await apiClient.get('/api/users/students/all/', {
      params: { page, search }
    })
    return response.data
  },

  getAllTeachers: async (page = 1, search = '') => {
    const response = await apiClient.get('/api/users/teachers/all/', {
      params: { page, search }
    })
    return response.data
  },

  getUserProfile: async (userId) => {
    const response = await apiClient.get(`/api/users/profiles/${userId}/`)
    return response.data
  },

  updateUserProfile: async (userId, data) => {
    const response = await apiClient.patch(`/api/users/users/${userId}/`, data)
    return response.data
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/api/users/users/', userData)
    return response.data
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/api/users/users/${userId}`)
    return response.data
  }

  
}

export default adminUsersService
