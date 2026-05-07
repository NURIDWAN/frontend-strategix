import { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Wallet, Eye, Trash2, RefreshCw, X, BarChart3, Target, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { managementFinancialApi } from "../../../services/managementFinancial";
import SummaryChart from "./SummaryChart";

const SummaryList = ({ summaries, onView, onDelete, onCreateNew, selectedYear, selectedMonth, onYearChange, onMonthChange, onBack, isLoading, error, onRetry, selectedBusiness }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [summaryToDelete, setSummaryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [selectedYear, summaries, selectedBusiness]);

  const fetchStatistics = async () => {
    if (!selectedBusiness) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user.id,
        business_id: selectedBusiness.id,
        year: selectedYear,
      };

      const response = await managementFinancialApi.summaries.getStatistics(params);
      if (response.data.status === "success") {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleDeleteClick = (summaryId, summaryPeriod) => {
    setSummaryToDelete({ id: summaryId, period: summaryPeriod });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!summaryToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(summaryToDelete.id);
      toast.success("Ringkasan keuangan berhasil dihapus!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error in SummaryList delete:", error);
      toast.error("Gagal menghapus ringkasan keuangan!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSummaryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSummaryToDelete(null);
  };

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

  const calculateProfitMargin = (income, profit) => {
    if (!income || income === 0) return 0;
    return ((profit / income) * 100).toFixed(1);
  };

  // Calculate stats
  const totalIncome = statistics?.total_annual_income || 0;
  const totalExpense = statistics?.total_annual_expense || 0;
  const totalGrossProfit = statistics?.total_annual_gross_profit || 0;
  const totalProfit = statistics?.total_annual_net_profit || 0;
  const avgMonthlyIncome = statistics?.avg_monthly_income || 0;
  const currentCashPosition = statistics?.current_cash_position || 0;
  const totalMonths = statistics?.total_months || 0;

  // Get current month summary based on selectedMonth
  const currentMonthSummary = selectedMonth ? summaries.find((summary) => summary.month === selectedMonth && summary.year === selectedYear) : null;

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ringkasan Keuangan Bulanan</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola semua ringkasan keuangan bulanan</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-b-2 border-green-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal Konfirmasi Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Konfirmasi Hapus</h3>
              <button onClick={handleCancelDelete} className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full shadow-md dark:bg-red-900/20">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="mb-2 text-gray-600 dark:text-gray-400">Apakah Anda yakin ingin menghapus ringkasan keuangan ini?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white">"{summaryToDelete?.period}"</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Batal
              </button>
              <button onClick={handleConfirmDelete} disabled={isDeleting} className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
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

      {/* HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <button onClick={onBack} className="flex items-center gap-2 mb-3 text-gray-600 transition-colors dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">Ringkasan Keuangan Bulanan</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola semua ringkasan keuangan bulanan - Tahun {selectedYear}</p>
          </div>
        </div>
        <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto sm:items-center">
          <select
            value={selectedMonth || ""}
            onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-3 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Bulan</option>
            <option value={1}>Januari</option>
            <option value={2}>Februari</option>
            <option value={3}>Maret</option>
            <option value={4}>April</option>
            <option value={5}>Mei</option>
            <option value={6}>Juni</option>
            <option value={7}>Juli</option>
            <option value={8}>Agustus</option>
            <option value={9}>September</option>
            <option value={10}>Oktober</option>
            <option value={11}>November</option>
            <option value={12}>Desember</option>
          </select>
        </div>
      </div>

      {/* QUICK STATS GRID - 6 cards in 2 rows */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Pendapatan */}
        <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedYear} • {totalMonths} bulan
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/20">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengeluaran</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedYear} • {totalMonths} bulan
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg dark:bg-red-900/20">
              <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Kotor</p>
              <p className={`text-2xl font-bold mt-1 ${totalGrossProfit >= 0 ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(totalGrossProfit)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedYear} • {totalMonths} bulan
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg dark:bg-teal-900/20">
              <Target className="text-teal-600 dark:text-teal-400" size={24} />
            </div>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Bersih</p>
              <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(totalProfit)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedYear} • {totalMonths} bulan
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Cash Position */}
        <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Position</p>
              <p className={`text-2xl font-bold mt-1 ${currentCashPosition >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(currentCashPosition)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Posisi Kas Terkini</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
              <Wallet className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
          </div>
        </div>

        {/* Rata-rata Bulanan */}
        <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata/Bulan</p>
              <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(avgMonthlyIncome)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pendapatan</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg dark:bg-purple-900/20">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT MONTH HIGHLIGHT */}
      {currentMonthSummary && (
        <div className="p-6 border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl dark:border-green-700">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <Calendar className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ringkasan Bulan Ini</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getMonthName(currentMonthSummary.month)} {currentMonthSummary.year}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendapatan</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(currentMonthSummary.total_income)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pengeluaran</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(currentMonthSummary.total_expense)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Laba</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(currentMonthSummary.net_profit)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kas</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(currentMonthSummary.cash_position)}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => onView(currentMonthSummary)}
              className="flex items-center gap-2 px-4 py-2 text-green-600 transition-colors bg-white border border-green-200 rounded-lg dark:bg-gray-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-700"
            >
              <Eye size={16} />
              Detail
            </button>
          </div>
        </div>
      )}

      {/* CHART - Grafik Pendapatan vs Pengeluaran */}
      <SummaryChart selectedYear={selectedYear} />

      {/* LIST RINGKASAN */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Ringkasan Bulanan ({summaries.length} bulan)</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Semua ringkasan keuangan untuk tahun {selectedYear}</p>
        </div>

        {summaries.length === 0 ? (
          <div className="py-12 text-center">
            <Wallet size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Belum ada data ringkasan</h4>
            <p className="max-w-md mx-auto mb-6 text-gray-600 dark:text-gray-400">Mulai dengan menambahkan ringkasan keuangan pertama Anda untuk tahun {selectedYear}</p>
            <button onClick={onCreateNew} className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">
              <Plus size={20} />
              Tambah Ringkasan Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase dark:text-gray-300">Periode</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase dark:text-gray-300">Pendapatan</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase dark:text-gray-300">Pengeluaran</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase dark:text-gray-300">Laba Bersih</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase dark:text-gray-300">Posisi Kas</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase dark:text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {summaries.map((summary) => (
                  <tr key={summary.id} className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getMonthName(summary.month)} {summary.year}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Margin: {calculateProfitMargin(summary.total_income, summary.net_profit)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-green-600 dark:text-green-400">{formatCurrency(summary.total_income)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-red-600 dark:text-red-400">{formatCurrency(summary.total_expense)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${summary.net_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(summary.net_profit)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(summary.cash_position)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => onView(summary)} className="flex items-center justify-center p-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700" title="Lihat Detail">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(summary.id, `${getMonthName(summary.month)} ${summary.year}`)}
                          className="flex items-center justify-center p-2 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUMMARY FOOTER */}
      {summaries.length > 0 && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Records</span>
              <span className="font-semibold text-gray-900 dark:text-white">{summaries.length} bulan</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tahun</span>
              <span className="font-semibold text-gray-900 dark:text-white">{selectedYear}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Bulan Tercatat</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {Array.from(new Set(summaries.map((s) => s.month)))
                  .sort((a, b) => a - b)
                  .map((month) => {
                    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    return monthNames[month - 1];
                  })
                  .join(", ")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
              <span className="font-semibold text-green-600 dark:text-green-400">Aktif</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryList;
