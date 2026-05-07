import api from "./authApi";

export const consultationApi = {
  // Member endpoints
  getConsultants: () => api.get("/consultation/consultants"),
  
  getAvailableSlots: (consultantId, date) => 
    api.get(`/consultation/available-slots?consultant_id=${consultantId}&date=${date}`),
    
  requestSession: (data) => api.post("/consultation/request", data),
  
  getMySessions: () => api.get("/consultation/my-sessions"),
  
  getCredits: () => api.get("/consultation/credits"),
};

export default consultationApi;
