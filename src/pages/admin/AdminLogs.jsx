import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../services/admin/adminApi";
import { toast } from "react-toastify";
import {
  ScrollText,
  Clock,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  User,
  Shield,
  Monitor,
  Globe,
  Calendar,
  X,
} from "lucide-react";

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 5) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffWeek < 4) return `${diffWeek} minggu lalu`;
  return `${diffMonth} bulan lalu`;
};

const getActionBadgeClasses = (action) => {
  if (!action) return "bg-gray-100 text-gray-700";
  if (action.startsWith("login")) return "bg-green-100 text-green-700";
  if (action === "logout" || action.startsWith("logout")) return "bg-gray-100 text-gray-600";
  if (action.startsWith("user")) return "bg-blue-100 text-blue-700";
  if (action.startsWith("payment")) return "bg-purple-100 text-purple-700";
  if (action.startsWith("commission")) return "bg-orange-100 text-orange-700";
  if (action.startsWith("withdrawal")) return "bg-red-100 text-red-700";
  if (action.startsWith("settings")) return "bg-indigo-100 text-indigo-700";
  if (action.startsWith("package")) return "bg-teal-100 text-teal-700";
  return "bg-gray-100 text-gray-700";
};

const getRoleBadgeClasses = (role) => {
  if (role === "admin") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const AdminLogs = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    action_group: "",
    date_from: "",
    date_to: "",
    page: 1,
  });

  const [searchInput, setSearchInput] = useState("");

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getLogStats();
      setStats(response.data.data);
    } catch {
      toast.error("Gagal memuat statistik log");
    }
  };

  const fetchLogs = useCallback(async (currentFilters) => {
    try {
      setLogsLoading(true);
      const params = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.action_group) params.action_group = currentFilters.action_group;
      if (currentFilters.date_from) params.date_from = currentFilters.date_from;
      if (currentFilters.date_to) params.date_to = currentFilters.date_to;
      params.page = currentFilters.page;
      params.per_page = 20;
      params.sort_dir = "desc";

      const response = await adminAPI.getLogs(params);
      const data = response.data.data;
      setLogs(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch {
      toast.error("Gagal memuat data log");
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchLogs(filters)]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchLogs(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.last_page) return;
    setExpandedRow(null);
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    setExpandedRow(null);
    fetchStats();
    fetchLogs(filters);
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", action_group: "", date_from: "", date_to: "", page: 1 });
  };

  const hasActiveFilters = filters.search || filters.action_group || filters.date_from || filters.date_to;

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  const topAction = stats?.action_breakdown?.[0];
  const topUser = stats?.active_users?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Log Aktivitas</h1>
          <p className="text-sm text-gray-600">
            Pantau semua aktivitas pengguna dan admin di platform
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={logsLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={logsLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Log</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stats.total_logs?.toLocaleString("id-ID") || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                <ScrollText size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Log Hari Ini</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stats.today_logs?.toLocaleString("id-ID") || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Activity size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aksi Terbanyak</p>
                <p className="mt-1 text-lg font-bold text-gray-900 truncate" title={topAction?.action}>
                  {topAction?.action || "-"}
                </p>
                <p className="text-xs text-gray-400">
                  {topAction ? `${topAction.count} kali` : ""}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                <Clock size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pengguna Teraktif</p>
                <p className="mt-1 text-lg font-bold text-gray-900 truncate" title={topUser?.user?.name}>
                  {topUser?.user?.name || "-"}
                </p>
                <p className="text-xs text-gray-400">
                  {topUser ? `${topUser.count} aktivitas` : ""}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                <User size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Cari pengguna, aksi, atau deskripsi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full py-2 pl-9 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Cari
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.action_group}
              onChange={(e) => handleFilterChange("action_group", e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua Grup Aksi</option>
              {stats?.group_breakdown?.map((group) => (
                <option key={group.action_group} value={group.action_group}>
                  {group.action_group} ({group.count})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                title="Dari tanggal"
              />
              <span className="text-xs text-gray-400">-</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                title="Sampai tanggal"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <X size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        {logsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ScrollText size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">Tidak ada log ditemukan</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-green-600 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                      Waktu
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                      Pengguna
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                      Aksi
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                      IP Address
                    </th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      isExpanded={expandedRow === log.id}
                      onToggle={() => toggleRow(log.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 sm:flex-row">
              <p className="text-sm text-gray-500">
                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1}-
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari{" "}
                {pagination.total.toLocaleString("id-ID")} log
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {generatePageNumbers(pagination.current_page, pagination.last_page).map(
                  (page, idx) =>
                    page === "..." ? (
                      <span key={`dots-${idx}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 text-sm rounded-lg ${
                          page === pagination.current_page
                            ? "bg-green-600 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                )}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LogRow = ({ log, isExpanded, onToggle }) => {
  const formattedDate = new Date(log.created_at).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {formatRelativeTime(log.created_at)}
          </div>
          <div className="text-xs text-gray-400">{formattedDate}</div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          {log.user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                {log.user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                <span
                  className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${getRoleBadgeClasses(
                    log.user.role
                  )}`}
                >
                  {log.user.role}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Sistem</span>
          )}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeClasses(
              log.action
            )}`}
          >
            {log.action}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-700 max-w-xs truncate" title={log.description}>
            {log.description || "-"}
          </p>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-sm text-gray-500 font-mono">{log.ip_address || "-"}</span>
        </td>
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-4 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Detail Pengguna</span>
                </div>
                {log.user ? (
                  <div className="text-sm text-gray-700 space-y-0.5">
                    <p>Nama: {log.user.name}</p>
                    <p>Username: {log.user.username}</p>
                    {log.user.phone && <p>Telepon: {log.user.phone}</p>}
                    <p>Role: {log.user.role}</p>
                    <p>User ID: {log.user_id}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Tidak tersedia</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Monitor size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Informasi Teknis</span>
                </div>
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p>IP: {log.ip_address || "-"}</p>
                  {log.model_type && <p>Model: {log.model_type}</p>}
                  {log.model_id && <p>Model ID: {log.model_id}</p>}
                  <div>
                    <div className="flex items-center gap-1 mt-1">
                      <Globe size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">User Agent:</span>
                    </div>
                    <p className="text-xs text-gray-500 break-all mt-0.5 max-w-sm">
                      {log.user_agent || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Properties</span>
                </div>
                {log.properties && Object.keys(log.properties).length > 0 ? (
                  <pre className="p-2 overflow-auto text-xs text-gray-700 bg-white border border-gray-200 rounded-lg max-h-40">
                    {JSON.stringify(log.properties, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400">Tidak ada data tambahan</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const generatePageNumbers = (current, last) => {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages = [];
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < last - 2) {
    pages.push("...");
  }

  pages.push(last);

  return pages;
};

export default AdminLogs;
