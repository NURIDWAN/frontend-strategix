import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/authApi";
import { clearAppData } from "../utils/authStorage";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      // Check if account needs verification
      if (
        response.data.success === false &&
        response.data.data?.needs_verification
      ) {
        return {
          success: false,
          needsVerification: true,
          email: response.data.data.email,
          phone: response.data.data.phone,
          message: response.data.message,
        };
      }

      const { user, access_token } = response.data.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true, data: response.data };
    } catch (error) {
      // Handle verification needs from error response
      if (error.response?.data?.data?.needs_verification) {
        return {
          success: false,
          needsVerification: true,
          email: error.response.data.data.email,
          phone: error.response.data.data.phone,
          message: error.response.data.message,
        };
      }

      // Handle account status errors (banned/inactive)
      if (error.response?.data?.data?.account_status) {
        return {
          success: false,
          accountStatus: error.response.data.data.account_status,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Login gagal",
      };
    }
  };

  const loginWithToken = async (token) => {
    try {
      localStorage.setItem("token", token);
      const response = await authAPI.getMe();
      const currentUser = response.data.data.user;
      localStorage.setItem("user", JSON.stringify(currentUser));
      setUser(currentUser);

      return { success: true, user: currentUser };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        success: false,
        message: error.response?.data?.message || "Google login gagal",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      return {
        success: true,
        data: response.data,
        needsVerification: response.data.message.toLowerCase().includes("verifikasi") || response.data.data?.email_verified === false,
        email: userData.email,
        phone: userData.phone,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registrasi gagal",
        errors: error.response?.data?.errors,
      };
    }
  };

  const registerConsultant = async (userData) => {
    try {
      const response = await authAPI.registerConsultant(userData);

      return {
        success: true,
        data: response.data,
        needsVerification: response.data.message.toLowerCase().includes("verifikasi") || response.data.data?.email_verified === false,
        email: userData.email,
        phone: userData.phone,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registrasi konsultan gagal",
        errors: error.response?.data?.errors,
      };
    }
  };

  const verifyOtp = async (data) => {
    try {
      const response = await authAPI.verifyOtp(data);

      if (response.data.data?.access_token) {
        const { user, access_token } = response.data.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Verifikasi gagal",
      };
    }
  };

  const resendOtp = async (identifier) => {
    try {
      const response = await authAPI.resendOtp(identifier);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Gagal mengirim ulang OTP",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAppData();
      setUser(null);
    }
  };

  const forgotPassword = async (identifier) => {
    try {
      await authAPI.forgotPassword(identifier);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Terjadi kesalahan",
      };
    }
  };

  const verifyResetOtp = async (data) => {
    try {
      const response = await authAPI.verifyResetOtp(data);
      return {
        success: true,
        data: response.data,
        resetToken: response.data.data?.reset_token
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "OTP tidak valid",
      };
    }
  };

  const resetPassword = async (data) => {
    try {
      await authAPI.resetPassword(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Terjadi kesalahan",
      };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    loginWithToken,
    register,
    registerConsultant,
    verifyOtp,
    resendOtp,
    logout,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isConsultant: user?.role === "consultant",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthContext;
