import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../services/admin/adminApi";
import { toast } from "react-toastify";
import {
  Link2,
  Users,
  DollarSign,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StatusBadge = ({ status, type }) => {
  const colors = {
    commission: {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      paid: "bg-green-100 text-green-700",
    },
    withdrawal: {
      pending: "bg-yellow-100 text-yellow-700",
      processed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      rejected: "bg-red-100 text-red-700",
    },
    link: {
      true: "bg-green-100 text-green-700",
      false: "bg-gray-100 text-gray-500",
    },
  };

  const labels = {
    commission: { pending: "Pending", approved: "Disetujui", paid: "Dibayar" },
    withdrawal: {
      pending: "Pending",
      processed: "Diproses",
      failed: "Gagal",
      rejected: "Ditolak",
    },
    link: { true: "Aktif", false: "Nonaktif" },
  };

  const colorClass =
    colors[type]?.[String(status)] || "bg-gray-100 text-gray-600";
  const label = labels[type]?.[String(status)] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
};

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Halaman {currentPage} dari {lastPage}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const AdminAffiliates = () => {
  const [activeTab, setActiveTab] = useState("affiliates");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Affiliates tab state
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesPage, setAffiliatesPage] = useState(1);
  const [affiliatesLastPage, setAffiliatesLastPage] = useState(1);
  const [affiliatesSearch, setAffiliatesSearch] = useState("");
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);

  // Commissions tab state
  const [commissions, setCommissions] = useState([]);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [commissionsLastPage, setCommissionsLastPage] = useState(1);
  const [commissionsStatus, setCommissionsStatus] = useState("");
  const [commissionsLoading, setCommissionsLoading] = useState(false);

  // Withdrawals tab state
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [withdrawalsLastPage, setWithdrawalsLastPage] = useState(1);
  const [withdrawalsStatus, setWithdrawalsStatus] = useState("");
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);

  // Detail modal state
  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmNotes, setConfirmNotes] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminAPI.getAffiliateStats();
      setStats(response.data.data);
    } catch {
      toast.error("Gagal memuat statistik affiliate");
    }
  }, []);

  const fetchAffiliates = useCallback(
    async (page = 1) => {
      try {
        setAffiliatesLoading(true);
        const response = await adminAPI.getAffiliates({
          page,
          per_page: 15,
          search: affiliatesSearch || undefined,
        });
        const data = response.data.data;
        setAffiliates(data.data || []);
        setAffiliatesPage(data.current_page);
        setAffiliatesLastPage(data.last_page);
      } catch {
        toast.error("Gagal memuat daftar affiliate");
      } finally {
        setAffiliatesLoading(false);
      }
    },
    [affiliatesSearch]
  );

  const fetchCommissions = useCallback(
    async (page = 1) => {
      try {
        setCommissionsLoading(true);
        const response = await adminAPI.getCommissions({
          page,
          per_page: 15,
          status: commissionsStatus || undefined,
        });
        const data = response.data.data;
        setCommissions(data.data || []);
        setCommissionsPage(data.current_page);
        setCommissionsLastPage(data.last_page);
      } catch {
        toast.error("Gagal memuat data komisi");
      } finally {
        setCommissionsLoading(false);
      }
    },
    [commissionsStatus]
  );

  const fetchWithdrawals = useCallback(
    async (page = 1) => {
      try {
        setWithdrawalsLoading(true);
        const response = await adminAPI.getWithdrawals({
          page,
          per_page: 15,
          status: withdrawalsStatus || undefined,
        });
        const data = response.data.data;
        setWithdrawals(data.data || []);
        setWithdrawalsPage(data.current_page);
        setWithdrawalsLastPage(data.last_page);
      } catch {
        toast.error("Gagal memuat data penarikan");
      } finally {
        setWithdrawalsLoading(false);
      }
    },
    [withdrawalsStatus]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStats();
      await fetchAffiliates(1);
      setLoading(false);
    };
    init();
  }, [fetchStats, fetchAffiliates]);

  useEffect(() => {
    if (activeTab === "affiliates") fetchAffiliates(1);
    else if (activeTab === "commissions") fetchCommissions(1);
    else if (activeTab === "withdrawals") fetchWithdrawals(1);
  }, [activeTab, fetchAffiliates, fetchCommissions, fetchWithdrawals]);

  const handleRefresh = async () => {
    await fetchStats();
    if (activeTab === "affiliates") await fetchAffiliates(affiliatesPage);
    else if (activeTab === "commissions") await fetchCommissions(commissionsPage);
    else if (activeTab === "withdrawals") await fetchWithdrawals(withdrawalsPage);
    toast.success("Data berhasil diperbarui");
  };

  const handleAffiliatesSearch = (e) => {
    e.preventDefault();
    fetchAffiliates(1);
  };

  const openDetail = async (userId) => {
    try {
      setDetailModal(true);
      setDetailLoading(true);
      const response = await adminAPI.getAffiliate(userId);
      setDetailData(response.data.data);
    } catch {
      toast.error("Gagal memuat detail affiliate");
      setDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openConfirmModal = (action) => {
    setConfirmAction(action);
    setConfirmNotes("");
    setConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      setConfirmLoading(true);
      const { type, id, status } = confirmAction;
      if (type === "commission") {
        await adminAPI.updateCommissionStatus(id, {
          status,
          notes: confirmNotes,
        });
        toast.success("Status komisi berhasil diperbarui");
        fetchCommissions(commissionsPage);
      } else if (type === "withdrawal") {
        await adminAPI.updateWithdrawalStatus(id, {
          status,
          notes: confirmNotes,
        });
        toast.success("Status penarikan berhasil diperbarui");
        fetchWithdrawals(withdrawalsPage);
      }
      await fetchStats();
      setConfirmModal(false);
      setConfirmAction(null);
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (!confirmAction) return "";
    const { type, status } = confirmAction;
    if (type === "commission") {
      if (status === "approved") return "Setujui Komisi";
      if (status === "paid") return "Tandai Sudah Dibayar";
    }
    if (type === "withdrawal") {
      if (status === "processed") return "Proses Penarikan";
      if (status === "rejected") return "Tolak Penarikan";
    }
    return "Konfirmasi";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { key: "affiliates", label: "Affiliasi" },
    { key: "commissions", label: "Komisi" },
    { key: "withdrawals", label: "Penarikan" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Manajemen Affiliate
          </h1>
          <p className="text-sm text-gray-600">
            Kelola program affiliate, komisi, dan penarikan
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Affiliate</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.total_affiliates || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                <Users size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Link Aktif</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.active_links || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Link2 size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Referral</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.total_referrals || 0}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                <TrendingUp size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Komisi</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.commissions?.paid || 0)}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Penarikan Pending</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.withdrawals?.pending || 0)}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl">
                <Wallet size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "affiliates" && (
        <div className="bg-white border border-gray-200 rounded-xl">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleAffiliatesSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                />
                <input
                  type="text"
                  placeholder="Cari nama atau username..."
                  value={affiliatesSearch}
                  onChange={(e) => setAffiliatesSearch(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Table */}
          {affiliatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : affiliates.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada data affiliate</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Nama
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Username
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Referral
                      </th>
                      <th className="px-4 py-3 font-medium text-right text-gray-600">
                        Komisi Diperoleh
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Status Link
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((aff) => (
                      <tr
                        key={aff.id}
                        className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                        onClick={() => openDetail(aff.id)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {aff.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {aff.username || "-"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">
                          {aff.referrals_count || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatCurrency(aff.total_commission)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge
                            status={!!aff.affiliate_link?.is_active}
                            type="link"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(aff.id);
                            }}
                            className="p-1.5 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-green-600"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={affiliatesPage}
                lastPage={affiliatesLastPage}
                onPageChange={(p) => fetchAffiliates(p)}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "commissions" && (
        <div className="bg-white border border-gray-200 rounded-xl">
          {/* Filter */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={commissionsStatus}
              onChange={(e) => {
                setCommissionsStatus(e.target.value);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="approved">Disetujui</option>
              <option value="paid">Dibayar</option>
            </select>
          </div>

          {/* Table */}
          {commissionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : commissions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <DollarSign size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada data komisi</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Affiliate
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Referral
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Transaksi
                      </th>
                      <th className="px-4 py-3 font-medium text-right text-gray-600">
                        Jumlah Komisi
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((comm) => (
                      <tr
                        key={comm.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {comm.affiliate_user?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {comm.referred_user?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {comm.purchase?.package_name ||
                            comm.purchase?.id ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-right text-gray-900">
                          {formatCurrency(comm.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge
                            status={comm.status}
                            type="commission"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(comm.created_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {comm.status === "pending" && (
                              <button
                                onClick={() =>
                                  openConfirmModal({
                                    type: "commission",
                                    id: comm.id,
                                    status: "approved",
                                    label: `Setujui komisi ${formatCurrency(comm.amount)} untuk ${comm.affiliate_user?.name || "affiliate"}`,
                                  })
                                }
                                className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50"
                                title="Setujui"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {comm.status === "approved" && (
                              <button
                                onClick={() =>
                                  openConfirmModal({
                                    type: "commission",
                                    id: comm.id,
                                    status: "paid",
                                    label: `Tandai komisi ${formatCurrency(comm.amount)} sudah dibayar ke ${comm.affiliate_user?.name || "affiliate"}`,
                                  })
                                }
                                className="p-1.5 text-green-600 rounded-lg hover:bg-green-50"
                                title="Tandai Dibayar"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={commissionsPage}
                lastPage={commissionsLastPage}
                onPageChange={(p) => fetchCommissions(p)}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "withdrawals" && (
        <div className="bg-white border border-gray-200 rounded-xl">
          {/* Filter */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={withdrawalsStatus}
              onChange={(e) => {
                setWithdrawalsStatus(e.target.value);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="processed">Diproses</option>
              <option value="rejected">Ditolak</option>
              <option value="failed">Gagal</option>
            </select>
          </div>

          {/* Table */}
          {withdrawalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Wallet size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada data penarikan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Pengguna
                      </th>
                      <th className="px-4 py-3 font-medium text-right text-gray-600">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Bank
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        No. Rekening
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-left text-gray-600">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 font-medium text-center text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((wd) => (
                      <tr
                        key={wd.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {wd.user?.name || "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-right text-gray-900">
                          {formatCurrency(wd.amount)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {wd.bank_name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>
                            <p>{wd.account_number || "-"}</p>
                            {wd.account_name && (
                              <p className="text-xs text-gray-400">
                                {wd.account_name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge
                            status={wd.status}
                            type="withdrawal"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(wd.created_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {wd.status === "pending" && (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() =>
                                  openConfirmModal({
                                    type: "withdrawal",
                                    id: wd.id,
                                    status: "processed",
                                    label: `Proses penarikan ${formatCurrency(wd.amount)} untuk ${wd.user?.name || "pengguna"}`,
                                  })
                                }
                                className="p-1.5 text-green-600 rounded-lg hover:bg-green-50"
                                title="Proses"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  openConfirmModal({
                                    type: "withdrawal",
                                    id: wd.id,
                                    status: "rejected",
                                    label: `Tolak penarikan ${formatCurrency(wd.amount)} dari ${wd.user?.name || "pengguna"}`,
                                  })
                                }
                                className="p-1.5 text-red-600 rounded-lg hover:bg-red-50"
                                title="Tolak"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={withdrawalsPage}
                lastPage={withdrawalsLastPage}
                onPageChange={(p) => fetchWithdrawals(p)}
              />
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Affiliate
              </h3>
              <button
                onClick={() => {
                  setDetailModal(false);
                  setDetailData(null);
                }}
                className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-5 overflow-y-auto">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
              ) : detailData ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Informasi Pengguna
                    </h4>
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-xs text-gray-500">Nama</p>
                        <p className="font-medium text-gray-900">
                          {detailData.user?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Slug Link</p>
                        <p className="font-medium text-gray-900">
                          {detailData.user?.affiliate_link?.slug || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status Link</p>
                        <StatusBadge
                          status={!!detailData.user?.affiliate_link?.is_active}
                          type="link"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Klik Link</p>
                        <p className="font-medium text-gray-900">
                          {detailData.user?.affiliate_link?.click_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Ringkasan
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="p-3 text-center rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500">Total Referral</p>
                        <p className="text-lg font-bold text-gray-900">
                          {detailData.summary?.total_referrals || 0}
                        </p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-green-50">
                        <p className="text-xs text-gray-500">Total Diperoleh</p>
                        <p className="text-lg font-bold text-green-700">
                          {formatCurrency(detailData.summary?.total_earned)}
                        </p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-blue-50">
                        <p className="text-xs text-gray-500">Total Dibayar</p>
                        <p className="text-lg font-bold text-blue-700">
                          {formatCurrency(detailData.summary?.total_paid)}
                        </p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-yellow-50">
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="text-lg font-bold text-yellow-700">
                          {formatCurrency(detailData.summary?.total_pending)}
                        </p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-purple-50">
                        <p className="text-xs text-gray-500">Saldo</p>
                        <p className="text-lg font-bold text-purple-700">
                          {formatCurrency(detailData.summary?.balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Referrals */}
                  {detailData.user?.referrals &&
                    detailData.user.referrals.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Referral ({detailData.user.referrals.length})
                        </h4>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-3 py-2 font-medium text-left text-gray-600">
                                  Nama
                                </th>
                                <th className="px-3 py-2 font-medium text-left text-gray-600">
                                  Tanggal
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailData.user.referrals.map((ref, idx) => (
                                <tr
                                  key={ref.id || idx}
                                  className="border-t border-gray-100"
                                >
                                  <td className="px-3 py-2 text-gray-900">
                                    {ref.name || ref.username || "-"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {formatDate(ref.created_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Commissions */}
                  {detailData.user?.affiliate_commissions &&
                    detailData.user.affiliate_commissions.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Komisi ({detailData.user.affiliate_commissions.length})
                        </h4>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-3 py-2 font-medium text-right text-gray-600">
                                  Jumlah
                                </th>
                                <th className="px-3 py-2 font-medium text-center text-gray-600">
                                  Status
                                </th>
                                <th className="px-3 py-2 font-medium text-left text-gray-600">
                                  Tanggal
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailData.user.affiliate_commissions.map(
                                (comm, idx) => (
                                  <tr
                                    key={comm.id || idx}
                                    className="border-t border-gray-100"
                                  >
                                    <td className="px-3 py-2 font-medium text-right text-gray-900">
                                      {formatCurrency(comm.amount)}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <StatusBadge
                                        status={comm.status}
                                        type="commission"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">
                                      {formatDate(comm.created_at)}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Withdrawals */}
                  {detailData.withdrawals &&
                    detailData.withdrawals.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Penarikan ({detailData.withdrawals.length})
                        </h4>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-3 py-2 font-medium text-right text-gray-600">
                                  Jumlah
                                </th>
                                <th className="px-3 py-2 font-medium text-left text-gray-600">
                                  Bank
                                </th>
                                <th className="px-3 py-2 font-medium text-center text-gray-600">
                                  Status
                                </th>
                                <th className="px-3 py-2 font-medium text-left text-gray-600">
                                  Tanggal
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailData.withdrawals.map((wd, idx) => (
                                <tr
                                  key={wd.id || idx}
                                  className="border-t border-gray-100"
                                >
                                  <td className="px-3 py-2 font-medium text-right text-gray-900">
                                    {formatCurrency(wd.amount)}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {wd.bank_name || "-"}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <StatusBadge
                                      status={wd.status}
                                      type="withdrawal"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {formatDate(wd.created_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  Data tidak ditemukan
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white shadow-xl rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                  <AlertTriangle size={20} className="text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getConfirmTitle()}
                </h3>
              </div>
              <button
                onClick={() => {
                  setConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                {confirmAction?.label}
              </p>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Catatan (opsional)
                </label>
                <textarea
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => {
                  setConfirmModal(false);
                  setConfirmAction(null);
                }}
                disabled={confirmLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                  confirmAction?.status === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {confirmLoading && (
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                )}
                {confirmLoading ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAffiliates;
