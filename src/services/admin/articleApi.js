import api from "../authApi";

export const articleAPI = {
  // Articles CRUD
  getArticles: (params = {}) => api.get("/admin/articles", { params }),
  getArticle: (id) => api.get(`/admin/articles/${id}`),
  createArticle: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.post("/admin/articles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateArticle: (id, data) => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.post(`/admin/articles/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteArticle: (id) => api.delete(`/admin/articles/${id}`),

  // Image upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/admin/articles/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadGallery: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));
    return api.post("/admin/articles/upload-gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Categories
  getCategories: () => api.get("/admin/article-categories"),
  createCategory: (data) => api.post("/admin/article-categories", data),
  updateCategory: (id, data) =>
    api.put(`/admin/article-categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/article-categories/${id}`),
};

export default articleAPI;
