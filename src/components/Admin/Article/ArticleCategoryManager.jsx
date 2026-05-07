import { useState, useEffect } from "react";
import { articleAPI } from "../../../services/admin/articleApi";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";

const ArticleCategoryManager = ({ isOpen, onClose, onCategoryCreated }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await articleAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      if (editingId) {
        await articleAPI.updateCategory(editingId, form);
        toast.success("Kategori berhasil diperbarui");
      } else {
        const response = await articleAPI.createCategory(form);
        toast.success("Kategori berhasil dibuat");
        onCategoryCreated?.(response.data.data);
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      setIsAdding(false);
      fetchCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal menyimpan kategori"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || "" });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      await articleAPI.deleteCategory(id);
      toast.success("Kategori berhasil dihapus");
      fetchCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal menghapus kategori"
      );
    }
  };

  const cancelForm = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
    setIsAdding(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl dark:bg-gray-800 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Kelola Kategori Artikel
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          {/* Add/Edit Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="p-4 mb-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: Teknologi"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deskripsi (opsional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Deskripsi kategori..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {editingId ? "Perbarui" : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30 w-full justify-center"
            >
              <Plus size={16} />
              Tambah Kategori Baru
            </button>
          )}

          {/* Category List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-600 rounded-full animate-spin border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <p className="py-8 text-sm text-center text-gray-500 dark:text-gray-400">
              Belum ada kategori
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {cat.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {cat.articles_count || 0} artikel
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleCategoryManager;
