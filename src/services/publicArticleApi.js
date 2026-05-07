import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const publicArticleAPI = {
  getArticles: (params = {}) => publicApi.get("/articles", { params }),
  getCategories: () => publicApi.get("/articles/categories"),
  getArticle: (slug) => publicApi.get(`/articles/${slug}`),
};

export default publicArticleAPI;
