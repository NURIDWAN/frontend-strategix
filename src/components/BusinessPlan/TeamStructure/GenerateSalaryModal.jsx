import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Users, AlertCircle, CheckCircle } from "lucide-react";
import { teamStructureApi } from "../../../services/businessPlan";
import { toast } from "react-toastify";

const GenerateSalaryModal = ({ isOpen, onClose, businessBackgroundId, userId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [existingSalary, setExistingSalary] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  useEffect(() => {
    if (isOpen && businessBackgroundId && userId) {
      fetchSalarySummary();
    }
  }, [isOpen, businessBackgroundId, userId]);

  useEffect(() => {
    if (isOpen && businessBackgroundId && userId) {
      checkExistingSalary();
    }
  }, [selectedMonth, selectedYear, isOpen]);

  const fetchSalarySummary = async () => {
    try {
      setIsFetchingSummary(true);
      setSummaryError(null);

      const response = await teamStructureApi.getSalarySummary({
        user_id: userId,
        business_background_id: businessBackgroundId,
      });

      console.log("Salary Summary Response:", response.data);

      if (response.data.status === "success") {
        setSummary(response.data.data);
      } else {
        setSummaryError(response.data.message || "Gagal memuat ringkasan gaji");
        toast.error(response.data.message || "Gagal memuat ringkasan gaji");
      }
    } catch (error) {
      console.error("Error fetching salary summary:", error);
      const errorMessage = error.response?.data?.message || "Gagal memuat ringkasan gaji";
      setSummaryError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsFetchingSummary(false);
    }
  };

  const checkExistingSalary = async () => {
    try {
      setIsChecking(true);
      const response = await teamStructureApi.checkExistingSalary({
        user_id: userId,
        business_background_id: businessBackgroundId,
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.data.status === "success") {
        setExistingSalary(response.data.data);
      }
    } catch (error) {
      console.error("Error checking existing salary:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGenerate = async () => {
    // Show confirmation if data already exists
    if (existingSalary && existingSalary.exists) {
      const monthName = months.find((m) => m.value === selectedMonth)?.label;
      const confirmed = window.confirm(
        `Data gaji untuk ${monthName} ${selectedYear} sudah ada (Rp ${formatCurrency(existingSalary.amount)}).\n\nApakah Anda ingin memperbarui dengan data terbaru (Rp ${formatCurrency(summary?.total_salary || 0)})?`
      );

      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await teamStructureApi.generateSalary({
        user_id: userId,
        business_background_id: businessBackgroundId,
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.data.status === "success") {
        toast.success(response.data.message);
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Gagal generate gaji");
      }
    } catch (error) {
      console.error("Error generating salary:", error);
      toast.error(error.response?.data?.message || "Gagal generate gaji karyawan");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return "0";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0";
    return Math.round(numValue)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Gaji Karyawan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate data pengeluaran gaji ke keuangan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {isFetchingSummary && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Memuat data gaji...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {summaryError && !isFetchingSummary && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Gagal Memuat Data</h3>
                  <p className="text-xs text-red-700 dark:text-red-300">{summaryError}</p>
                  <button onClick={fetchSalarySummary} className="mt-3 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Card */}
          {summary && !isFetchingSummary && (
            <div className="p-4 border border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 mt-1 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <h3 className="mb-3 text-sm font-semibold text-green-900 dark:text-green-100">Ringkasan Tim Aktif</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-xs text-green-700 dark:text-green-300">Total Karyawan Aktif</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.total_members}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">orang</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-green-700 dark:text-green-300">Total Gaji per Bulan</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">Rp {formatCurrency(summary.total_salary)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Breakdown */}
              {summary.members && summary.members.length > 0 && (
                <div className="pt-4 mt-4 border-t border-green-200 dark:border-green-800">
                  <p className="mb-2 text-xs font-semibold text-green-900 dark:text-green-100">Detail Karyawan:</p>
                  <div className="space-y-2 overflow-y-auto max-h-40">
                    {summary.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 text-xs rounded bg-white/50 dark:bg-gray-800/50">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">• {member.position}</span>
                        </div>
                        <span className="font-semibold text-green-700 dark:text-green-300">Rp {formatCurrency(member.salary)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Month & Year Selection */}
          <div>
            <label className="flex items-center block gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar size={18} />
              Pilih Periode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs text-gray-600 dark:text-gray-400">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-600 dark:text-gray-400">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Existing Data Warning */}
          {isChecking ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-b-2 border-gray-500 rounded-full animate-spin"></div>
              <span>Memeriksa data existing...</span>
            </div>
          ) : existingSalary && existingSalary.exists ? (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="mb-1 text-sm font-semibold text-yellow-900 dark:text-yellow-100">Data Sudah Ada</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Data gaji untuk periode ini sudah ada sebesar <strong>Rp {formatCurrency(existingSalary.amount)}</strong>. Jika melanjutkan, data akan diperbarui dengan nilai baru.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Belum ada data gaji untuk periode ini. Data baru akan dibuat.</p>
                </div>
              </div>
            </div>
          )}

          {/* No Members Warning */}
          {summary && summary.total_members === 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-red-900 dark:text-red-100">Tidak Ada Karyawan Aktif</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">Tidak ada karyawan dengan status aktif dan gaji yang perlu di-generate.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || (summary && summary.total_members === 0)}
            className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <DollarSign size={18} />
                <span>Generate Gaji</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateSalaryModal;
