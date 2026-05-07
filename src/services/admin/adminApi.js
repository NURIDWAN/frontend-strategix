import api from "../authApi";

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard-stats"),

  // Users
  getUsers: (params = {}) => api.get("/admin/users", { params }),
  createUser: (data) => api.post("/admin/users", data),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserPassword: (id, data) => api.put(`/admin/users/${id}/password`, data),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  grantProAccess: (id, data) => api.put(`/admin/users/${id}/grant-pro`, data),
  grantConsultationAccess: (id, data) => api.put(`/admin/users/${id}/grant-consultation`, data),

  // Payments
  getPayments: (params = {}) => api.get("/admin/payments", { params }),
  getPayment: (id) => api.get(`/admin/payments/${id}`),
  getPaymentStats: () => api.get("/admin/payments/stats"),
  updatePaymentStatus: (id, data) => api.put(`/admin/payments/${id}/status`, data),
   getPackages: () => api.get("/admin/packages"),
   createPackage: (data) => api.post("/admin/packages", data),
   updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
   deletePackage: (id) => api.delete(`/admin/packages/${id}`),

  // Affiliates
  getAffiliates: (params = {}) => api.get("/admin/affiliates", { params }),
  getAffiliate: (userId) => api.get(`/admin/affiliates/${userId}`),
  getAffiliateStats: () => api.get("/admin/affiliates/stats"),
  getCommissions: (params = {}) => api.get("/admin/affiliates/commissions", { params }),
  updateCommissionStatus: (id, data) => api.put(`/admin/affiliates/commissions/${id}/status`, data),
  getWithdrawals: (params = {}) => api.get("/admin/affiliates/withdrawals", { params }),
  updateWithdrawalStatus: (id, data) => api.put(`/admin/affiliates/withdrawals/${id}/status`, data),

  // Logs
  getLogs: (params = {}) => api.get("/admin/logs", { params }),
  getLogStats: () => api.get("/admin/logs/stats"),

  // SEO Pages
  getSeoPages: () => api.get("/admin/seo-pages"),
  updateSeoPage: (id, data) => api.put(`/admin/seo-pages/${id}`, data),
  bulkUpdateSeoPages: (pages) => api.put("/admin/seo-pages/bulk", { pages }),

  // Consultations
  getConsultants: () => api.get("/admin/consultations/consultants"),
  assignConsultantRole: (userId) => api.post("/admin/consultations/assign-consultant", { user_id: userId }),
  getAllConsultationSessions: () => api.get("/admin/consultations/all-sessions"),
};

export default adminAPI;
