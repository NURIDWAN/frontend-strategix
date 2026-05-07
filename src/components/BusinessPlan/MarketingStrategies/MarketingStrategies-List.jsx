import {
  Lightbulb,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Loader,
  RefreshCw,
  X,
  Building,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const MarketingStrategiesList = ({
  strategies,
  onView,
  onEdit,
  onDelete,
  onCreateNew,
  isLoading,
  error,
  onRetry,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("all");

  const handleDeleteClick = (strategyId, strategyName) => {
    setStrategyToDelete({ id: strategyId, name: strategyName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!strategyToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(strategyToDelete.id);
    } catch (error) {
      toast.error("Gagal menghapus strategi pemasaran!");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setStrategyToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStrategyToDelete(null);
  };

  // Normalisasi data supaya selalu array
  const strategiesArray = Array.isArray(strategies)
    ? strategies
    : strategies
    ? [strategies]
    : [];

  // Ambil bisnis unik
  const getUniqueBusinesses = () => {
    const businesses = strategiesArray
      .filter((strategy) => strategy.business_background)
      .map((strategy) => ({
        id: strategy.business_background.id,
        name: strategy.business_background.name,
        category: strategy.business_background.category,
      }));
    return businesses.filter(
      (b, i, arr) => i === arr.findIndex((x) => x.id === b.id)
    );
  };

  const uniqueBusinesses = getUniqueBusinesses();

  // Filter berdasarkan bisnis
  const filteredStrategies =
    selectedBusiness === "all"
      ? strategiesArray
      : strategiesArray.filter(
          (s) => s.business_background?.id === selectedBusiness
        );

  const getStatusBadge = (status) => {
    const config = {
      draft: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        label: "Draft",
      },
      planned: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        label: "Direncanakan",
      },
      active: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        label: "Aktif",
      },
      completed: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        label: "Selesai",
      },
    };
    return config[status] || config.draft;
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader className="animate-spin h-8 w-8 text-green-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Memuat strategi pemasaran...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Gagal Memuat Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mx-auto"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Konfirmasi Hapus
              </h3>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="text-red-600" size={22} />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Apakah Anda yakin ingin menghapus strategi ini?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>"{strategyToDelete?.name}"</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Strategi Pemasaran
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola daftar strategi pemasaran untuk bisnis Anda
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Strategi
        </button>
      </div>

      {/* Filter */}
      {uniqueBusinesses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Building size={16} />
              Filter Berdasarkan Bisnis:
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Tombol Semua Bisnis */}
            <button
              onClick={() => setSelectedBusiness("all")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                selectedBusiness === "all"
                  ? "bg-green-500 border-green-500 text-white shadow-sm"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Building size={14} />
              <span>Semua Bisnis</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedBusiness === "all" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}>
                {strategiesArray.length}
              </span>
            </button>

            {/* Tombol untuk setiap bisnis */}
            {uniqueBusinesses.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBusiness(b.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                  selectedBusiness === b.id
                    ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Building size={14} />
                <div className="text-left">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs opacity-80 hidden sm:block">{b.category}</div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedBusiness === b.id 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}>
                  {strategiesArray.filter(s => s.business_background?.id === b.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Info */}
          {selectedBusiness !== "all" && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                <Building size={16} />
                <span>
                  Menampilkan {filteredStrategies.length} dari {strategiesArray.length} strategi
                  {selectedBusiness !== "all" && (
                    <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {filteredStrategies.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Belum ada strategi pemasaran
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tambahkan strategi pertama Anda untuk memulai
          </p>
          <button
            onClick={onCreateNew}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Tambah Strategi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy) => {
            const statusBadge = getStatusBadge(strategy.status);
            const business = strategy.business_background || {};
            return (
              <div
                key={strategy.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg flex items-center justify-center border border-yellow-200 dark:border-yellow-800">
                      <Lightbulb size={24} className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {business.name || "Strategi Pemasaran"}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {strategy.promotion_strategy ||
                    "Tidak ada deskripsi strategi"}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div>
                    <Building size={12} className="inline mr-1" />{" "}
                    {business.category || "Tidak ada kategori"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onView(strategy)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> Lihat
                  </button>
                  <button
                    onClick={() => onEdit(strategy)}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded text-sm hover:bg-yellow-700 flex items-center justify-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteClick(strategy.id, business.name)
                    }
                    className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketingStrategiesList;
