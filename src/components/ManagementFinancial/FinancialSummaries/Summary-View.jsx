import { Calendar, TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3, FileText, Edit3 } from "lucide-react";

const SummaryView = ({ summary, onBack, onEdit }) => {
  if (!summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (monthNumber) => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[monthNumber - 1];
  };

  const calculateProfitMargin = () => {
    if (!summary.total_income || summary.total_income === 0) return 0;
    return ((summary.net_profit / summary.total_income) * 100).toFixed(1);
  };

  const profitMargin = calculateProfitMargin();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-2">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Ringkasan Keuangan</h1>
            <p className="text-gray-600 dark:text-gray-400">Lihat informasi lengkap ringkasan keuangan (Read-only)</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
        {/* Header dengan Periode */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getMonthName(summary.month)} {summary.year}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Ringkasan Keuangan Bulanan</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${summary.net_profit >= 0 ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"}`}>
            {summary.net_profit >= 0 ? "Profit" : "Loss"}: {formatCurrency(summary.net_profit)}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Pendapatan */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Pendapatan</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-200">{formatCurrency(summary.total_income)}</p>
              </div>
            </div>
          </div>

          {/* Total Pengeluaran */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-200">{formatCurrency(summary.total_expense)}</p>
              </div>
            </div>
          </div>

          {/* Laba Kotor */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Laba Kotor</p>
                <p className={`text-xl font-bold ${summary.gross_profit >= 0 ? "text-blue-900 dark:text-blue-200" : "text-red-900 dark:text-red-200"}`}>{formatCurrency(summary.gross_profit)}</p>
              </div>
            </div>
          </div>

          {/* Posisi Kas */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Posisi Kas</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-200">{formatCurrency(summary.cash_position)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Metrics */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} />
              Metrik Keuangan
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Laba Bersih</span>
                <span className={`font-semibold ${summary.net_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(summary.net_profit)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Profit Margin</span>
                <span className={`font-semibold ${profitMargin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{profitMargin}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Rasio Pengeluaran</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summary.total_income > 0 ? ((summary.total_expense / summary.total_income) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Efisiensi</span>
                <span className={`font-semibold ${profitMargin >= 20 ? "text-green-600 dark:text-green-400" : profitMargin >= 10 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                  {profitMargin >= 20 ? "Tinggi" : profitMargin >= 10 ? "Sedang" : "Rendah"}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} />
              Informasi Tambahan
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dibuat Pada</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(summary.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diperbarui Pada</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(summary.updated_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {summary.notes && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Catatan</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">{summary.notes}</p>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Performa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status: </span>
              <span className={`font-medium ${summary.net_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{summary.net_profit >= 0 ? "Profit" : "Rugi"}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Health: </span>
              <span className={`font-medium ${profitMargin >= 20 ? "text-green-600 dark:text-green-400" : profitMargin >= 10 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                {profitMargin >= 20 ? "Sehat" : profitMargin >= 10 ? "Cukup" : "Perlu Perhatian"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onBack} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Kembali ke Dashboard
          </button>
          <button type="button" onClick={() => onEdit(summary)} className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
            <Edit3 size={16} />
            Edit Ringkasan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
