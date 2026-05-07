import { useState, useEffect, Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAuth } from "../../contexts/AuthContext";

const AdminLayout = ({ isDarkMode, toggleDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
    if (!isMobile) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onClose={closeSidebar}
        isMobile={isMobile}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && !isMobile ? "lg:ml-0" : "ml-0"}`}>
        <AdminHeader
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          user={user}
        />

        <main className="flex-1 p-4 overflow-auto lg:p-6">
          <div className="w-full mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
