import api from "../authApi";

export const consultantApi = {
  // Consultant dashboard endpoints
  getDashboardStats: () => api.get("/consultant/dashboard-stats"),
  getDashboardOverview: () => api.get("/consultant/dashboard-overview"),
  
  getUpcomingSessions: () => api.get("/consultant/upcoming-sessions"),

  getSessions: (params = {}) => api.get("/consultant/sessions", { params }),

  getProfile: () => api.get("/consultant/profile"),
  
  updateSession: (id, data) => api.post(`/consultant/sessions/${id}`, data),
  
  updateAvailability: (data) => api.post("/consultant/availability", data),
};

export default consultantApi;
