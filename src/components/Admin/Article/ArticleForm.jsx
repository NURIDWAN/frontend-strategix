import { useState, useEffect, useCallback, useRef } from "react";
import { articleAPI } from "../../../services/admin/articleApi";
import { compressImage } from "../../../utils/imageCompress";
import RichTextEditor from "./RichTextEditor";
import ArticleCategoryManager from "./ArticleCategoryManager";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Loader2,
  Image as ImageIcon,
  Plus,
  Settings2,
} from "lucide-react";

const ArticleForm = ({ articleId = null, onBack }) => {
  const isEditMode = !!articleId;

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");

  // Featured image state
  const [featuredImage, setFeaturedImage] = useState(null); // File object
  const [featuredImagePreview, setFeaturedImagePreview] = useState(""); // URL string
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // UI state
  const [categories, setCategories] = useState([]);
  const [showSeoSection, setShowSeoSection] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await articleAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  // Load article data for edit mode
  const loadArticle = useCallback(async () => {
    if (!articleId) return;
    try {
      setLoadingArticle(true);
      const response = await articleAPI.getArticle(articleId);
      const article = response.data.data;

      setTitle(article.title || "");
      setBody(article.body || "");
      setExcerpt(article.excerpt || "");
      setCategoryId(article.article_category_id || "");
      setStatus(article.status || "draft");
      setMetaTitle(article.meta_title || "");
      setMetaDescription(article.meta_description || "");
      setSlug(article.slug || "");

      if (article.published_at) {
        // Format to datetime-local input format
        const date = new Date(article.published_at);
        const formatted = date.toISOString().slice(0, 16);
        setPublishedAt(formatted);
      }

      if (article.featured_image) {
        const baseUrl =
          import.meta.env.VITE_API_URL || "http://localhost:8000";
        setFeaturedImagePreview(
          `${baseUrl}/storage/${article.featured_image}`
        );
      }
    } catch (err) {
      toast.error("Gagal memuat data artikel");
      console.error("Failed to load article:", err);
    } finally {
      setLoadingArticle(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      loadArticle();
    }
  }, [fetchCategories, loadArticle, isEditMode]);

  // Featured image handlers
  const handleImageSelect = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    try {
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
      });
      setFeaturedImage(compressed);
      setFeaturedImagePreview(URL.createObjectURL(compressed));
    } catch (err) {
      toast.error("Gagal memproses gambar");
      console.error("Image compression error:", err);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview("");
  };

  // Form submission
  const handleSubmit = async (submitStatus = null) => {
    // Validation
    if (!title.trim()) {
      toast.error("Judul artikel harus diisi");
      return;
    }
    if (!body.trim() || body === "<p></p>") {
      toast.error("Konten artikel harus diisi");
      return;
    }

    const finalStatus = submitStatus || status;

    try {
      setSaving(true);

      const data = {
        title: title.trim(),
        body,
        excerpt: excerpt.trim() || null,
        article_category_id: categoryId || null,
        status: finalStatus,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        published_at: publishedAt || null,
      };

      // Only include slug if user explicitly set it
      if (slug.trim() && isEditMode) {
        data.slug = slug.trim();
      }

      // Include featured image if a new one was selected
      if (featuredImage) {
        data.featured_image = featuredImage;
      }

      let response;
      if (isEditMode) {
        response = await articleAPI.updateArticle(articleId, data);
        toast.success("Artikel berhasil diperbarui");
      } else {
        response = await articleAPI.createArticle(data);
        toast.success("Artikel berhasil dibuat");
      }

      // Navigate back to article list
      onBack?.();
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal menyimpan artikel";
      toast.error(message);
      console.error("Save article error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Category created callback
  const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
    setCategoryId(newCategory.id);
  };

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-4 border-green-600 rounded-full animate-spin border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Memuat data artikel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Artikel" : "Buat Artikel Baru"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditMode
                ? "Perbarui konten artikel Anda"
                : "Tulis dan publikasikan artikel baru"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Publikasikan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul artikel..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Ringkasan (Excerpt)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat artikel untuk tampilan daftar..."
              rows={2}
              maxLength={300}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              {excerpt.length}/300 karakter
            </p>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Konten Artikel <span className="text-red-500">*</span>
            </label>
            <RichTextEditor content={body} onChange={setBody} />
          </div>

          {/* SEO Section (Collapsible) */}
          <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowSeoSection(!showSeoSection)}
              className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <Settings2
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pengaturan SEO
                </span>
              </div>
              {showSeoSection ? (
                <ChevronUp
                  size={16}
                  className="text-gray-400"
                />
              ) : (
                <ChevronDown
                  size={16}
                  className="text-gray-400"
                />
              )}
            </button>

            {showSeoSection && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                {/* Meta Title */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Judul untuk mesin pencari (max 60 karakter)"
                    maxLength={60}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {metaTitle.length}/60 karakter
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Deskripsi untuk mesin pencari (max 160 karakter)"
                    maxLength={160}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {metaDescription.length}/160 karakter
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug URL
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      /articles/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="otomatis-dari-judul"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Kosongkan untuk generate otomatis dari judul
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Gambar Utama
            </label>

            {featuredImagePreview ? (
              <div className="relative group">
                <img
                  src={featuredImagePreview}
                  alt="Preview"
                  className="object-cover w-full rounded-lg h-44"
                />
                <button
                  type="button"
                  onClick={removeFeaturedImage}
                  className="absolute p-1 text-white bg-red-500 rounded-full shadow-lg opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute px-2 py-1 text-xs font-medium text-white rounded bg-black/50 bottom-2 left-2 opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-opacity"
                >
                  Ganti Gambar
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDraggingOver
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <ImageIcon
                  size={32}
                  className="mb-2 text-gray-400 dark:text-gray-500"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Seret & lepas gambar di sini
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  atau klik untuk memilih file
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  JPG, PNG, WebP (maks. 5MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Category */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                if (e.target.value === "__add_new__") {
                  setShowCategoryManager(true);
                } else {
                  setCategoryId(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__add_new__">+ Tambah Baru...</option>
            </select>
            <button
              type="button"
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              <Plus size={12} />
              Kelola Kategori
            </button>
          </div>

          {/* Status */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Dipublikasikan</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>

          {/* Published At */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tanggal Publikasi
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Kosongkan untuk publikasi langsung
            </p>
          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      <ArticleCategoryManager
        isOpen={showCategoryManager}
        onClose={() => {
          setShowCategoryManager(false);
          fetchCategories(); // Refresh categories when modal closes
        }}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
};

export default ArticleForm;
