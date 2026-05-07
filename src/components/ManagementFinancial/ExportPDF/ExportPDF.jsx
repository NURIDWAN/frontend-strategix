import { useState, useEffect } from "react";
import { Download, ArrowLeft, Calendar, FileText, TrendingUp, AlertCircle, Check } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";

const ExportPDF = ({ onBack, selectedBusiness }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [periodType, setPeriodType] = useState("year"); // 'year' or 'month'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [initialInvestment, setInitialInvestment] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    generateAvailableYears();
  }, []);

  // Fetch initial investment from financial projections
  useEffect(() => {
    if (selectedBusiness?.id && user?.id) {
      fetchInitialInvestment();
    }
  }, [selectedBusiness, user]);

  const fetchInitialInvestment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/management-financial/projections`, {
        params: {
          user_id: user.id,
          business_background_id: selectedBusiness.id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success" && response.data.data.length > 0) {
        // Prioritize realistic scenario, then optimistic, then pessimistic
        const scenarios = response.data.data;
        const realistic = scenarios.find((p) => p.scenario_type === "realistic");
        const optimistic = scenarios.find((p) => p.scenario_type === "optimistic");
        const projection = realistic || optimistic || scenarios[0];

        setInitialInvestment(projection.initial_investment || 0);
      }
    } catch (error) {
      console.error("Error fetching initial investment:", error);
      // Fallback to business initial_capital if projection not found
      setInitialInvestment(selectedBusiness?.initial_capital || 0);
    }
  };

  // Generate list of available years (from 2020 to current year + 1)
  const generateAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      years.push(year);
    }
    setAvailableYears(years.reverse()); // Latest first
  };

  // Month names in Indonesian
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const handleGeneratePDF = async () => {
    if (!selectedBusiness) {
      toast.error("Silakan pilih bisnis terlebih dahulu");
      return;
    }

    if (!user || !user.id) {
      toast.error("User tidak terautentikasi. Silakan login kembali");
      return;
    }

    setLoading(true);

    try {
      // Build period value based on type
      let periodValue;
      if (periodType === "year") {
        periodValue = selectedYear.toString();
      } else {
        // Format: YYYY-MM
        periodValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      }

      // Prepare charts data (jika include charts = true)
      const charts = includeCharts
        ? {
            income_vs_expense: null, // Will be generated on backend
            monthly_trend: null,
            projection_comparison: null,
            category_income_pie: null,
            category_expense_pie: null,
          }
        : null;

      // Prepare request data
      const requestData = {
        user_id: parseInt(user.id),
        business_background_id: selectedBusiness.id,
        period_type: periodType,
        period_value: periodValue,
        charts: charts,
      };

      const response = await axios.post(`${apiUrl}/management-financial/pdf/generate`, requestData, {
        responseType: "blob", // Important for PDF download
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const businessName = selectedBusiness.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const periodLabel = periodType === "year" ? selectedYear : `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      const timestamp = new Date().toISOString().split("T")[0];

      link.setAttribute("download", `laporan-keuangan-${businessName}-${periodLabel}-${timestamp}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan PDF berhasil diunduh!");
    } catch (error) {
      console.error("Export PDF Error:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);

      if (error.response?.status === 404) {
        toast.error("Data keuangan tidak ditemukan untuk periode ini");
      } else if (error.response?.status === 422) {
        // Try to parse error message from blob
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          console.error("Validation Error Detail:", text);
          try {
            const errorData = JSON.parse(text);
            const errorMessages = Object.values(errorData.errors || {})
              .flat()
              .join(", ");
            toast.error(`Validasi gagal: ${errorMessages || errorData.message}`);
          } catch (e) {
            toast.error("Parameter tidak valid. Periksa kembali pilihan Anda");
          }
        } else {
          const errorMessages = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(", ") : error.response?.data?.message;
          toast.error(`Validasi gagal: ${errorMessages || "Parameter tidak valid"}`);
        }
      } else {
        toast.error(error.response?.data?.message || "Gagal mengunduh laporan PDF. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-600 transition-colors dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          <ArrowLeft className="text-xl" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
            <FileText className="text-2xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export PDF Laporan Keuangan</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedBusiness?.name || "Pilih bisnis untuk mengunduh laporan"}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        {!selectedBusiness ? (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-6xl text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-gray-500 dark:text-gray-400">Silakan pilih bisnis terlebih dahulu dari halaman utama</p>
          </div>
        ) : (
          <>
            {/* Info Business */}
            <div className="p-6 mb-6 border border-indigo-100 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800 rounded-xl">
              <h3 className="flex items-center gap-2 mb-4 font-semibold text-indigo-900 dark:text-indigo-100">
                <TrendingUp className="text-xl" />
                Informasi Bisnis
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Nama Bisnis:</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{selectedBusiness.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Jenis Usaha:</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{selectedBusiness.business_type || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Modal Awal:</span>
                  <p className="mt-1 font-semibold text-green-600 dark:text-green-400">Rp {initialInvestment ? new Intl.NumberFormat("id-ID").format(initialInvestment) : "0"}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{selectedBusiness.status || "Aktif"}</p>
                </div>
              </div>
            </div>{" "}
            {/* Period Selection */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white">
                <Calendar className="text-xl text-indigo-600 dark:text-indigo-400" />
                Pilih Periode Laporan
              </h3>

              {/* Period Type Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setPeriodType("year")}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    periodType === "year" ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Per Tahun
                </button>
                <button
                  onClick={() => setPeriodType("month")}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    periodType === "month" ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Per Bulan
                </button>
              </div>

              {/* Year Selection */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selection (if period type is month) */}
              {periodType === "month" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* Options */}
            <div className="mb-6">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Opsi Laporan</h3>

              <label className="flex items-center gap-3 p-4 transition-colors border border-gray-200 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded dark:text-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Sertakan Grafik & Visualisasi</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Tambahkan grafik perbandingan pendapatan vs pengeluaran dan tren bulanan</p>
                </div>
                {includeCharts && <Check className="text-2xl text-green-600 dark:text-green-400" />}
              </label>
            </div>
            {/* Preview Info */}
            <div className="p-4 mb-6 border rounded-lg border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-xl text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="mb-1 font-semibold">Yang Akan Disertakan dalam PDF:</p>
                  <ul className="ml-2 space-y-1 list-disc list-inside">
                    <li>Ringkasan Eksekutif (Pendapatan, Pengeluaran, Laba/Rugi, Posisi Kas)</li>
                    <li>Ringkasan Per Kategori (Top 5 Pendapatan & Pengeluaran)</li>
                    {periodType === "year" && <li>Tren Bulanan (12 Bulan)</li>}
                    <li>Proyeksi Keuangan 5 Tahun (3 Skenario: Optimistik, Realistik, Pesimistik)</li>
                    {includeCharts && <li>Grafik & Visualisasi Data</li>}
                  </ul>
                </div>
              </div>
            </div>
            {/* Generate Button */}
            <button
              onClick={handleGeneratePDF}
              disabled={loading}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-3 ${
                loading ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="text-xl" />
                  <span>Unduh Laporan PDF</span>
                </>
              )}
            </button>
            {/* Period Info */}
            <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
              Laporan akan diunduh untuk periode: <span className="font-semibold text-gray-900 dark:text-white">{periodType === "year" ? `Tahun ${selectedYear}` : `${monthNames[selectedMonth - 1]} ${selectedYear}`}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-6 mt-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-xl">
        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">📋 Catatan Penting:</h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
            <span>
              Laporan PDF akan diunduh dalam format <strong className="text-gray-900 dark:text-white">landscape A4</strong> untuk memudahkan membaca tabel yang lebar
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
            <span>
              Proyeksi keuangan yang ditampilkan adalah <strong className="text-gray-900 dark:text-white">data proyeksi terbaru</strong> untuk setiap skenario
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
            <span>Pastikan bisnis Anda sudah memiliki data transaksi untuk periode yang dipilih</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
            <span>
              PDF akan otomatis diberi <strong className="text-gray-900 dark:text-white">watermark SmartPlan</strong> untuk keamanan dokumen
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExportPDF;
