import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { publicArticleAPI } from "../services/publicArticleApi";
import {
  Calendar,
  User,
  ArrowLeft,
  Tag,
  Loader2,
  FileText,
} from "lucide-react";

const ArticlePublicDetail = ({ isDarkMode, toggleDarkMode }) => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicArticleAPI.getArticle(slug);
        setArticle(response.data.data);
        setRelated(response.data.related || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Artikel tidak ditemukan");
        } else {
          setError("Gagal memuat artikel");
        }
        console.error("Failed to fetch article:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
      // Scroll to top on navigation
      window.scrollTo(0, 0);
    }
  }, [slug]);

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

      {/* Content */}
      <main className="pt-20">
        {loading ? (
          <div className="flex items-center justify-center py-32">
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32">
            <FileText
              size={56}
              className="mb-4 text-gray-300 dark:text-gray-600"
            />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {error}
            </h2>
            <Link
              to="/articles"
              className="flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <ArrowLeft size={16} />
              Kembali ke daftar artikel
            </Link>
          </div>
        ) : article ? (
          <>
            {/* Featured Image */}
            {article.featured_image && (
              <div className="w-full bg-gray-100 dark:bg-gray-800 max-h-[480px] overflow-hidden">
                <img
                  src={getImageUrl(article.featured_image)}
                  alt={article.title}
                  className="object-cover w-full h-full max-h-[480px] mx-auto"
                />
              </div>
            )}

            {/* Article Content */}
            <article className="px-4 py-10 mx-auto max-w-4xl sm:px-6 lg:px-8">
              {/* Back Link */}
              <Link
                to="/articles"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 mb-6 transition-colors"
              >
                <ArrowLeft size={14} />
                Kembali ke semua artikel
              </Link>

              {/* Category Badge */}
              {article.category && (
                <Link
                  to={`/articles?category=${article.category.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors mb-4"
                >
                  <Tag size={12} />
                  {article.category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white leading-tight">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                {article.author && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {article.author.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(article.published_at)}
                </span>
              </div>

              {/* Divider */}
              <hr className="my-8 border-gray-200 dark:border-gray-700" />

              {/* Body Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-p:text-gray-700 dark:prose-p:text-gray-300
                  prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-green-500
                  prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-600
                  prose-th:bg-gray-50 dark:prose-th:bg-gray-800
                  prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                  prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
                  prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
            </article>

            {/* Related Articles */}
            {related.length > 0 && (
              <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                  <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                    Artikel Terkait
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {related.map((item) => (
                      <Link
                        key={item.id}
                        to={`/articles/${item.slug}`}
                        className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 group rounded-xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700">
                          {item.featured_image ? (
                            <img
                              src={getImageUrl(item.featured_image)}
                              alt={item.title}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <FileText
                                size={32}
                                className="text-gray-300 dark:text-gray-600"
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {item.title}
                          </h3>
                          {item.excerpt && (
                            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {item.excerpt}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(item.published_at)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default ArticlePublicDetail;
