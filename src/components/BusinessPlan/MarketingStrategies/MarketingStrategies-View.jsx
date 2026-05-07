import { Edit3, Building, Calendar, Tag } from "lucide-react";
import { useState } from "react";

const MarketingStrategiesView = ({ strategy, onBack, onEdit }) => {
  // Early return jika strategy undefined
  if (!strategy) {
    return (
      <div className="space-y-6 text-center py-12">
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Data tidak ditemukan
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Strategi pemasaran yang Anda cari tidak ditemukan
        </p>
        <button
          onClick={onBack}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  // Helper untuk business info
  const getBusinessInfo = () => {
    console.log(strategy.business_background.name);

    if (!strategy.business_background) {
      return {
        name: `Bisnis (ID: ${strategy.business_background.name})`,
        category: "Tidak ada kategori",
      };
    }
    return {
      name: strategy.business_background.name,
      category: strategy.business_background.category || "Tidak ada kategori",
    };
  };

  const businessInfo = getBusinessInfo();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detail Strategi Pemasaran
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lihat detail lengkap strategi pemasaran
          </p>
        </div>
        <button
          onClick={() => onEdit(strategy)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Edit3 size={16} />
          Edit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
        {/* Informasi Bisnis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building size={20} />
            Bisnis Terkait
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nama Bisnis
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {businessInfo.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kategori
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {businessInfo.category}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategi Promosi */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag size={20} />
            Strategi Promosi
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
              {strategy.promotion_strategy || "Tidak ada strategi promosi"}
            </p>
          </div>
        </div>

        {/* Media yang Digunakan */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Media yang Digunakan
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white">
              {strategy.media_used || "-"}
            </p>
          </div>
        </div>

        {/* Strategi Harga */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Strategi Harga
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white">
              {strategy.pricing_strategy || "-"}
            </p>
          </div>
        </div>

        {/* Target Bulanan */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Target Bulanan
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white">
              {strategy.monthly_target || "-"}
            </p>
          </div>
        </div>

        {/* Rencana Kolaborasi */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Rencana Kolaborasi
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
              {strategy.collaboration_plan || "-"}
            </p>
          </div>
        </div>

        {/* Informasi Metadata */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informasi Lainnya
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Dibuat Pada</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {strategy.created_at
                    ? `${new Date(strategy.created_at).toLocaleDateString(
                        "id-ID"
                      )} ${new Date(strategy.created_at).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" }
                      )}`
                    : "Tidak tersedia"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Diperbarui Pada
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {strategy.updated_at
                    ? `${new Date(strategy.updated_at).toLocaleDateString(
                        "id-ID"
                      )} ${new Date(strategy.updated_at).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" }
                      )}`
                    : "Tidak tersedia"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {strategy.status || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium"
          >
            Kembali ke Daftar
          </button>
          <button
            type="button"
            onClick={() => onEdit(strategy)}
            className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Edit3 size={16} />
            Edit Strategi
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketingStrategiesView;
