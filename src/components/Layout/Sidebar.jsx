import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  TrendingUp,
  BarChart3,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  Workflow,
  Building,
  Package,
  FileChartColumnIncreasing,
  Users,
  BanknoteArrowUp,
  Folder,
  Calendar,
  Wallet,
  Calculator,
  Link2,
  Layers,
  Lock,
  MessageSquare,
  CreditCard,
  HandCoins,
} from "lucide-react";
import useFeatureAccess from "../../hooks/useFeatureAccess";
import singapayApi from "../../services/singapayApi";
import { PAYMENT_PENDING_COUNTS_UPDATED } from "../../utils/paymentEvents";

// Map menu item IDs to feature flag keys
const featureFlagMap = {
  forecast: "feature_forecast",
  "export-pdf-lengkap": "feature_pdf_export",
};

const Sidebar = ({ activeSection, setActiveSection, activeSubSection, setActiveSubSection, isOpen, onToggle, onClose, isMobile, isDarkMode, onLogout, user }) => {
  const { isFeatureEnabled } = useFeatureAccess();
  const [pendingCounts, setPendingCounts] = useState({
    pro: 0,
    consultation: 0,
  });

  const pendingCountMap = useMemo(
    () => ({
      "payment": pendingCounts.pro + pendingCounts.consultation,
    }),
    [pendingCounts]
  );

  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const response = await singapayApi.getHistory();
        const history = response?.data?.data || [];

        const proPending = history.filter((item) => item.package_type !== "consultation" && item.status === "pending").length;
        const consultationPending = history.filter((item) => item.package_type === "consultation" && item.status === "pending").length;

        setPendingCounts({
          pro: proPending,
          consultation: consultationPending,
        });
      } catch {
        setPendingCounts({ pro: 0, consultation: 0 });
      }
    };

    fetchPendingCounts();
    window.addEventListener("focus", fetchPendingCounts);

    const handlePendingCountsUpdate = (event) => {
      const detail = event?.detail || {};
      setPendingCounts({
        pro: Number(detail.pro || 0),
        consultation: Number(detail.consultation || 0),
      });
    };
    window.addEventListener(PAYMENT_PENDING_COUNTS_UPDATED, handlePendingCountsUpdate);

    return () => {
      window.removeEventListener("focus", fetchPendingCounts);
      window.removeEventListener(PAYMENT_PENDING_COUNTS_UPDATED, handlePendingCountsUpdate);
    };
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard Utama",
      icon: LayoutDashboard,
      description: "Ringkasan bisnis Anda",
    },

    {
      id: "business-plan",
      label: "Rencana Bisnis",
      icon: FileText,
      description: "Kelola rencana bisnis lengkap",
      subItems: [
        {
          id: "business-background",
          label: "Latar Belakang Bisnis",
          icon: Building,
        },
        {
          id: "market-analysis",
          label: "Analisis Pasar",
          icon: BarChart3,
        },
        {
          id: "product-service",
          label: "Produk & Layanan",
          icon: Package,
        },
        {
          id: "marketing-strategies",
          label: "Strategi Pemasaran",
          icon: FileChartColumnIncreasing,
        },
        {
          id: "operational-plan",
          label: "Rencana Operasional",
          icon: Workflow,
        },
        {
          id: "team-structure",
          label: "Struktur Organisasi & Tim",
          icon: Users,
        },
        // TODO: Comment - FinancialPlan nonaktif di Business Plan
        // {
        //   id: "financial-plan",
        //   label: "Rencana Keuangan",
        //   icon: DollarSign,
        // },
        // {
        //   id: "pdf-business-plan",
        //   label: "PDF Business Plan",
        //   icon: FileText,
        // },
      ],
    },

    {
      id: "management-financial",
      label: "Manajemen Keuangan",
      icon: BanknoteArrowUp,
      description: "Kelola keuangan bisnis Anda",
      subItems: [
        {
          id: "financial-categories",
          label: "Kategori Keuangan",
          icon: Folder,
        },
        {
          id: "financial-simulation",
          label: "Simulasi Keuangan",
          icon: Wallet,
        },
        {
          id: "financial-summaries",
          label: "Ringkasan Keuangan Bulanan",
          icon: Calendar,
        },
        {
          id: "monthly-reports",
          label: "Laporan Bulanan",
          icon: FileText,
        },
        {
          id: "financial-projections",
          label: "Proyeksi Keuangan 5 Tahun",
          icon: Calculator,
        },
        // {
        //   id: "export-pdf-financial",
        //   label: "Export PDF Laporan Keuangan",
        //   icon: FileText,
        // },
      ],
    },

    {
      id: "forecast",
      label: "Forecast Keuangan",
      icon: TrendingUp,
      description: "Prediksi dan analisis keuangan masa depan",
      subItems: [
        {
          id: "daftar-forecast",
          label: "Daftar Forecast",
          icon: FileText,
        },
        {
          id: "hasil-forecast",
          label: "Hasil & Insights",
          icon: BarChart3,
        },
      ],
    },

    {
      id: "export-pdf-lengkap",
      label: "Export PDF Lengkap",
      icon: Layers,
      description: "Unduh Business Plan + Laporan Keuangan",
    },

    {
      id: "affiliate",
      label: "Affiliate & Lead",
      icon: Link2,
      description: "Kelola link affiliate dan lead",
      subItems: [
        {
          id: "affiliate-link",
          label: "Link Affiliate",
          icon: Link2,
        },

        {
          id: "affiliate-commissions",
          label: "Komisi",
          icon: DollarSign,
        },
      ],
    },

    {
      id: "profile",
      label: "Profil Pengguna",
      icon: User,
      description: "Kelola profil Anda",
    },

    {
      id: "consultation",
      label: "Konsultasi Pakar",
      icon: MessageSquare,
      description: "Konsultasi langsung dengan ahli bisnis",
    },

    {
      id: "payment",
      label: "Pembayaran",
      icon: Wallet,
      description: "Kelola pembayaran dan top up",
    },
  ];

  const handleMenuClick = (itemId) => {
    // Check if feature is gated and disabled
    const featureKey = featureFlagMap[itemId];
    if (featureKey && !isFeatureEnabled(featureKey)) {
      return; // Don't navigate to disabled features
    }
    setActiveSection(itemId);
    setActiveSubSection(""); // Reset sub section ketika pindah menu utama
    if (isMobile) {
      onClose();
    }
  };

  const handleSubMenuClick = (subItemId, e, parentId) => {
    e.stopPropagation();
    setActiveSection(parentId); // Set active section ke parent menu
    setActiveSubSection(subItemId);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    onLogout();
    if (isMobile) {
      onClose();
    }
  };

  // Check if any sub item is active
  const isAnySubItemActive = (subItems) => {
    return subItems.some((subItem) => subItem.id === activeSubSection);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white dark:bg-gray-800 shadow-lg lg:shadow-xl min-h-screen
          transition-all duration-300 ease-in-out
          border-r border-gray-200 dark:border-gray-700
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 lg:p-6 dark:border-gray-700 dark:bg-gray-800">
          {isOpen || !isMobile ? (
            <div className={`flex items-center justify-between w-full ${!isOpen && "lg:justify-center"}`}>
              {(isOpen || !isMobile) && (
                <div className={`${!isOpen && "lg:hidden"}`}>
                  <h1 className="text-xl font-bold text-gray-900 lg:text-2xl dark:text-white">
                    <span className="text-green-600 dark:text-green-400">Grapadi</span>
                    Strategix
                  </h1>
                  <p className="hidden mt-1 text-xs text-gray-500 lg:text-sm dark:text-gray-400 lg:block">Business Management</p>
                </div>
              )}{" "}
              {/* Toggle Button */}
              <button onClick={onToggle} className="p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
                {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} className="hidden text-gray-600 dark:text-gray-300 lg:block" />}
              </button>
              {/* Close button for mobile */}
              {isMobile && isOpen && (
                <button onClick={onClose} className="p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden dark:text-gray-300">
                  <X size={20} />
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto lg:p-4 lg:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const hasActiveSubItem = hasSubItems && isAnySubItemActive(item.subItems);
            const featureKey = featureFlagMap[item.id];
            const isDisabled = featureKey && !isFeatureEnabled(featureKey);

            return (
              <div key={item.id} className="space-y-1">
                {/* Main Menu Item */}
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                      : isActive || (hasSubItems && hasActiveSubItem)
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  disabled={isDisabled}
                >
                  <Icon size={20} className={`shrink-0 ${isDisabled ? "text-gray-400 dark:text-gray-500" : isActive || (hasSubItems && hasActiveSubItem) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`} />

                  {/* Menu Text */}
                  <div
                    className={`
                      text-left ml-3 flex-1
                      transition-all duration-200
                      ${isOpen ? "opacity-100 block" : "lg:opacity-0 lg:absolute lg:-left-96"}
                    `}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{item.label}</span>
                      {pendingCountMap[item.id] > 0 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                          {pendingCountMap[item.id]}
                        </span>
                      )}
                    </div>
                    {isOpen && item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isDisabled ? "Fitur dinonaktifkan oleh admin" : item.description}
                      </div>
                    )}
                  </div>

                  {/* Tooltip for collapsed state */}
                  {!isOpen && !isMobile && (
                    <div className="absolute z-50 px-3 py-2 ml-2 text-sm text-white transition-opacity duration-200 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 left-full dark:bg-gray-700 dark:text-gray-200 group-hover:opacity-100 whitespace-nowrap">
                      <div className="font-medium">{item.label}</div>
                      {pendingCountMap[item.id] > 0 && <div className="mt-1 text-xs text-red-300">Pending: {pendingCountMap[item.id]}</div>}
                      {item.description && <div className="max-w-xs mt-1 text-xs text-gray-300">{item.description}</div>}
                    </div>
                  )}

                  {/* Active indicator for collapsed state */}
                  {(isActive || (hasSubItems && hasActiveSubItem)) && !isOpen && !isMobile && <div className="absolute left-0 w-1 h-6 transform -translate-y-1/2 bg-green-600 rounded-r top-1/2 dark:bg-green-400"></div>}

                  {!isOpen && !isMobile && pendingCountMap[item.id] > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                      {pendingCountMap[item.id]}
                    </span>
                  )}

                  {/* Lock icon for disabled features */}
                  {isDisabled && isOpen && (
                    <Lock size={14} className="shrink-0 ml-2 text-gray-400 dark:text-gray-500" />
                  )}

                  {/* Chevron for items with submenus */}
                  {hasSubItems && (
                    <ChevronRight
                      size={16}
                      className={`
                        shrink-0 transition-transform duration-200 ml-2
                        ${isActive || hasActiveSubItem ? "text-green-600 dark:text-green-400 rotate-90" : "text-gray-400 dark:text-gray-500"}
                        ${isOpen ? "opacity-100" : "lg:opacity-0"}
                      `}
                    />
                  )}
                </button>

                {/* Sub Menu Items - Show when parent is active and sidebar is open */}
                {hasSubItems && (isActive || hasActiveSubItem) && isOpen && (
                  <div className="pl-3 ml-4 space-y-1 border-l border-gray-200 dark:border-gray-600">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeSubSection === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          onClick={(e) => handleSubMenuClick(subItem.id, e, item.id)}
                          className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 group text-sm ${isSubActive
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                          <SubIcon size={16} className={`shrink-0 mr-3 ${isSubActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                          <span className="flex-1 text-left truncate">{subItem.label}</span>

                          {/* Active indicator for sub menu */}
                          {isSubActive && <div className="w-2 h-2 ml-2 bg-blue-600 rounded-full dark:bg-blue-400"></div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout Section */}
        <div className="p-4 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          {/* User Info */}
          <div className={`flex items-center mb-4 ${!isOpen && "lg:justify-center"}`}>
            <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full shadow-sm bg-gradient-to-br from-green-500 to-green-600">{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
            {isOpen && (
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{user?.name || "User"}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">{user?.business_name || "Business Owner"}</p>
              </div>
            )}

            {/* User Tooltip for collapsed state */}
            {!isOpen && !isMobile && (
              <div className="absolute z-50 px-3 py-2 ml-2 text-sm text-white transition-opacity duration-200 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 left-full dark:bg-gray-700 dark:text-gray-200 group-hover:opacity-100 whitespace-nowrap">
                <div className="font-medium">{user?.name || "User"}</div>
                <div className="mt-1 text-xs font-medium text-green-400">{user?.business_name || "Business Owner"}</div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 border border-transparent hover:border-red-200 dark:hover:border-red-800 ${!isOpen && "lg:justify-center"
              }`}
          >
            <LogOut size={20} className="shrink-0" />

            {/* Logout Text */}
            <span
              className={`
                font-medium text-left ml-3
                transition-all duration-200
                ${isOpen ? "opacity-100 block" : "lg:opacity-0 lg:absolute lg:-left-96"}
              `}
            >
              Keluar
            </span>

            {/* Tooltip for collapsed state */}
            {!isOpen && !isMobile && (
              <div className="absolute z-50 px-3 py-2 ml-2 text-sm text-white transition-opacity duration-200 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 left-full dark:bg-gray-700 dark:text-gray-200 group-hover:opacity-100 whitespace-nowrap">
                Keluar
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Toggle Button ketika sidebar tertutup di desktop */}
      {!isOpen && !isMobile && (
        <button
          onClick={onToggle}
          className="fixed z-40 items-center justify-center hidden p-2 transition-colors duration-200 bg-white border border-gray-200 rounded-lg shadow-lg top-6 left-6 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 lg:flex dark:border-gray-600"
          aria-label="Buka sidebar"
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && isMobile && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}
    </>
  );
};

export default Sidebar;
