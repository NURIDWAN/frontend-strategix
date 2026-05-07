import {
  Building,
  Loader,
  Target,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const MarketingStrategiesForm = ({
  title,
  subtitle,
  formData,
  businesses,
  isLoadingBusinesses,
  isLoading,
  onInputChange,
  onSubmit,
  onBack,
  submitButtonText,
  submitButtonIcon,
  mode = "create",
  existingStrategy,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Pilih Bisnis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih Bisnis *
            </label>
            {isLoadingBusinesses ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader className="animate-spin h-4 w-4" />
                <span>Memuat data bisnis...</span>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Belum ada data bisnis. Silakan buat latar belakang bisnis
                  terlebih dahulu.
                </p>
              </div>
            ) : (
              <select
                name="business_background_id"
                value={formData.business_background_id}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Pilih Bisnis</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.business_name || business.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Strategi Promosi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Strategi Promosi *
            </label>
            <textarea
              name="promotion_strategy"
              value={formData.promotion_strategy}
              onChange={onInputChange}
              rows={3}
              placeholder="Contoh: Meningkatkan brand awareness dan penjualan online"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                            dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Media / Promosi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Media / Promosi yang Digunakan *
            </label>
            <textarea
              name="media_used"
              value={formData.media_used}
              onChange={onInputChange}
              rows={3}
              placeholder="Contoh: Instagram Ads, TikTok, event lokal, brosur, influencer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                            dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Strategi Penetapan Harga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Strategi Penetapan Harga *
            </label>
            <div className="relative">
              <Users
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
              <textarea
                name="pricing_strategy"
                value={formData.pricing_strategy}
                onChange={onInputChange}
                rows={3}
                placeholder="Contoh: Diskon 10% untuk pembelian awal"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Target Bulanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Bulanan (Opsional)
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="number"
                name="monthly_target"
                value={formData.monthly_target}
                onChange={onInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Rencana Kolaborasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rencana Kolaborasi
            </label>
            <div className="relative">
              <BarChart3
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
              <textarea
                name="collaboration_plan"
                value={formData.collaboration_plan}
                onChange={onInputChange}
                rows={3}
                placeholder="Contoh: Partnership dengan hotel sekitar dan event organizer"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Timeline */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeline Pelaksanaan
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
              <textarea
                name="timeline"
                value={formData.timeline}
                onChange={onInputChange}
                rows={3}
                placeholder="Contoh: Januari–Maret 2025 untuk kampanye digital"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div> */}

          {/* Tombol Aksi */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                            rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isLoading || isLoadingBusinesses || businesses.length === 0
              }
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors 
                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  {submitButtonIcon}
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MarketingStrategiesForm;
