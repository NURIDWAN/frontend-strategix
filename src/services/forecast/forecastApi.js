import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_URL}/api/management-financial/forecast`;

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

// Forecast Data CRUD
export const forecastDataApi = {
    /**
     * Get list of forecast data
     */
    getList: async (params = {}) => {
        try {
            const response = await apiClient.get('/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create new forecast data
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
     * Get forecast data by ID
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
     * Update forecast data
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
     * Delete forecast data
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
     * Import forecast data from Financial Simulation by year
     */
    importFromSimulation: async (year, month = null) => {
        try {
            const data = { year };
            if (month) data.month = month;
            const response = await apiClient.post('/import-from-simulation', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get available years from Financial Simulation
     */
    getSimulationYears: async () => {
        try {
            const response = await apiClient.get('/simulation-years');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

// Forecast Results & Generation
export const forecastResultsApi = {
    /**
     * Generate forecast directly from financial simulation
     */
    generateFromSimulation: async (simulationId, options = {}) => {
        try {
            const response = await apiClient.post('/generate-from-simulation', {
                financial_simulation_id: simulationId,
                ...options,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Generate forecast untuk forecast data tertentu
     */
    generate: async (forecastDataId, options = {}) => {
        try {
            const response = await apiClient.post(`/${forecastDataId}/generate`, options);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get forecast results untuk forecast data tertentu
     */
    getResults: async (forecastDataId) => {
        try {
            const response = await apiClient.get(`/${forecastDataId}/results`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get available years
     */
    getAvailableYears: async () => {
        try {
            const response = await apiClient.get('/available-years');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Compare multiple forecast scenarios
     */
    compare: async (forecastDataIds) => {
        try {
            const response = await apiClient.post('/compare', {
                forecast_data_ids: forecastDataIds,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default {
    forecastDataApi,
    forecastResultsApi,
};

// PDF Export API
export const pdfForecastApi = {
    /**
     * Generate PDF Forecast Report
     * Backend akan mengambil semua forecast results dari database
     */
    generatePdf: async (forecastDataId, mode = 'free', preview = false) => {
        try {
            const payload = {
                forecast_data_id: forecastDataId,
                mode: mode,
                preview: preview,
            };

            const response = await apiClient.post(`/${forecastDataId}/export-pdf`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000, // 60 seconds
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get PDF statistics
     */
    getStatistics: async () => {
        try {
            const response = await apiClient.get('/export-pdf/statistics');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};