import { useState, useEffect, useCallback, useRef } from "react";
import { adminAPI } from "../../services/admin/adminApi";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Shield,
  Crown,
  TrendingUp,
  Activity,
  PhoneOff,
  RefreshCw,
  Download,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const AUTO_REFRESH_INTERVAL = 60_000; // 60 seconds

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [trendChartType, setTrendChartType] = useState("bar"); // "bar" or "area"
  const [trendMonths, setTrendMonths] = useState(12); // 6 or 12
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat statistik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchStats(false);
      }, AUTO_REFRESH_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, fetchStats]);

  const exportCSV = () => {
    if (!stats) return;

    const rows = [
      ["Metrik", "Nilai"],
      ["Total Pengguna", stats.users.total],
      ["Pengguna Aktif", stats.users.active],
      ["Pengguna Banned", stats.users.banned],
      ["Pengguna Inaktif", stats.users.inactive],
      ["Pengguna Pro", stats.subscriptions.pro_active],
      ["Pengguna Free", stats.subscriptions.free],
      ["Admin", stats.users.admins],
      ["Terverifikasi", stats.users.verified],
      ["Belum Verifikasi", stats.users.unverified],
      ["Pertumbuhan 7 Hari", stats.growth.last_7_days],
      ["Pertumbuhan 30 Hari", stats.growth.last_30_days],
      ["Total Referral", stats.affiliates.total_referrals],
      [],
      ["Bulan", "Registrasi"],
    ];

    if (stats.growth.trend) {
      stats.growth.trend.forEach((t) => {
        rows.push([t.month, t.count]);
      });
    }

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="px-4 py-2 mt-4 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Pengguna",
      value: stats.users.total,
      icon: Users,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pengguna Aktif",
      value: stats.users.active,
      icon: UserCheck,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Pengguna Banned",
      value: stats.users.banned,
      icon: UserX,
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Pengguna Inaktif",
      value: stats.users.inactive,
      icon: UserMinus,
      bgColor: "bg-gray-100 dark:bg-gray-700",
      textColor: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Pengguna Pro",
      value: stats.subscriptions.pro_active,
      icon: Crown,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Admin",
      value: stats.users.admins,
      icon: Shield,
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Terverifikasi",
      value: stats.users.verified,
      icon: Activity,
      bgColor: "bg-teal-100 dark:bg-teal-900/30",
      textColor: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "Belum Verifikasi",
      value: stats.users.unverified,
      icon: PhoneOff,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  const trendData = stats.growth.trend
    ? trendMonths === 6
      ? stats.growth.trend.slice(-6)
      : stats.growth.trend
    : [];

  const conversionRate =
    stats.users.total > 0
      ? ((stats.subscriptions.pro_active / stats.users.total) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Statistik dan ringkasan platform
            {lastUpdated && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock size={12} />
                {lastUpdated.toLocaleTimeString("id-ID")}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              autoRefresh
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "bg-white text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title={autoRefresh ? "Auto-refresh aktif (60 detik)" : "Aktifkan auto-refresh"}
          >
            <RefreshCw size={14} className={autoRefresh ? "animate-spin" : ""} />
            {autoRefresh ? "Auto" : "Refresh"}
          </button>

          {/* Manual refresh */}
          <button
            onClick={() => fetchStats(false)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            title="Refresh manual"
          >
            <RefreshCw size={14} />
          </button>

          {/* CSV Export */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value.toLocaleString("id-ID")}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgColor}`}
                >
                  <Icon size={24} className={card.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Growth & Subscription Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Growth Stats */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Pertumbuhan Pengguna
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  7 hari terakhir
                </span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                +{stats.growth.last_7_days}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  30 hari terakhir
                </span>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                +{stats.growth.last_30_days}
              </span>
            </div>
            {/* Conversion rate */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <Crown size={18} className="text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Konversi ke Pro
                </span>
              </div>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {conversionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Distribusi Langganan
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: "Pro", value: stats.subscriptions.pro_active },
                  { name: "Free", value: stats.subscriptions.free },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                <Cell fill="#a855f7" />
                <Cell fill="#9ca3af" />
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Affiliate & Quick Stats */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Ringkasan Afiliasi
          </h3>
          <div className="space-y-3">
            <div className="p-4 text-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.affiliates.total_referrals.toLocaleString("id-ID")}
              </p>
              <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                Total Referral
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 text-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.users.verified.toLocaleString("id-ID")}
                </p>
                <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                  Terverifikasi
                </p>
              </div>
              <div className="p-3 text-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.users.active.toLocaleString("id-ID")}
                </p>
                <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                  Aktif
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Trend */}
      {trendData.length > 0 && (
        <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tren Registrasi
            </h3>
            <div className="flex items-center gap-2">
              {/* Period selector */}
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setTrendMonths(6)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    trendMonths === 6
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  6 Bulan
                </button>
                <button
                  onClick={() => setTrendMonths(12)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    trendMonths === 12
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  12 Bulan
                </button>
              </div>
              {/* Chart type selector */}
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setTrendChartType("bar")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    trendChartType === "bar"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setTrendChartType("area")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    trendChartType === "area"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  Area
                </button>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {trendChartType === "bar" ? (
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  name="Registrasi"
                />
              </BarChart>
            ) : (
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.2}
                  name="Registrasi"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
