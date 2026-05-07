import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Save,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Tag,
  Type,
  Image as ImageIcon,
  ExternalLink,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminAPI } from "../../services/admin/adminApi";

const AdminSeoPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editedPages, setEditedPages] = useState({});

  const fetchSeoPages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSeoPages();
      setPages(response.data.data);
      // Initialize edited state with empty objects
      const initialEdited = {};
      response.data.data.forEach((page) => {
        initialEdited[page.id] = { ...page };
      });
      setEditedPages(initialEdited);
    } catch (err) {
      toast.error("Gagal memuat data SEO halaman");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeoPages();
  }, [fetchSeoPages]);

  const handleInputChange = (id, field, value) => {
    setEditedPages((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const isPageChanged = (id) => {
    const original = pages.find((p) => p.id === id);
    if (!original) return false;
    const edited = editedPages[id];

    return (
      original.title !== edited.title ||
      original.meta_description !== edited.meta_description ||
      original.meta_keywords !== edited.meta_keywords ||
      original.og_title !== edited.og_title ||
      original.og_description !== edited.og_description ||
      original.og_image !== edited.og_image
    );
  };

  const handleSavePage = async (id) => {
    setSaving(true);
    try {
      const payload = editedPages[id];
      await adminAPI.updateSeoPage(id, payload);
      toast.success(`SEO ${payload.page_name} berhasil disimpan`);
      // Update the local "original" state
      setPages((prev) => prev.map((p) => (p.id === id ? { ...payload } : p)));
    } catch (err) {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async () => {
    const changedPages = pages
      .filter((p) => isPageChanged(p.id))
      .map((p) => editedPages[p.id]);

    if (changedPages.length === 0) return;

    setSaving(true);
    try {
      await adminAPI.bulkUpdateSeoPages(changedPages);
      toast.success(`${changedPages.length} halaman SEO berhasil diperbarui`);
      setPages((prev) =>
        prev.map((p) => {
          const updated = changedPages.find((up) => up.id === p.id);
          return updated ? { ...updated } : p;
        })
      );
    } catch (err) {
      toast.error("Gagal melakukan pembaruan massal");
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="text-green-600 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Memuat data SEO...</p>
      </div>
    );
  }

  const overallChangedCount = pages.filter((p) => isPageChanged(p.id)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Search size={24} className="text-green-600" />
            Kelola SEO & Metadata
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Optimalkan visibilitas pencarian untuk setiap halaman publik
          </p>
        </div>
        <div className="flex items-center gap-3">
          {overallChangedCount > 0 && (
            <button
              onClick={handleBulkSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-sm shadow-green-200 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Simpan {overallChangedCount} Perubahan
            </button>
          )}
        </div>
      </div>

      {overallChangedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm animate-in slide-in-from-top-4 duration-300">
          <AlertCircle size={20} className="shrink-0" />
          <p>
            Anda memiliki <strong>{overallChangedCount} halaman</strong> dengan perubahan yang belum disimpan.
          </p>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-4">
        {pages.map((page) => {
          const isExpanded = expandedId === page.id;
          const hasChanges = isPageChanged(page.id);
          const edited = editedPages[page.id];

          return (
            <div
              key={page.id}
              className={`
                group bg-white dark:bg-gray-800 border rounded-2xl transition-all duration-300 overflow-hidden
                ${isExpanded ? "border-green-200 ring-4 ring-green-50 shadow-lg" : "border-gray-200 hover:border-green-200"}
                ${hasChanges && !isExpanded ? "border-amber-200 bg-amber-50/30" : ""}
              `}
            >
              {/* Card Header (Clickable) */}
              <div
                onClick={() => toggleExpand(page.id)}
                className="px-6 py-5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${isExpanded ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                      {page.page_name}
                      <span className="text-xs font-mono text-gray-400 font-normal px-2 py-0.5 bg-gray-50 rounded border">
                        /{page.page_identifier}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {edited.title || "Belum ada judul halaman"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {hasChanges && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                      <AlertCircle size={12} />
                      Belum Disimpan
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Card Body (Expanded) */}
              {isExpanded && (
                <div className="px-6 pb-8 pt-2 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    {/* Form Fields */}
                    <div className="space-y-5">
                      {/* Page Title */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Type size={16} className="text-gray-400" />
                          Title Tag
                        </label>
                        <input
                          type="text"
                          value={edited.title || ""}
                          onChange={(e) => handleInputChange(page.id, "title", e.target.value)}
                          placeholder="Masukkan judul halaman..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                        <p className="text-[11px] text-gray-400 flex justify-between">
                          <span>Judul yang muncul di tab browser dan hasil pencarian.</span>
                          <span className={`${edited.title?.length > 60 ? "text-red-500" : ""}`}>
                            {edited.title?.length || 0}/60 karakter disarankan
                          </span>
                        </p>
                      </div>

                      {/* Meta Description */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Info size={16} className="text-gray-400" />
                          Meta Description
                        </label>
                        <textarea
                          rows={3}
                          value={edited.meta_description || ""}
                          onChange={(e) => handleInputChange(page.id, "meta_description", e.target.value)}
                          placeholder="Deskripsi singkat halaman untuk hasil pencarian..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                        />
                        <p className="text-[11px] text-gray-400 flex justify-between">
                          <span>Ringkasan konten halaman.</span>
                          <span className={`${edited.meta_description?.length > 160 ? "text-red-500" : ""}`}>
                            {edited.meta_description?.length || 0}/160 karakter disarankan
                          </span>
                        </p>
                      </div>

                      {/* Meta Keywords */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Tag size={16} className="text-gray-400" />
                          Keywords (Pisahkan dengan koma)
                        </label>
                        <input
                          type="text"
                          value={edited.meta_keywords || ""}
                          onChange={(e) => handleInputChange(page.id, "meta_keywords", e.target.value)}
                          placeholder="Contoh: bisnis, keuangan, investasi..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                      </div>

                      <hr className="border-gray-100 my-6" />

                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        Open Graph (Sosial Media)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">OG Title</label>
                          <input
                            type="text"
                            value={edited.og_title || ""}
                            onChange={(e) => handleInputChange(page.id, "og_title", e.target.value)}
                            placeholder={edited.title || "Gunakan Page Title"}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <ImageIcon size={16} className="text-gray-400" />
                            OG Image URL
                          </label>
                          <input
                            type="text"
                            value={edited.og_image || ""}
                            onChange={(e) => handleInputChange(page.id, "og_image", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-8">
                        {hasChanges && (
                          <button
                            onClick={() => handleSavePage(page.id)}
                            disabled={saving}
                            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium flex items-center gap-2"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Simpan Perubahan
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-6">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Search size={16} className="text-blue-600" />
                            Google Search Preview
                          </h4>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Desktop</span>
                        </div>

                        {/* Google Result Mockup */}
                        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-1">
                          <div className="flex items-center gap-2 text-[12px] text-gray-600 mb-1">
                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">G</div>
                            <span>strategix.grapadikonsultan.co.id › {page.page_identifier}</span>
                          </div>
                          <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
                            {edited.title || "Judul Halaman Akan Muncul Di Sini"}
                          </h3>
                          <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2">
                            {edited.meta_description || "Tambahkan meta description untuk melihat bagaimana ringkasan halaman ini akan tampil di hasil pencarian Google bagi para pengguna."}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400 p-3 bg-white/50 rounded-lg border border-dashed border-gray-200">
                          <Info size={14} />
                          <span>Tampilan ini adalah simulasi dan mungkin berbeda di mesin pencari asli.</span>
                        </div>
                      </div>

                      {/* SEO Tips */}
                      <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100 space-y-3">
                        <h4 className="text-sm font-bold text-green-800 flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          SEO Checklist
                        </h4>
                        <ul className="space-y-2 text-xs text-green-700">
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                            Gunakan kata kunci utama di awal Title Tag.
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                            Buat deskripsi yang mengundang klik (Call to Action).
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                            Pastikan OG Image berukuran 1200x630 pixels.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-dashed rounded-3xl text-gray-500">
          <Search size={40} className="mb-4 opacity-20" />
          <p>Belum ada halaman yang didaftarkan untuk SEO.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSeoPages;
