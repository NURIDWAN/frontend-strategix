import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_URL}/api/management-financial/simulations`;

const getAuthToken = () => localStorage.getItem('token');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Financial Simulation CRUD
export const financialSimulationApi = {
    /**
     * Get list of financial simulations with filters
     */
    getList: async (params = {}) => {
        try {
            // Remove user_id from params if present, backend will get it from Auth
            const { user_id, ...filteredParams } = params;
            const response = await apiClient.get('/', { params: filteredParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get specific financial simulation
     */
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create new financial simulation
     */
    create: async (data) => {
        try {
            const response = await apiClient.post('/', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update financial simulation
     */
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete financial simulation
     */
    delete: async (id) => {
        try {
            const response = await apiClient.delete(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get cash flow summary
     */
    getCashFlowSummary: async (params = {}) => {
        try {
            const response = await apiClient.get('/cash-flow-summary', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get monthly comparison
     */
    getMonthlyComparison: async (params = {}) => {
        try {
            const response = await apiClient.get('/monthly-comparison', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get available years
     */
    getAvailableYears: async (params = {}) => {
        try {
            const response = await apiClient.get('/available-years', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};
