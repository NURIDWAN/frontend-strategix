import api from "../authApi";

export const managementFinancialApi = {
  // Dashboard Stats
  getDashboardStats: (params) => {
    console.log("API Call: Getting dashboard stats with params:", params);
    return api.get("/management-financial/dashboard-stats", { params });
  },

  // Financial Categories (existing)
  categories: {
    getAll: (params) => api.get("/management-financial/categories", { params }),
    getById: (id) => api.get(`/management-financial/categories/${id}`),
    create: (categoryData) => api.post("/management-financial/categories", categoryData),
    update: (id, categoryData) => api.put(`/management-financial/categories/${id}`, categoryData),
    delete: (id, userId) =>
      api.delete(`/management-financial/categories/${id}`, {
        data: { user_id: userId },
      }),
    getSummary: (userId) =>
      api.get("/management-financial/categories/summary", {
        params: { user_id: userId },
      }),
  },

  // Financial Simulations (NEW)
  simulations: {
    getAll: (params) => {
      console.log("API Call: Getting all simulations with params:", params);
      return api.get("/management-financial/simulations", { params });
    },
    getById: (id) => api.get(`/management-financial/simulations/${id}`),
    create: (simulationData) => {
      console.log("API Call: Creating simulation with data:", simulationData);
      return api.post("/management-financial/simulations", simulationData);
    },
    update: (id, simulationData) => {
      console.log("API Call: Updating simulation:", id, simulationData);
      return api.put(`/management-financial/simulations/${id}`, simulationData);
    },
    delete: (id, userId) => {
      console.log("API Call: Deleting simulation:", id, userId);
      return api.delete(`/management-financial/simulations/${id}`, {
        data: { user_id: userId },
      });
    },
    getCashFlowSummary: (params) => {
      console.log("API Call: Getting cash flow summary with params:", params);
      return api.get("/management-financial/simulations/cash-flow-summary", { params });
    },
    getMonthlyComparison: (params) => {
      console.log("API Call: Getting monthly comparison with params:", params);
      return api.get("/management-financial/simulations/monthly-comparison", { params });
    },
    getAvailableYears: (params) => {
      console.log("API Call: Getting available years with params:", params);
      return api.get("/management-financial/simulations/available-years", { params });
    },
  },

  // Financial Summaries (FIXED)
  summaries: {
    getAll: (params) => {
      console.log("API Call: Getting all summaries with params:", params);
      return api.get("/management-financial/summaries", { params });
    },
    getById: (id) => api.get(`/management-financial/summaries/${id}`),
    create: (summaryData) => {
      console.log("API Call: Creating summary with data:", summaryData);
      return api.post("/management-financial/summaries", summaryData);
    },
    update: (id, summaryData) => {
      console.log("API Call: Updating summary:", id, summaryData);
      return api.put(`/management-financial/summaries/${id}`, summaryData);
    },
    delete: (id, userId) => {
      console.log("API Call: Deleting summary:", id, userId);
      return api.delete(`/management-financial/summaries/${id}`, {
        data: { user_id: userId },
      });
    },
    getStatistics: (params) => {
      console.log("API Call: Getting statistics with params:", params);
      return api.get("/management-financial/summaries/statistics", { params });
    },
    getMonthlyComparison: (params) => {
      console.log("API Call: Getting monthly comparison with params:", params);
      return api.get("/management-financial/summaries/monthly-comparison", { params });
    },
    generateFromSimulations: (data) => {
      console.log("API Call: Generating summaries from simulations with data:", data);
      return api.post("/management-financial/summaries/generate-from-simulations", data);
    },
  },
};

export default managementFinancialApi;
