import { useLocation, Link } from "react-router-dom";
import { Menu, Sun, Moon, ChevronRight } from "lucide-react";

const BREADCRUMB_MAP = {
  "/admin": "Dashboard",
  "/admin/users": "Manajemen Pengguna",
  "/admin/articles": "Kelola Artikel",
  "/admin/articles/create": "Buat Artikel",
  "/admin/payments": "Manajemen Pembayaran",
  "/admin/affiliates": "Manajemen Affiliate",
  "/admin/logs": "Log Aktivitas",
  "/admin/settings": "Pengaturan Sistem",
};

const AdminHeader = ({ onToggleSidebar, isMobile, isDarkMode, toggleDarkMode, user }) => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ label: "Admin", path: "/admin" }];

    // Check for exact match first
    if (BREADCRUMB_MAP[path] && path !== "/admin") {
      crumbs.push({ label: BREADCRUMB_MAP[path], path });
      return crumbs;
    }

    // Check for partial matches (e.g., /admin/articles/123/edit)
    const segments = path.split("/").filter(Boolean);
    if (segments.length >= 3) {
      const parentPath = `/${segments[0]}/${segments[1]}`;
      if (BREADCRUMB_MAP[parentPath]) {
        crumbs.push({ label: BREADCRUMB_MAP[parentPath], path: parentPath });
      }
      // Add edit label
      if (segments.includes("edit")) {
        crumbs.push({ label: "Edit", path });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          {/* Mobile menu toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight size={14} className="mx-1 text-gray-400" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile title */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white sm:hidden">
            Admin Panel
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* Admin Info */}
          <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-sm font-semibold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
