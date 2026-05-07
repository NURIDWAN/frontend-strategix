import api from "../authApi";

const financialProjectionApi = {
  // Get all projections
  getAll: (params = {}) => {
    return api.get("/management-financial/projections", { params });
  },

  // Get baseline data from simulations
  getBaseline: (params = {}) => {
    return api.get("/management-financial/projections/baseline", { params });
  },

  // Create new projection
  create: (data) => {
    return api.post("/management-financial/projections", data);
  },

  // Get specific projection
  show: (id) => {
    return api.get(`/management-financial/projections/${id}`);
  },

  // Delete projection
  delete: (id, userId) => {
    return api.delete(`/management-financial/projections/${id}`, {
      data: { user_id: userId },
    });
  },
};

export default financialProjectionApi;
