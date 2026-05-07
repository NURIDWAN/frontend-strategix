import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${API_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const affiliateLinkApi = {
  // Get or create affiliate link for authenticated user
  getMyLink: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/affiliate/my-link`,
        getAuthHeader()
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update affiliate slug
  updateSlug: async (newSlug) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/affiliate/slug`,
        { new_slug: newSlug },
        getAuthHeader()
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Toggle affiliate link active status
  toggleActive: async (affiliateLinkId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/affiliate/${affiliateLinkId}/toggle-active`,
        {},
        getAuthHeader()
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Show affiliate link details
  show: async (affiliateLinkId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/affiliate/${affiliateLinkId}`,
        getAuthHeader()
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
