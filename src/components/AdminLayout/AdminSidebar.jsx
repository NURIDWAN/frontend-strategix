import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Link2,
  ScrollText,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Ringkasan statistik sistem",
    path: "/admin",
    end: true,
  },
  {
    id: "users",
    label: "Manajemen Pengguna",
    icon: Users,
    description: "Kelola akun dan hak akses",
    path: "/admin/users",
  },
  {
    id: "articles",
    label: "Kelola Artikel",
    icon: FileText,
    description: "Buat dan kelola konten artikel",
    path: "/admin/articles",
  },
  {
    id: "payments",
    label: "Manajemen Pembayaran",
    icon: CreditCard,
    description: "Riwayat dan verifikasi pembayaran",
    path: "/admin/payments",
  },
  {
    id: "affiliates",
    label: "Manajemen Affiliate",
    icon: Link2,
    description: "Kelola program dan komisi affiliate",
    path: "/admin/affiliates",
  },
  {
    id: "logs",
    label: "Log Aktivitas",
    icon: ScrollText,
    description: "Pantau aktivitas pengguna",
    path: "/admin/logs",
  },
  {
    id: "settings",
    label: "Pengaturan Sistem",
    icon: Settings,
    description: "Konfigurasi aplikasi",
    path: "/admin/settings",
  },
  {
    id: "seo",
    label: "Kelola SEO",
    icon: Search,
    description: "Optimasi metadata halaman",
    path: "/admin/seo",
  },
  {
    id: "consultations",
    label: "Kelola Konsultasi",
    icon: MessageSquare,
    description: "Atur pakar dan paket konsultasi",
    path: "/admin/consultations",
  },
];

const AdminSidebar = ({ isOpen, onToggle, onClose, isMobile, onLogout, user }) => {
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    if (isMobile) {
      onClose();
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
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
                  <p className="hidden mt-1 text-xs text-gray-500 lg:text-sm dark:text-gray-400 lg:block">Admin Panel</p>
                </div>
              )}

              {/* Toggle Button */}
              <button
                onClick={onToggle}
                className="p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                {isOpen ? (
                  <ChevronLeft size={20} />
                ) : (
                  <ChevronRight size={20} className="hidden text-gray-600 dark:text-gray-300 lg:block" />
                )}
              </button>

              {/* Close button for mobile */}
              {isMobile && isOpen && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden dark:text-gray-300"
                >
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
            const isActive = item.end
              ? location.pathname === "/admin" || location.pathname === "/admin/"
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end}
                onClick={handleNavClick}
                className={`
                  w-full flex items-center p-3 rounded-lg transition-all duration-200 group relative
                  ${isActive
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`} />

                {/* Menu Text with Description */}
                <div
                  className={`
                    text-left ml-3 flex-1
                    transition-all duration-200
                    ${isOpen ? "opacity-100 block" : "lg:opacity-0 lg:absolute lg:-left-96"}
                  `}
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  {isOpen && item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>
                  )}
                </div>

                {/* Tooltip for collapsed state */}
                {!isOpen && !isMobile && (
                  <div className="absolute z-50 px-3 py-2 ml-2 text-sm text-white transition-opacity duration-200 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 left-full dark:bg-gray-700 dark:text-gray-200 group-hover:opacity-100 whitespace-nowrap">
                    <div className="font-medium">{item.label}</div>
                    {item.description && <div className="max-w-xs mt-1 text-xs text-gray-300">{item.description}</div>}
                  </div>
                )}

                {/* Active indicator for collapsed state */}
                {isActive && !isOpen && !isMobile && (
                  <div className="absolute left-0 w-1 h-6 transform -translate-y-1/2 bg-green-600 rounded-r top-1/2 dark:bg-green-400"></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout Section */}
        <div className="p-4 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          {/* User Info */}
          <div className={`flex items-center mb-4 ${!isOpen && "lg:justify-center"}`}>
            <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full shadow-sm bg-gradient-to-br from-green-500 to-green-600">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{user?.name || "Admin"}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">Administrator</p>
              </div>
            )}

            {/* User Tooltip for collapsed state */}
            {!isOpen && !isMobile && (
              <div className="absolute z-50 px-3 py-2 ml-2 text-sm text-white transition-opacity duration-200 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 left-full dark:bg-gray-700 dark:text-gray-200 group-hover:opacity-100 whitespace-nowrap">
                <div className="font-medium">{user?.name || "Admin"}</div>
                <div className="mt-1 text-xs font-medium text-green-400">Administrator</div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 border border-transparent hover:border-red-200 dark:hover:border-red-800 ${!isOpen && "lg:justify-center"}`}
          >
            <LogOut size={20} className="shrink-0" />
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
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />
      )}
    </>
  );
};

export default AdminSidebar;
