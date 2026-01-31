import apiClient from './axiosConfig';

const courseService = {
    getCourses: async (params) => {
        const response = await apiClient.get('/api/courses/courses/', { params });
        return response.data;
    },

    getCourseDetails: async (id) => {
        const response = await apiClient.get(`/api/courses/courses/${id}/`);
        return response.data;
    },

    getCourseContent: async (id) => {
        const response = await apiClient.get(`/api/courses/courses/${id}/content/`);
        return response.data;
    },

    getLectureDetails: async (id) => {
        const response = await apiClient.get(`/api/courses/lectures/${id}/`);
        return response.data;
    },

    getMyEnrollments: async () => {
        const response = await apiClient.get('/api/courses/enrollments/');
        return response.data;
    }
};

export default courseService;
