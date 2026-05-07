import React, { useState, useEffect } from "react";
import { Link2, Copy, Check, Loader, Edit2, Power, ExternalLink } from "lucide-react";
import { affiliateLinkApi } from "../../services/Affiliate/affiliateApi";
import { toast } from "react-toastify";

const AffiliateLink = () => {
  const [affiliateLink, setAffiliateLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAffiliateLink();
  }, []);

  const fetchAffiliateLink = async () => {
    try {
      setLoading(true);
      const response = await affiliateLinkApi.getMyLink();
      if (response.data && response.data.success) {
        setAffiliateLink(response.data.data);
        setNewSlug(response.data.data.slug);
      }
    } catch (error) {
      console.error("Error fetching affiliate link:", error);
      toast.error("Gagal memuat link affiliate");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlug = async () => {
    if (!newSlug.trim()) {
      toast.warning("Slug tidak boleh kosong");
      return;
    }

    if (newSlug === affiliateLink.slug) {
      toast.info("Slug belum berubah");
      setEditMode(false);
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await affiliateLinkApi.updateSlug(newSlug);
      if (response.data && response.data.success) {
        setAffiliateLink({
          ...affiliateLink,
          slug: response.data.data.slug,
          change_count: response.data.data.change_count,
          is_custom: true,
        });
        setEditMode(false);
        toast.success(response.data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal mengubah slug";
      toast.error(errorMsg);
      console.error("Error updating slug:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setSubmitLoading(true);
      const response = await affiliateLinkApi.toggleActive(affiliateLink.id);
      if (response.data && response.data.success) {
        setAffiliateLink({
          ...affiliateLink,
          is_active: response.data.data.is_active,
        });
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Gagal mengubah status link");
      console.error("Error toggling active:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (affiliateLink?.full_url) {
      navigator.clipboard.writeText(affiliateLink.full_url);
      setCopied(true);
      toast.success("Link disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-green-600 animate-spin mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Memuat link affiliate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link2 className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Link Affiliate Anda
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola dan bagikan link affiliate untuk mempromosikan bisnis Anda
          </p>
        </div>
      </div>

      {/* Main Link Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8">
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${affiliateLink?.is_active
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
            >
              <Power size={16} />
              {affiliateLink?.is_active ? "Aktif" : "Nonaktif"}
            </div>
            <button
              onClick={handleToggleActive}
              disabled={submitLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${affiliateLink?.is_active
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                }`}
            >
              {submitLoading ? "Memproses..." : affiliateLink?.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>

          {/* Link Display */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              URL Affiliate Anda
            </label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <code className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                  {affiliateLink?.full_url}
                </code>
              </div>
              <button
                onClick={() => window.open(affiliateLink?.full_url, '_blank')}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
                title="Buka link di tab baru"
              >
                <ExternalLink size={18} />
                Buka Tab Baru
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Disalin" : "Salin"}
              </button>
            </div>
          </div>

          {/* Slug Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Slug Asli (Original)
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <code className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {affiliateLink?.original_slug}
                </code>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Slug Saat Ini
                {affiliateLink?.is_custom && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                    Custom
                  </span>
                )}
              </label>
              {editMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                    placeholder="Masukkan slug baru"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={submitLoading}
                  />
                  <button
                    onClick={handleUpdateSlug}
                    disabled={submitLoading}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    {submitLoading ? "Simpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setNewSlug(affiliateLink?.slug);
                    }}
                    disabled={submitLoading}
                    className="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <code className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {affiliateLink?.slug}
                  </code>
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-2 rounded-lg transition-colors duration-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Ubah slug"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Limit Info */}



        </div>
      </div>

      {/* Information Card */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400 mb-4">
          💡 Cara Menggunakan Link Affiliate
        </h3>
        <li>
          ✅ Salin URL affiliate Anda dan bagikan di media sosial, WhatsApp, email, atau platform lainnya
        </li>
        <li>✅ Setiap user yang mendaftar melalui link ini akan terhubung dengan akun Anda</li>
        <li>✅ Dapatkan komisi dari setiap transaksi yang mereka lakukan</li>
      </div>
    </div>
  );
};

export default AffiliateLink;
