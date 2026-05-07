import { User, Menu, Sun, Moon, Crown, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import singapayApi from "../../services/singapayApi";

const Header = ({
  onToggleSidebar,
  isMobile,
  isDarkMode,
  toggleDarkMode,
  user,
}) => {
  const [accessInfo, setAccessInfo] = useState({
    has_access: false,
    package: null,
    expires_at: null,
    remaining_days: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState(null);

  // Fetch status dari API setiap 5 menit
  useEffect(() => {
    checkProAccess();
    const apiInterval = setInterval(checkProAccess, 5 * 60 * 1000);
    return () => clearInterval(apiInterval);
  }, []);

  // Real-time countdown effect
  useEffect(() => {
    if (!accessInfo.expires_at || !accessInfo.has_access) return;

    // Initial calculation
    updateRemainingDays();

    // Start countdown interval
    const timer = setInterval(updateRemainingDays, 60 * 1000);
    setCountdownTimer(timer);

    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [accessInfo.expires_at, accessInfo.has_access]);

  const checkProAccess = async () => {
    try {
      const response = await singapayApi.checkAccess();
      if (response.data.success) {
        setAccessInfo({
          has_access: response.data.has_access || false,
          package: response.data.package || null,
          expires_at: response.data.expires_at || null,
          remaining_days: response.data.remaining_days || 0,
        });
        
        // Initialize remaining days from API response
        if (response.data.remaining_days !== undefined) {
          setRemainingDays(response.data.remaining_days);
        }
      }
    } catch (error) {
      console.error("Failed to check Pro access:", error);
      setAccessInfo({
        has_access: false,
        package: null,
        expires_at: null,
        remaining_days: 0,
      });
      setRemainingDays(0);
    } finally {
      setLoading(false);
    }
  };

  // Hitung sisa hari real-time
  const updateRemainingDays = () => {
    if (!accessInfo.expires_at || !accessInfo.has_access) {
      setRemainingDays(0);
      return;
    }
    
    const now = new Date();
    const expiresDate = new Date(accessInfo.expires_at);
    
    // Jika sudah expired
    if (expiresDate < now) {
      setRemainingDays(0);
      return;
    }
    
    // Hitung selisih dalam hari
    const diffMs = expiresDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    setRemainingDays(diffDays > 0 ? diffDays : 0);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getRemainingTimeText = (days) => {
    if (!days || days <= 0) return "Hari ini";
    if (days === 1) return "Besok";
    if (days < 30) return `${days} hari lagi`;
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) return `${months} bulan`;
    return `${months} bulan ${remainingDays} hari`;
  };

  const getStatusColor = (days) => {
    if (!days || days <= 0) return "text-gray-500 dark:text-gray-400";
    if (days <= 3) return "text-red-600 dark:text-red-400";
    if (days <= 7) return "text-yellow-600 dark:text-yellow-400";
    if (days <= 14) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  const getPackageName = (packageType) => {
    switch(packageType) {
      case 'monthly': return 'Paket Bulanan';
      case 'yearly': return 'Paket Tahunan';
      default: return 'Paket Pro';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left Section - Toggle Button */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>

          {/* App Title */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
            Dashboard
          </h1>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={handleDarkModeToggle}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun size={24} className="text-yellow-500" />
            ) : (
              <Moon size={24} className="text-gray-600" />
            )}
          </button>

          {/* User Info with Real Pro Status */}
          <div className="flex items-center space-x-2 lg:space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                accessInfo.has_access
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                  : "bg-gradient-to-br from-green-500 to-green-600"
              }`}
            >
              {accessInfo.has_access ? (
                <Crown size={20} className="text-white" />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "User"}
              </p>
              {loading ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Loading...
                </p>
              ) : (
                <div
                  className="relative flex items-center gap-1"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <p
                    className={`text-xs font-semibold cursor-help ${
                      accessInfo.has_access
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {accessInfo.has_access ? "Pro" : "Free"}
                  </p>
                  {accessInfo.has_access && remainingDays > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      • {remainingDays}d
                    </p>
                  )}

                  {/* Enhanced Tooltip - Modern Design */}
                  {showTooltip && accessInfo.has_access && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50">
                      {/* Tooltip Arrow */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-600 transform rotate-45"></div>
                      
                      {/* Header */}
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                            <Crown size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Status PRO</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {getPackageName(accessInfo.package)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-4">
                        {/* Progress Section */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Sisa waktu:</span>
                            <span className={`font-bold ${getStatusColor(remainingDays)}`}>
                              {getRemainingTimeText(remainingDays)}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                remainingDays <= 7 
                                  ? 'bg-gradient-to-r from-red-400 to-red-500' 
                                  : remainingDays <= 14
                                    ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                    : 'bg-gradient-to-r from-green-400 to-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, Math.max(5, (remainingDays / (accessInfo.package === 'yearly' ? 365 : 30)) * 100))}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Berakhir</span>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {formatExpiryDate(accessInfo.expires_at)}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock size={18} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Sisa hari</span>
                            </div>
                            <p className={`font-bold text-lg ${getStatusColor(remainingDays)}`}>
                              {remainingDays}
                            </p>
                          </div>
                        </div>

                        {/* Warning Message */}
                        {remainingDays <= 7 && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg">
                            <AlertTriangle size={20} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                Masa aktif hampir berakhir
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Akan berakhir dalam {remainingDays} hari
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Status real-time • Update otomatis
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;