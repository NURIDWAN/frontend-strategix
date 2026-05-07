import api from '../authApi';

export const marketAnalysisApi = {
    getAll: (params = {}) => {
        return api.get("/market-analysis", { params })
            .then(response => {
                return response;
            })
            .catch(error => {
                throw error;
            });
    },
    
    getById: (id) => {
        return api.get(`/market-analysis/${id}`);
    },
    
    create: (analysisData) => {
        return api.post("/market-analysis", analysisData);
    },
    
    update: (id, analysisData) => {
        return api.put(`/market-analysis/${id}`, analysisData);
    },
    
    delete: (id, userId) => {
        return api.delete(`/market-analysis/${id}`, { 
            data: { user_id: userId } 
        });
    },
    
    // REVISI: Tambahan method untuk kalkulasi market size
    calculateMarketSize: (calculatorData) => {
        return api.post("/market-analysis/calculate-market-size", calculatorData);
    },
};

export default marketAnalysisApi;