import api from '../authApi';

export const operationalPlanApi = {
    getAll: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                queryParams.append(key, params[key]);
            }
        });
        const queryString = queryParams.toString();
        return api.get(`/operational-plan${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) => api.get(`/operational-plan/${id}`),

    create: (planData) => api.post("/operational-plan", planData),

    update: (id, planData) => api.put(`/operational-plan/${id}`, planData),

    delete: (id, userId) => api.delete(`/operational-plan/${id}`, { data: { user_id: userId } }),

    // New methods untuk workflow diagram
    generateWorkflowDiagram: (id) => {
        return api.post(`/operational-plan/${id}/generate-workflow-diagram`);
    },

    uploadWorkflowImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('workflow_image', imageFile);
        
        return api.post(`/operational-plan/${id}/upload-workflow-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getStatistics: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                queryParams.append(key, params[key]);
            }
        });
        const queryString = queryParams.toString();
        return api.get(`/operational-plan/statistics/overview${queryString ? `?${queryString}` : ''}`);
    }
};

export default operationalPlanApi;