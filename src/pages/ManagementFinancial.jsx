import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { managementFinancialApi } from "../services/managementFinancial";
import axios from "axios";
import { toast } from "react-toastify";
import { DollarSign, PieChart, TrendingUp, BarChart3, FileText, CreditCard, Settings, Plus, Folder, Calculator, LineChart, Building2, ChevronDown } from "lucide-react";
import FinancialCategories from "../components/ManagementFinancial/FinancialCategories/FinancialCategories";
import FinancialSummaries from "../components/ManagementFinancial/FinancialSummaries/FinancialSummaries";
import FinancialSimulation from "../components/ManagementFinancial/FinancialSimulation/FinancialSimulation";
import MonthlyReports from "../components/ManagementFinancial/MonthlyReports/MonthlyReports";
import FinancialProjections from "../components/ManagementFinancial/FinancialProjections/FinancialProjections";
import ExportPDF from "../components/ManagementFinancial/ExportPDF/ExportPDF";

const ManagementFinancial = ({ activeSubSection, setActiveSubSection }) => {
  const { user } = useAuth();
  const [view, setView] = useState("main");
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    total_categories: 0,
    total_simulations: 0,
    total_income: 0,
    total_expense: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch businesses on mount
  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  const fetchBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      // TODO: Comment - FinancialPlan nonaktif di Business Plan, gunakan axios langsung
      // const response = await managementFinancialApi.getBusinesses({ user_id: user.id });
      const response = await axios.get(`${apiUrl}/api/business-background`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data && response.data.data) {
        setBusinesses(response.data.data);

        // Auto-select first business
        if (response.data.data.length > 0 && !selectedBusiness) {
          setSelectedBusiness(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Gagal memuat data bisnis");
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleBusinessChange = (e) => {
    const businessId = parseInt(e.target.value);
    const business = businesses.find((b) => b.id === businessId);
    setSelectedBusiness(business);
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!selectedBusiness || !user) return;

    try {
      setLoadingStats(true);
      const response = await managementFinancialApi.getDashboardStats({
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      });

      if (response.data && response.data.status === "success") {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch stats when selected business changes
  useEffect(() => {
    if (selectedBusiness) {
      fetchDashboardStats();
    }
  }, [selectedBusiness]);

  // Sync view dengan activeSubSection dari parent
  useEffect(() => {
    if (activeSubSection) {
      setView(activeSubSection);
    } else {
      setView("main");
    }
  }, [activeSubSection]);

  const handleSubSectionClick = (subSectionId) => {
    setActiveSubSection(subSectionId);
    setView(subSectionId);
  };

  const handleBackToMain = () => {
    setActiveSubSection("");
    setView("main");
  };

  const renderMainView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Manajemen Keuangan</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola semua aspek keuangan bisnis Anda secara terintegrasi</p>
      </div>

      {/* Business Selector */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Bisnis</label>
            {loadingBusinesses ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Memuat data bisnis...</div>
            ) : businesses.length === 0 ? (
              <div className="text-sm text-amber-600 dark:text-amber-400">Belum ada data bisnis. Silakan buat Business Background terlebih dahulu.</div>
            ) : (
              <div className="relative">
                <select
                  value={selectedBusiness?.id || ""}
                  onChange={handleBusinessChange}
                  className="w-full md:w-96 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent appearance-none cursor-pointer"
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name || `Bisnis #${business.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" size={20} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show content only if business is selected */}
      {!selectedBusiness ? (
        <div className="p-6 text-center border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 rounded-xl">
          <Building2 className="mx-auto mb-3 text-amber-600 dark:text-amber-400" size={48} />
          <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">Pilih Bisnis Terlebih Dahulu</h3>
          <p className="text-amber-700 dark:text-amber-300">Silakan pilih bisnis dari dropdown di atas untuk mulai mengelola keuangan.</p>
        </div>
      ) : (
        <>
          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Kategori</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{loadingStats ? "..." : dashboardStats.total_categories}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                  <Folder className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Simulasi</p>
                  <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{loadingStats ? "..." : dashboardStats.total_simulations}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                  <LineChart className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendapatan</p>
                  <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                    {loadingStats
                      ? "..."
                      : new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(dashboardStats.total_income)}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pengeluaran</p>
                  <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                    {loadingStats
                      ? "..."
                      : new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(dashboardStats.total_expense)}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg dark:bg-red-900/20">
                  <BarChart3 className="text-red-600 dark:text-red-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {/* Kategori Keuangan Card */}
            <div
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-lg group hover:border-blue-300 dark:hover:border-blue-600"
              onClick={() => handleSubSectionClick("financial-categories")}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform duration-300 bg-blue-100 rounded-lg dark:bg-blue-900/20 group-hover:scale-110">
                <Folder className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Kategori Keuangan</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Kelola kategori pendapatan dan pengeluaran untuk organisasi keuangan yang lebih baik</p>
              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                <span>Kelola Kategori</span>
                <svg className="w-4 h-4 ml-1 transition-transform transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Simulasi Arus Kas Card */}
            <div
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-lg group hover:border-purple-300 dark:hover:border-purple-600"
              onClick={() => handleSubSectionClick("financial-simulation")}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform duration-300 bg-purple-100 rounded-lg dark:bg-purple-900/20 group-hover:scale-110">
                <LineChart className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Simulasi Arus Kas</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Input transaksi, pantau arus kas, dan analisis kesehatan keuangan bisnis Anda</p>
              <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                <span>Mulai Simulasi</span>
                <svg className="w-4 h-4 ml-1 transition-transform transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Ringkasan Keuangan Card */}
            <div
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-lg group hover:border-teal-300 dark:hover:border-teal-600"
              onClick={() => handleSubSectionClick("financial-summaries")}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform duration-300 bg-teal-100 rounded-lg dark:bg-teal-900/20 group-hover:scale-110">
                <BarChart3 className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Ringkasan Keuangan</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Lihat ringkasan pendapatan, pengeluaran, dan laba bulanan dengan grafik analisis</p>
              <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
                <span>Lihat Ringkasan</span>
                <svg className="w-4 h-4 ml-1 transition-transform transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Laporan Bulanan Card */}
            <div
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-lg group hover:border-orange-300 dark:hover:border-orange-600"
              onClick={() => handleSubSectionClick("monthly-reports")}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform duration-300 bg-orange-100 rounded-lg dark:bg-orange-900/20 group-hover:scale-110">
                <FileText className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Laporan Bulanan</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Laporan arus kas dan neraca keuangan dengan format investor-friendly</p>
              <div className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400">
                <span>Lihat Laporan</span>
                <svg className="w-4 h-4 ml-1 transition-transform transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Proyeksi Keuangan 5 Tahun Card */}
            <div
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-lg group hover:border-emerald-300 dark:hover:border-emerald-600"
              onClick={() => handleSubSectionClick("financial-projections")}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform duration-300 bg-emerald-100 rounded-lg dark:bg-emerald-900/20 group-hover:scale-110">
                <Calculator className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Proyeksi Keuangan 5 Tahun</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Buat proyeksi masa depan dengan analisis ROI, NPV, IRR dan Payback Period</p>
              <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span>Buat Proyeksi</span>
                <svg className="w-4 h-4 ml-1 transition-transform transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Export PDF Laporan Keuangan Card */}
            <div
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-lg group hover:border-red-300 dark:hover:border-red-600"
              onClick={() => handleSubSectionClick("export-pdf-financial")}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 transition-transform duration-300 bg-red-100 rounded-lg dark:bg-red-900/20 group-hover:scale-110">
                <FileText className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Export PDF Laporan Keuangan</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Unduh laporan keuangan lengkap dengan ringkasan, proyeksi, dan grafik dalam format PDF</p>
              <div className="flex items-center text-sm font-medium text-red-600 dark:text-red-400">
                <span>Export PDF</span>
                <svg className="w-4 h-4 ml-1 transition-transform transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Panduan Penggunaan</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-gray-900 dark:text-white">Buat Kategori</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mulai dengan membuat kategori pendapatan dan pengeluaran</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full dark:bg-purple-900/20">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-gray-900 dark:text-white">Input Simulasi</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tambahkan transaksi dan simulasi arus kas berdasarkan kategori</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full dark:bg-teal-900/20">
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">3</span>
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-gray-900 dark:text-white">Analisis Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pantau ringkasan dan analisis kesehatan keuangan bisnis</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSubSection = () => {
    switch (view) {
      case "financial-categories":
        return <FinancialCategories onBack={handleBackToMain} selectedBusiness={selectedBusiness} />;
      case "financial-simulation":
        return <FinancialSimulation onBack={handleBackToMain} selectedBusiness={selectedBusiness} />;
      case "financial-summaries":
        return <FinancialSummaries onBack={handleBackToMain} selectedBusiness={selectedBusiness} />;
      case "monthly-reports":
        return <MonthlyReports onBack={handleBackToMain} selectedBusiness={selectedBusiness} />;
      case "financial-projections":
        return <FinancialProjections onBack={handleBackToMain} selectedBusiness={selectedBusiness} />;
      case "export-pdf-financial":
        return <ExportPDF onBack={handleBackToMain} selectedBusiness={selectedBusiness} />;
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">{renderSubSection()}</div>
    </div>
  );
};

export default ManagementFinancial;
