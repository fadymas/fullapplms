import apiClient from './axiosConfig'

const profileService = {
  getUserProfile: async () => {
    const response = apiClient.get('/api/users/profiles/me/')
    return response
  }
}

export { profileService }
