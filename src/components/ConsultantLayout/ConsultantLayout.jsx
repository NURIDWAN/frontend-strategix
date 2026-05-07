import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ConsultantSidebar from "./ConsultantSidebar";
import { Menu, Bell, Moon, Sun, User, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ConsultantLayout = ({ isDarkMode, toggleDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-950' : 'bg-slate-50'}`}>
      <ConsultantSidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:flex">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400 hidden sm:block">Consultant Workspace</h2>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleDarkMode}
                className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>

              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-center text-green-700 dark:text-green-400">
                 <User size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultantLayout;
