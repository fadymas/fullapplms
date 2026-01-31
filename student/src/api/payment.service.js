import apiClient from './axiosConfig';

const paymentService = {
    getMyWallet: async () => {
        const response = await apiClient.get('/api/payments/wallets/my_wallet/');
        return response.data;
    },

    getTransactions: async (params) => {
        const response = await apiClient.get('/api/payments/transactions/', { params });
        return response.data;
    },

    purchaseCourse: async (courseId) => {
        const response = await apiClient.post('/api/payments/purchases/purchase_course/', { course_id: courseId });
        return response.data;
    },

    getMyPurchases: async () => {
        const response = await apiClient.get('/api/payments/purchases/');
        return response.data;
    },

    useRechargeCode: async (code) => {
        const response = await apiClient.post('/api/payments/recharge-codes/use_code/', { code });
        return response.data;
    }
};

export default paymentService;
