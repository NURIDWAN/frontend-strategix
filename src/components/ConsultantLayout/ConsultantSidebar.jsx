import React from "react";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  UserCircle, 
  LogOut, 
  Clock,
  Waves
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ConsultantSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/consultant/dashboard" },
    { id: "schedule", label: "Jadwal Kalender", icon: Calendar, path: "/consultant/schedule" },
    { id: "sessions", label: "Riwayat Sesi", icon: Users, path: "/consultant/sessions" },
    { id: "profile", label: "Profil Konsultan", icon: UserCircle, path: "/consultant/profile" },
    { id: "availability", label: "Jam & Ketersediaan", icon: Clock, path: "/consultant/availability" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-700/30">
                <Waves className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Consultant Desk</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Grapadi Strategix</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 font-bold' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-600'}
                `}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100 dark:hover:border-red-900/40"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ConsultantSidebar;
