import axios from "axios";
import { clearAppData } from "../utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses - SANGAT SIMPLE, biarkan component handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // HANYA handle 401 jika benar-benar token expired
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.message?.toLowerCase() || "";

      // Hanya logout jika pesan error secara eksplisit menyebut token/authentication
      const isExplicitTokenError =
        errorMessage.includes("token expired") ||
        errorMessage.includes("token invalid") ||
        errorMessage.includes("unauthenticated") ||
        errorMessage.includes("authentication failed");

      if (isExplicitTokenError) {
        clearAppData();
        window.location.href = (import.meta.env.BASE_URL || "/") + "login";
      }
      // Untuk 401 lainnya, biarkan di-handle oleh component
    }

    // Handle 403 account status (banned/inactive) - force logout
    if (error.response?.status === 403) {
      const accountStatus = error.response.data?.data?.account_status;
      if (accountStatus === "banned" || accountStatus === "inactive") {
        clearAppData();
        window.location.href = (import.meta.env.BASE_URL || "/") + "login";
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/register", userData),
  registerConsultant: (userData) => api.post("/register-consultant", userData),
  verifyOtp: (data) => api.post("/verify-otp", data),
  resendOtp: (data) => api.post("/resend-otp", typeof data === 'object' ? data : { phone: data }),
  login: (credentials) => api.post("/login", credentials),
  logout: () => api.post("/logout"),
  getMe: () => api.get("/me"),
  forgotPassword: (data) => api.post("/forgot-password", typeof data === 'object' ? data : { phone: data }),
  verifyResetOtp: (data) => api.post("/verify-reset-otp", data),
  resetPassword: (data) => api.post("/reset-password", data),
  getFeatureFlags: () => api.get("/feature-flags"),
};

export default api;
