import { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "../components/Layout/Sidebar";
import Header from "../components/Layout/Header";
import QuickActions from "../components/Dashboard/QuickActions";
import { FileText, BarChart3, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Lazy-loaded page components for code splitting
const BusinessPlan = lazy(() => import("./BusinessPlan"));
const ManagementFinancial = lazy(() => import("./ManagementFinancial"));
const ExportPDFLengkap = lazy(() => import("./ExportPDFLengkap"));
const Forecast = lazy(() => import("./Forecast"));
const Affiliate = lazy(() => import("./Affiliate"));
const UserProfile = lazy(() => import("../components/UserProfile/UserProfileView"));
const UserProfileEdit = lazy(() => import("../components/UserProfile/UserProfileEdit"));
const ConsultationHistory = lazy(() => import("../components/Consultation/ConsultationHistory"));
const ConsultationCredit = lazy(() => import("../components/Consultation/ConsultationCredit"));
const UserUnifiedPaymentCenter = lazy(() => import("../components/Payment/UserUnifiedPaymentCenter"));

const Dashboard = ({ isDarkMode, toggleDarkMode }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubSection, setActiveSubSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState("profile");

  const { logout, user } = useAuth();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [activeSection, activeSubSection, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    // Jika section business-plan aktif, tampilkan BusinessPlan component
    if (activeSection === "business-plan") {
      return <BusinessPlan activeSubSection={activeSubSection} setActiveSubSection={setActiveSubSection} />;
    }

    // Jika section management-financial aktif, tampilkan ManagementFinancial component
    if (activeSection === "management-financial") {
      return <ManagementFinancial activeSubSection={activeSubSection} setActiveSubSection={setActiveSubSection} />;
    }

    // Jika section export-pdf-lengkap aktif, tampilkan ExportPDFLengkap component
    if (activeSection === "export-pdf-lengkap") {
      return <ExportPDFLengkap activeSubSection={activeSubSection} setActiveSubSection={setActiveSubSection} />;
    }

    // Jika section forecast aktif, tampilkan Forecast component
    if (activeSection === "forecast") {
      return <Forecast activeSubSection={activeSubSection} setActiveSubSection={setActiveSubSection} />;
    }

    // Jika section affiliate aktif, tampilkan Affiliate component
    if (activeSection === "affiliate") {
      return <Affiliate activeSubSection={activeSubSection} setActiveSubSection={setActiveSubSection} />;
    }

    // Jika section consultation aktif, tampilkan ConsultationHistory + Widget
    if (activeSection === "consultation") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ConsultationHistory />
          </div>
          <div className="space-y-6">
            <ConsultationCredit onTopUp={() => setActiveSection("payment")} />
            <div className="p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl text-white shadow-xl">
               <h4 className="font-bold text-lg mb-2">Butuh Bantuan Cepat?</h4>
               <p className="text-sm text-green-50/80 mb-4">Konsultan kami siap membantu Anda menyempurnakan strategi bisnis dan laporan keuangan.</p>
               <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-xs italic">
                 "Konsultasi sangat membantu saya dalam memproyeksi arus kas untuk 3 tahun ke depan." - Budi, UMKM Juara
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "payment") {
      return <UserUnifiedPaymentCenter />;
    }

    // Main section
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Dashboard Utama</h1>
              <p className="text-gray-600 dark:text-gray-400">Selamat datang! Lihat ringkasan bisnis Anda.</p>
            </div>

            {/* Module Overview Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Business Plan Module */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("[Dashboard] Navigating to business-plan");
                  setActiveSection("business-plan");
                  setActiveSubSection("business-background");
                }}
                className="p-4 text-left transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 transition-colors bg-blue-100 rounded-lg dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                    <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-300">8 Sub-modul</span>
                </div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Business Plan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Buat rencana bisnis profesional</p>
              </button>

              {/* Financial Management Module */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("[Dashboard] Navigating to management-financial");
                  setActiveSection("management-financial");
                  setActiveSubSection("financial-simulation");
                }}
                className="p-4 text-left transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 transition-colors bg-green-100 rounded-lg dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50">
                    <BarChart3 size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded dark:bg-green-900/30 dark:text-green-300">6 Sub-modul</span>
                </div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Financial Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kelola keuangan dan laporan</p>
              </button>

              {/* Forecast Module */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("[Dashboard] Navigating to forecast");
                  setActiveSection("forecast");
                  setActiveSubSection("daftar-forecast");
                }}
                className="p-4 text-left transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 transition-colors bg-purple-100 rounded-lg dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50">
                    <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded dark:bg-purple-900/30 dark:text-purple-300">2 Modul</span>
                </div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Forecast Keuangan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prediksi masa depan bisnis</p>
              </button>

              {/* Affiliate Module */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("[Dashboard] Navigating to affiliate");
                  setActiveSection("affiliate");
                  setActiveSubSection("affiliate-link");
                }}
                className="p-4 text-left transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 transition-colors bg-orange-100 rounded-lg dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50">
                    <FileText size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded dark:bg-orange-900/30 dark:text-orange-300">3 Sub-modul</span>
                </div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Affiliate & Lead</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kelola link affiliate</p>
              </button>
            </div>

            {/* Recent Plans & Quick Actions */}
            <div className="lg:col-span-2">
              <QuickActions
                setActiveSection={setActiveSection}
                setActiveSubSection={setActiveSubSection}
              />
            </div>
          </div>
        );

      case "profile":
        switch (page) {
          case "profile":
            return <UserProfile onEdit={() => setPage("edit-profile")} />;

          case "edit-profile":
            return <UserProfileEdit onBack={() => setPage("profile")} />;

          default:
            return <UserProfile onEdit={() => setPage("edit-profile")} />;
        }

      default:
        return (
          <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace("-", " ")}</h1>
            <div className="p-8 text-center bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <FileText size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">Fitur ini sedang dalam pengembangan</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeSubSection={activeSubSection}
        setActiveSubSection={setActiveSubSection}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onClose={closeSidebar}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && !isMobile ? "lg:ml-0" : "ml-0"}`}>
        <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />

        <main className="flex-1 p-4 overflow-auto lg:p-6">
          <div className="w-full mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
