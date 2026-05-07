import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { publicArticleAPI } from "../services/publicArticleApi";
import { Search, Calendar, User, Tag, ChevronLeft, ChevronRight, Loader2, FileText } from "lucide-react";

const ArticlePublicList = ({ isDarkMode, toggleDarkMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, per_page: 12 };
      if (currentCategory) params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;

      const response = await publicArticleAPI.getArticles(params);
      const data = response.data.data;
      setArticles(data.data);
      setPagination({
        currentPage: data.current_page,
        lastPage: data.last_page,
        total: data.total,
        from: data.from,
        to: data.to,
      });
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentCategory, currentSearch]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await publicArticleAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset page when filters change
    if (!updates.page) {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: null });
  };

  const handleCategoryFilter = (categorySlug) => {
    updateParams({ category: categorySlug, page: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    return `${baseUrl}/storage/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Artikel & Insight
            </h1>
            <p className="max-w-2xl mx-auto mt-3 text-lg text-gray-600 dark:text-gray-400">
              Temukan tips, panduan, dan wawasan seputar bisnis dan strategi keuangan
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex max-w-xl mx-auto mt-8 overflow-hidden border border-gray-200 rounded-xl dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full py-3 pl-12 pr-4 text-sm bg-transparent dark:text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Category Tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handleCategoryFilter("")}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  !currentCategory
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.slug)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    currentCategory === cat.slug
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2
                  size={40}
                  className="mx-auto text-green-600 animate-spin"
                />
                <p className="mt-3 text-gray-500 dark:text-gray-400">
                  Memuat artikel...
                </p>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText
                size={56}
                className="mb-4 text-gray-300 dark:text-gray-600"
              />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Belum ada artikel
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {currentSearch || currentCategory
                  ? "Coba ubah kata kunci atau filter kategori"
                  : "Artikel akan segera hadir"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.slug}`}
                    className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 group rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700">
                      {article.featured_image ? (
                        <img
                          src={getImageUrl(article.featured_image)}
                          alt={article.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <FileText
                            size={40}
                            className="text-gray-300 dark:text-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Category Badge */}
                      {article.category && (
                        <span className="inline-flex px-2.5 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400 mb-2">
                          {article.category.name}
                        </span>
                      )}

                      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {article.title}
                      </h2>

                      {article.excerpt && (
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {article.author && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {article.author.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(article.published_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.lastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() =>
                      updateParams({
                        page: String(Math.max(1, currentPage - 1)),
                      })
                    }
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Sebelumnya
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    Halaman {currentPage} dari {pagination.lastPage}
                  </span>

                  <button
                    onClick={() =>
                      updateParams({
                        page: String(
                          Math.min(pagination.lastPage, currentPage + 1)
                        ),
                      })
                    }
                    disabled={currentPage >= pagination.lastPage}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                  >
                    Selanjutnya
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArticlePublicList;
