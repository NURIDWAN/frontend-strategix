import api from "../authApi";

const marketingStrategiesApi = {
  getAll: () => api.get("/marketing-strategy"),

  getById: (id) => {
    return api.get(`/marketing-strategy/${id}`);
  },

  create: (marketingStrategies) => {
    return api.post("/marketing-strategy", marketingStrategies);
  },

  update: (id, marketingStrategies) => {
    return api.put(`/marketing-strategy/${id}`, marketingStrategies);
  },

  delete: (id, userId) => {
    return api.delete(`/marketing-strategy/${id}`, {
      data: { user_id: userId },
    });
  },
};

export default marketingStrategiesApi;
