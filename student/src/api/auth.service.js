import apiClient from './axiosConfig';

const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/api/users/auth/login/', { email, password });
        return response.data;
    },

    register: async (studentData) => {
        // Expected fields: email, password, password2, full_name, phone, guardian_phone, grade
        const response = await apiClient.post('/api/users/auth/register/', studentData);
        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await apiClient.post('/api/users/auth/logout/', { refresh: refreshToken });
        return response.data;
    },

    refreshToken: async (refreshToken) => {
        const response = await apiClient.post('/api/users/auth/refresh/', { refresh: refreshToken });
        return response.data;
    }
};

export default authService;
