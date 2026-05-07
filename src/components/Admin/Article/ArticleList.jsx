import { useState, useEffect, useCallback } from "react";
import { articleAPI } from "../../../services/admin/articleApi";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
} from "lucide-react";

const STATUS_LABELS = {
  draft: { text: "Draft", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  published: { text: "Dipublikasikan", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  archived: { text: "Diarsipkan", className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400" },
};

const ArticleList = ({ onNavigateToForm }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const response = await articleAPI.getArticles(params);
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
      toast.error("Gagal memuat daftar artikel");
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await articleAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) return;

    try {
      setDeleting(id);
      await articleAPI.deleteArticle(id);
      toast.success("Artikel berhasil dihapus");
      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus artikel");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (article) => {
    const newStatus = article.status === "published" ? "draft" : "published";
    const actionText =
      newStatus === "published" ? "mempublikasikan" : "menyimpan sebagai draft";

    try {
      setToggling(article.id);
      await articleAPI.updateArticle(article.id, { status: newStatus });
      toast.success(
        `Artikel berhasil ${
          newStatus === "published" ? "dipublikasikan" : "disimpan sebagai draft"
        }`
      );
      fetchArticles();
    } catch (err) {
      toast.error(`Gagal ${actionText} artikel`);
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Kelola Artikel
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Buat, edit, dan kelola konten artikel
          </p>
        </div>
        <button
          onClick={() => onNavigateToForm(null)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Tambah Artikel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg sm:flex-row sm:items-center dark:bg-gray-800 dark:border-gray-700">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full py-2 pl-9 pr-3 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Dipublikasikan</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto text-green-600 animate-spin"
              />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Memuat artikel...
              </p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText
              size={48}
              className="mb-3 text-gray-300 dark:text-gray-600"
            />
            <p className="text-gray-500 dark:text-gray-400">
              {search || statusFilter || categoryFilter
                ? "Tidak ada artikel yang sesuai filter"
                : "Belum ada artikel"}
            </p>
            {!search && !statusFilter && !categoryFilter && (
              <button
                onClick={() => onNavigateToForm(null)}
                className="flex items-center gap-1.5 px-4 py-2 mt-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Plus size={16} />
                Buat Artikel Pertama
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Penulis</th>
                    <th className="px-4 py-3">Tgl Publikasi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {articles.map((article) => {
                    const statusInfo =
                      STATUS_LABELS[article.status] || STATUS_LABELS.draft;

                    return (
                      <tr
                        key={article.id}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                              {article.title}
                            </p>
                            {article.excerpt && (
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                                {article.excerpt}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {article.category?.name || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.className}`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {article.author?.name || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(article.published_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle publish/unpublish */}
                            <button
                              onClick={() => handleTogglePublish(article)}
                              disabled={toggling === article.id}
                              className={`p-1.5 rounded transition-colors ${
                                article.status === "published"
                                  ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                              } disabled:opacity-50`}
                              title={
                                article.status === "published"
                                  ? "Simpan sebagai Draft"
                                  : "Publikasikan"
                              }
                            >
                              {toggling === article.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : article.status === "published" ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() =>
                                onNavigateToForm(article.id)
                              }
                              className="p-1.5 text-blue-500 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() =>
                                handleDelete(article.id, article.title)
                              }
                              disabled={deleting === article.id}
                              className="p-1.5 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                              title="Hapus"
                            >
                              {deleting === article.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Menampilkan {pagination.from}-{pagination.to} dari{" "}
                  {pagination.total} artikel
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage <= 1}
                    className="p-1.5 text-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: pagination.lastPage },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === pagination.lastPage ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const showEllipsis =
                        idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-1 text-gray-400">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 text-sm rounded transition-colors ${
                              currentPage === page
                                ? "bg-green-600 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.lastPage, p + 1)
                      )
                    }
                    disabled={currentPage >= pagination.lastPage}
                    className="p-1.5 text-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticleList;
