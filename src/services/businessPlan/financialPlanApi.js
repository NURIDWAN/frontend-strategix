import api from "../authApi";

export const financialPlanApi = {
  // Get all financial plans
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/financial-plans", { params });
      return response;
    } catch (error) {
      console.error("Error fetching financial plans:", error);
      throw error.response?.data || error;
    }
  },

  // Get financial summary
  getSummary: async (params = {}) => {
    try {
      const response = await api.get("/financial-plans/summary/financial", { params });
      return response;
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw error.response?.data || error;
    }
  },

  // Get single financial plan
  getById: async (id) => {
    try {
      const response = await api.get(`/financial-plans/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching financial plan:", error);
      throw error.response?.data || error;
    }
  },

  // Create new financial plan
  create: async (data) => {
    try {
      console.log("Creating financial plan with data:", data);
      const response = await api.post("/financial-plans", data);
      return response;
    } catch (error) {
      console.error("Error creating financial plan:", error);
      throw error.response?.data || error;
    }
  },

  // Update financial plan
  update: async (id, data) => {
    try {
      console.log("Updating financial plan:", id, data);
      const response = await api.put(`/financial-plans/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating financial plan:", error);
      throw error.response?.data || error;
    }
  },

  // Delete financial plan
  delete: async (id) => {
    try {
      const response = await api.delete(`/financial-plans/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting financial plan:", error);
      throw error.response?.data || error;
    }
  },

  // Get businesses for dropdown
  getBusinesses: async (params = {}) => {
    try {
      const response = await api.get("/business-background", { params });
      return response;
    } catch (error) {
      console.error("Error fetching businesses:", error);
      throw error.response?.data || error;
    }
  },

  // Additional features
  getCashFlow: async (id, params = {}) => {
    try {
      const response = await api.get(`/financial-plans/${id}/cash-flow`, { params });
      return response;
    } catch (error) {
      console.error("Error fetching cash flow:", error);
      throw error.response?.data || error;
    }
  },

  getFeasibility: async (id) => {
    try {
      const response = await api.get(`/financial-plans/${id}/feasibility`);
      return response;
    } catch (error) {
      console.error("Error fetching feasibility:", error);
      throw error.response?.data || error;
    }
  },

  generateReport: async (id, params = {}) => {
    try {
      const response = await api.get(`/financial-plans/${id}/report`, { params });
      return response;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error.response?.data || error;
    }
  },

  getChartData: async (id, params = {}) => {
    try {
      const response = await api.get(`/financial-plans/${id}/charts`, { params });
      return response;
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error.response?.data || error;
    }
  },

  getDashboardCharts: async (params = {}) => {
    try {
      const response = await api.get("/financial-plans/dashboard/charts", { params });
      return response;
    } catch (error) {
      console.error("Error fetching dashboard charts:", error);
      throw error.response?.data || error;
    }
  },

  getFinancialForecast: async (id, params = {}) => {
    try {
      const response = await api.get(`/financial-plans/${id}/forecast`, { params });
      return response;
    } catch (error) {
      console.error("Error fetching financial forecast:", error);
      throw error.response?.data || error;
    }
  },

  getSensitivityAnalysis: async (id, params = {}) => {
    try {
      const response = await api.get(`/financial-plans/${id}/sensitivity`, { params });
      return response;
    } catch (error) {
      console.error("Error fetching sensitivity analysis:", error);
      throw error.response?.data || error;
    }
  },
};

export default financialPlanApi;
