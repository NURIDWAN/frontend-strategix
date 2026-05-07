import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../services/admin/adminApi";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  DollarSign,
  TrendingUp,
  Calendar,
  X,
  AlertTriangle,
  Loader2,
  Receipt,
  BarChart3,
  Package,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Save,
  Plus,
  Trash2,
  GripVertical,
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig = {
  paid: {
    label: "Paid",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  expired: {
    label: "Expired",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  failed: {
    label: "Failed",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

const tabs = [
  { id: "transaksi", label: "Transaksi", icon: Receipt },
  { id: "paket", label: "Paket Langganan", icon: Package },
];

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState("transaksi");

  // Transaction tab state
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Package tab state
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    package_type: "monthly",
    description: "",
    price: 0,
    duration_days: 30,
    consultation_credits: 0,
    features: [],
    is_active: true,
    sort_order: 0,
  });
  const [editingPackage, setEditingPackage] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingPackage, setSavingPackage] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminAPI.getPaymentStats();
      setStats(response.data.data);
    } catch {
      toast.error("Gagal memuat statistik pembayaran");
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = { page, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const response = await adminAPI.getPayments(params);
      setPayments(response.data.data);
    } catch {
      toast.error("Gagal memuat daftar transaksi");
    } finally {
      setTableLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchPayments()]);
    setLoading(false);
  }, [fetchStats, fetchPayments]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPayments();
    }
  }, [page, statusFilter]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setPage(1);
        fetchPayments();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const openDetail = async (payment) => {
    setSelectedPayment(payment);
    setDetailData(null);
    setDetailLoading(true);
    setShowStatusUpdate(false);
    try {
      const response = await adminAPI.getPayment(payment.id);
      setDetailData(response.data.data);
    } catch {
      toast.error("Gagal memuat detail transaksi");
      setSelectedPayment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedPayment(null);
    setDetailData(null);
    setShowStatusUpdate(false);
    setUpdateStatus("");
    setUpdateNotes("");
  };

  const handleStatusUpdate = async () => {
    if (!updateStatus) {
      toast.error("Pilih status baru");
      return;
    }
    setUpdating(true);
    try {
      await adminAPI.updatePaymentStatus(detailData.id, {
        status: updateStatus,
        notes: updateNotes,
      });
      toast.success("Status transaksi berhasil diperbarui");
      setShowStatusUpdate(false);
      setUpdateStatus("");
      setUpdateNotes("");
      await Promise.all([fetchStats(), fetchPayments()]);
      const response = await adminAPI.getPayment(detailData.id);
      setDetailData(response.data.data);
    } catch {
      toast.error("Gagal memperbarui status transaksi");
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // Package Management Functions
  // ==========================================

  const fetchPackages = useCallback(async () => {
    try {
      setPackagesLoading(true);
      const response = await adminAPI.getPackages();
      setPackages(response.data.data || []);
    } catch {
      toast.error("Gagal memuat daftar paket");
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "paket" && packages.length === 0) {
      fetchPackages();
    }
  }, [activeTab]);

  const openCreateModal = (typeOrEvent) => {
    const isEvent = typeOrEvent && typeof typeOrEvent === "object" && typeOrEvent.nativeEvent;
    const type = typeof typeOrEvent === "string" ? typeOrEvent : "monthly";

    setIsCreateModalOpen(true);
    setCreateForm({
      name: "",
      package_type: type,
      description: "",
      price: 0,
      duration_days: type === "consultation" ? 0 : 30,
      consultation_credits: type === "consultation" ? 1 : 0,
      features: [],
      is_active: true,
      sort_order: 0,
    });
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateFeatureChange = (index, value) => {
    setCreateForm((prev) => {
      const features = [...(prev.features || [])];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addCreateFeature = () => {
    setCreateForm((prev) => ({
      ...prev,
      features: [...(prev.features || []), ""],
    }));
  };

  const removeCreateFeature = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleCreatePackage = async () => {
    if (!createForm.name?.trim()) {
      toast.error("Nama paket wajib diisi");
      return;
    }
    if (createForm.price < 0) {
      toast.error("Harga tidak boleh negatif");
      return;
    }
    if (createForm.duration_days < 1) {
      toast.error("Durasi minimal 1 hari");
      return;
    }

    setSavingPackage(true);
    try {
      const data = {
        ...createForm,
        price: parseInt(createForm.price, 10),
        duration_days: parseInt(createForm.duration_days, 10),
        consultation_credits: parseInt(createForm.consultation_credits || 0, 10),
        sort_order: parseInt(createForm.sort_order, 10),
        features: (createForm.features || []).filter((f) => f.trim() !== ""),
      };
      await adminAPI.createPackage(data);
      toast.success("Paket baru berhasil dibuat");
      closeCreateModal();
      fetchPackages();
    } catch {
      toast.error("Gagal membuat paket baru");
    } finally {
      setSavingPackage(false);
    }
  };

  const openEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setEditForm({
      name: pkg.name || "",
      package_type: pkg.package_type || "monthly",
      description: pkg.description || "",
      price: pkg.price || 0,
      duration_days: pkg.duration_days || 30,
      consultation_credits: pkg.consultation_credits || 0,
      features: pkg.features || [],
      is_active: pkg.is_active ?? true,
      sort_order: pkg.sort_order || 0,
    });
  };

  const closeEditPackage = () => {
    setEditingPackage(null);
    setEditForm({});
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, value) => {
    setEditForm((prev) => {
      const features = [...(prev.features || [])];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setEditForm((prev) => ({
      ...prev,
      features: [...(prev.features || []), ""],
    }));
  };

  const removeFeature = (index) => {
    setEditForm((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const toggleSystemFeature = (formType, featureKey) => {
    if (formType === "create") {
      setCreateForm((prev) => {
        const features = prev.features || [];
        const newFeatures = features.includes(featureKey)
          ? features.filter((f) => f !== featureKey)
          : [...features, featureKey];
        return { ...prev, features: newFeatures };
      });
    } else {
      setEditForm((prev) => {
        const features = prev.features || [];
        const newFeatures = features.includes(featureKey)
          ? features.filter((f) => f !== featureKey)
          : [...features, featureKey];
        return { ...prev, features: newFeatures };
      });
    }
  };

  const handleSavePackage = async () => {
    if (!editingPackage) return;
    if (!editForm.name?.trim()) {
      toast.error("Nama paket wajib diisi");
      return;
    }
    if (editForm.price < 0) {
      toast.error("Harga tidak boleh negatif");
      return;
    }
    if (editForm.duration_days < 1) {
      toast.error("Durasi minimal 1 hari");
      return;
    }

    setSavingPackage(true);
    try {
      const data = {
        ...editForm,
        price: parseInt(editForm.price, 10),
        duration_days: parseInt(editForm.duration_days, 10),
        consultation_credits: parseInt(editForm.consultation_credits || 0, 10),
        sort_order: parseInt(editForm.sort_order, 10),
        features: (editForm.features || []).filter((f) => f.trim() !== ""),
      };
      await adminAPI.updatePackage(editingPackage.id, data);
      toast.success("Paket berhasil diperbarui");
      closeEditPackage();
      fetchPackages();
    } catch {
      toast.error("Gagal memperbarui paket");
    } finally {
      setSavingPackage(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    setTogglingId(pkg.id);
    try {
      await adminAPI.updatePackage(pkg.id, { is_active: !pkg.is_active });
      toast.success(
        `Paket ${pkg.name} ${!pkg.is_active ? "diaktifkan" : "dinonaktifkan"}`
      );
      fetchPackages();
    } catch {
      toast.error("Gagal mengubah status paket");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"?`)) {
      return;
    }

    try {
      const response = await adminAPI.deletePackage(pkg.id);
      toast.success(response.data.message || "Paket berhasil dihapus");
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus paket");
    }
  };

  const chartData = (stats?.monthly_revenue || []).map((item) => {
    const [year, month] = item.month.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return {
      name: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
      pendapatan: item.total,
      transaksi: item.count,
    };
  });

  const ChartTooltipContent = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm text-gray-600">
            {entry.name === "pendapatan"
              ? `Pendapatan: ${formatCurrency(entry.value)}`
              : `Transaksi: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  const paymentsList = payments?.data || [];
  const currentPage = payments?.current_page || 1;
  const lastPage = payments?.last_page || 1;
  const total = payments?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Manajemen Pembayaran
          </h1>
          <p className="text-sm text-gray-600">
            Kelola transaksi dan paket langganan pengguna
          </p>
        </div>
        <button
          onClick={activeTab === "transaksi" ? fetchAll : fetchPackages}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "transaksi" ? (
        <TransactionTabContent
          stats={stats}
          chartData={chartData}
          ChartTooltipContent={ChartTooltipContent}
          paymentsList={paymentsList}
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          setPage={setPage}
          tableLoading={tableLoading}
          openDetail={openDetail}
        />
      ) : (
        <PackageTabContent
          packages={packages}
          packagesLoading={packagesLoading}
          togglingId={togglingId}
          handleToggleActive={handleToggleActive}
          openEditPackage={openEditPackage}
          openCreateModal={openCreateModal}
          handleDeletePackage={handleDeletePackage}
        />
      )}

      {/* Transaction Detail Modal */}
      {activeTab === "transaksi" && selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Transaksi
              </h3>
              <button
                onClick={closeDetail}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
              ) : detailData ? (
                <div className="space-y-5">
                  {/* Transaction Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Informasi Transaksi
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Kode Transaksi</p>
                        <p className="text-sm font-mono font-medium text-gray-900 mt-0.5">
                          {detailData.transaction_code}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="mt-1">
                          <StatusBadge status={detailData.status} />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Jumlah</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {formatCurrency(detailData.amount_paid)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Metode Pembayaran</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 uppercase">
                          {detailData.payment_method || "-"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Tipe Paket</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">
                          {detailData.package_type || "-"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Dibuat</p>
                        <p className="text-sm text-gray-900 mt-0.5">
                          {formatDate(detailData.created_at)}
                        </p>
                      </div>
                      {detailData.paid_at && (
                        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                          <p className="text-xs text-gray-500">
                            Dibayar Pada
                          </p>
                          <p className="text-sm text-gray-900 mt-0.5">
                            {formatDate(detailData.paid_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  {detailData.user && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Informasi Pengguna
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Nama</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {detailData.user.name}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Telepon</p>
                          <p className="text-sm text-gray-900 mt-0.5">
                            {detailData.user.phone || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Premium PDF Info */}
                  {detailData.premium_pdf && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Produk
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Nama Produk</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {detailData.premium_pdf.name}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Harga</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {formatCurrency(detailData.premium_pdf.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Singapay / Payment Transaction Raw Data */}
                  {detailData.payment_transaction && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Data Payment Gateway (Singapay)
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                          {JSON.stringify(
                            detailData.payment_transaction,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  {!showStatusUpdate ? (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setShowStatusUpdate(true);
                          setUpdateStatus(detailData.status);
                        }}
                        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ubah Status Transaksi
                      </button>
                    </div>
                  ) : (
                    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle size={16} />
                        <span className="text-sm font-medium">
                          Konfirmasi Perubahan Status
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status Baru
                        </label>
                        <select
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="expired">Expired</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catatan
                        </label>
                        <textarea
                          value={updateNotes}
                          onChange={(e) => setUpdateNotes(e.target.value)}
                          rows={3}
                          placeholder="Tambahkan catatan perubahan status..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleStatusUpdate}
                          disabled={updating}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          Simpan Perubahan
                        </button>
                        <button
                          onClick={() => {
                            setShowStatusUpdate(false);
                            setUpdateStatus("");
                            setUpdateNotes("");
                          }}
                          disabled={updating}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Package Edit Modal */}
      {editingPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEditPackage}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Paket: {editingPackage.name}
              </h3>
              <button
                onClick={closeEditPackage}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Paket *
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Paket *
                  </label>
                  <select
                    value={editForm.package_type || "monthly"}
                    onChange={(e) =>
                      handleEditFormChange("package_type", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="consultation">Consultation (Sesi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.price ?? 0}
                    onChange={(e) =>
                      handleEditFormChange("price", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {createForm.package_type === 'consultation' ? 'Durasi per Sesi (Menit) *' : 'Durasi (hari, 0 = no limit) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.duration_days ?? 30}
                    onChange={(e) =>
                      handleEditFormChange("duration_days", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kredit Konsultasi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.consultation_credits ?? 0}
                    onChange={(e) =>
                      handleEditFormChange("consultation_credits", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.sort_order ?? 0}
                    onChange={(e) =>
                      handleEditFormChange("sort_order", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleEditFormChange("is_active", !editForm.is_active)
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    editForm.is_active
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-gray-50 border-gray-300 text-gray-500"
                  }`}
                >
                  {editForm.is_active ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                  {editForm.is_active ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              {/* Features - Gated System Features */}
              <div className="mb-4 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                <label className="block text-sm font-medium text-blue-900 mb-3">
                  Hak Akses Fitur Sistem (Gated Features)
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={(editForm.features || []).includes("feature_forecast")}
                        onChange={() => toggleSystemFeature("edit", "feature_forecast")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Forecast Keuangan</span>
                      <span className="text-xs text-gray-500">Membuka akses modul Forecast Keuangan.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={(editForm.features || []).includes("feature_pdf_export")}
                        onChange={() => toggleSystemFeature("edit", "feature_pdf_export")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Export PDF Lengkap</span>
                      <span className="text-xs text-gray-500">Membuka akses download Business Plan & Laporan Keuangan dalam PDF.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Features - Custom Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Label Fitur Pemasaran (Untuk Halaman Harga)
                  </label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Plus size={12} />
                    Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {(editForm.features || []).map((feature, index) => {
                    // Sembunyikan system features dari list custom text input
                    if (["feature_forecast", "feature_pdf_export"].includes(feature)) {
                      return null;
                    }
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <GripVertical
                          size={14}
                          className="text-gray-300 flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(index, e.target.value)
                          }
                          placeholder={`Teks Fitur ${index + 1}`}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {(editForm.features || []).filter(f => !["feature_forecast", "feature_pdf_export"].includes(f)).length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">
                      Belum ada teks label. Klik &quot;Tambah&quot; untuk menambahkan teks kustom.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                onClick={closeEditPackage}
                disabled={savingPackage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSavePackage}
                disabled={savingPackage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingPackage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Create Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCreateModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Tambah Paket Baru
              </h3>
              <button
                onClick={closeCreateModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Paket *
                </label>
                <input
                  type="text"
                  value={createForm.name || ""}
                  onChange={(e) =>
                    handleCreateFormChange("name", e.target.value)
                  }
                  placeholder="Contoh: Paket Bulanan Pro"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                  <span className="text-xs text-gray-400 ml-1">
                    (Maksimal 255 karakter)
                  </span>
                </label>
                <textarea
                  value={createForm.description || ""}
                  onChange={(e) =>
                    handleCreateFormChange("description", e.target.value)
                  }
                  rows={2}
                  placeholder="Jelaskan secara singkat mengenai paket ini..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Paket *
                  </label>
                  <select
                    value={createForm.package_type || "monthly"}
                    onChange={(e) =>
                      handleCreateFormChange("package_type", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="consultation">Consultation (Sesi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.price ?? 0}
                    onChange={(e) =>
                      handleCreateFormChange("price", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editForm.package_type === 'consultation' ? 'Durasi per Sesi (Menit) *' : 'Durasi (hari, 0 = no limit) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.duration_days ?? 30}
                    onChange={(e) =>
                      handleCreateFormChange("duration_days", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kredit Konsultasi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.consultation_credits ?? 0}
                    onChange={(e) =>
                      handleCreateFormChange("consultation_credits", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.sort_order ?? 0}
                    onChange={(e) =>
                      handleCreateFormChange("sort_order", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleCreateFormChange("is_active", !createForm.is_active)
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    createForm.is_active
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-gray-50 border-gray-300 text-gray-500"
                  }`}
                >
                  {createForm.is_active ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                  {createForm.is_active ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              {/* Features - Gated System Features */}
              <div className="mb-4 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                <label className="block text-sm font-medium text-blue-900 mb-3">
                  Hak Akses Fitur Sistem (Gated Features)
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={(createForm.features || []).includes("feature_forecast")}
                        onChange={() => toggleSystemFeature("create", "feature_forecast")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Forecast Keuangan</span>
                      <span className="text-xs text-gray-500">Membuka akses modul Forecast Keuangan.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={(createForm.features || []).includes("feature_pdf_export")}
                        onChange={() => toggleSystemFeature("create", "feature_pdf_export")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Export PDF Lengkap</span>
                      <span className="text-xs text-gray-500">Membuka akses download Business Plan & Laporan Keuangan dalam PDF.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Features - Custom Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Label Fitur Pemasaran (Untuk Halaman Harga)
                  </label>
                  <button
                    type="button"
                    onClick={addCreateFeature}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Plus size={12} />
                    Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {(createForm.features || []).map((feature, index) => {
                    if (["feature_forecast", "feature_pdf_export"].includes(feature)) {
                      return null;
                    }
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <GripVertical
                          size={14}
                          className="text-gray-300 flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleCreateFeatureChange(index, e.target.value)
                          }
                          placeholder={`Teks Fitur ${index + 1}`}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeCreateFeature(index)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {(createForm.features || []).filter(f => !["feature_forecast", "feature_pdf_export"].includes(f)).length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">
                      Belum ada teks label. Klik &quot;Tambah&quot; untuk menambahkan teks kustom.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={closeCreateModal}
                disabled={savingPackage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePackage}
                disabled={savingPackage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {savingPackage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Tambah Paket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Transaction Tab Content
// ==========================================
const TransactionTabContent = ({
  stats,
  chartData,
  ChartTooltipContent,
  paymentsList,
  currentPage,
  lastPage,
  total,
  perPage,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  tableLoading,
  openDetail,
}) => (
  <>
    {/* Stats Cards */}
    {stats && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pendapatan</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total_revenue)}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendapatan Bulan Ini</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(stats.month_revenue)}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendapatan Hari Ini</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(stats.today_revenue)}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.total_transactions || 0}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100">
              <Receipt size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Monthly Revenue Chart */}
    {chartData.length > 0 && (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Pendapatan Bulanan
          </h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(0)}jt`
                    : v >= 1000
                    ? `${(v / 1000).toFixed(0)}rb`
                    : v
                }
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="pendapatan"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
                name="pendapatan"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}

    {/* Status Summary */}
    {stats?.status_counts && (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div
            key={key}
            className={`flex items-center justify-between p-3 rounded-lg border ${config.bg} ${config.border}`}
          >
            <span className={`text-sm font-medium ${config.text}`}>
              {config.label}
            </span>
            <span className={`text-lg font-bold ${config.text}`}>
              {stats.status_counts[key] || 0}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Transaction Table */}
    <div className="bg-white border border-gray-200 rounded-xl">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Transaksi
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {tableLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      ) : paymentsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <CreditCard size={48} className="mb-3" />
          <p className="text-base font-medium text-gray-500">
            Tidak ada transaksi ditemukan
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {search || statusFilter
              ? "Coba ubah filter pencarian"
              : "Belum ada transaksi yang tercatat"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode Transaksi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metode
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentsList.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(payment)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {payment.transaction_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.user?.name || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.user?.phone || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 capitalize">
                        {payment.package_type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 uppercase">
                        {payment.payment_method || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount_paid)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(payment);
                        }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                {(currentPage - 1) * perPage + 1}-
                {Math.min(currentPage * perPage, total)}{" "}
                dari {total} transaksi
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === lastPage ||
                      Math.abs(p - currentPage) <= 1
                  )
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) {
                      acc.push("ellipsis-" + p);
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p) =>
                    typeof p === "string" ? (
                      <span
                        key={p}
                        className="px-2 text-gray-400 text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`min-w-[32px] h-8 text-sm rounded-lg transition-colors ${
                          p === currentPage
                            ? "bg-green-600 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </>
);

// ==========================================
// Package Tab Content
// ==========================================
const PackageTabContent = ({
  packages,
  packagesLoading,
  togglingId,
  handleToggleActive,
  openEditPackage,
  openCreateModal,
  handleDeletePackage,
}) => {
  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
        <Package size={48} className="mb-3" />
        <p className="text-base font-medium text-gray-500">
          Belum ada paket langganan
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Paket dapat dibuat melalui database atau seeder
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Header with Action */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Paket Langganan
          </h2>
        </div>
      </div>

      {/* Package Cards Grouped */}
      {[
        { title: "Langganan Sistem & Ekspor", match: p => p.package_type !== 'consultation', color: 'blue', typeId: 'monthly' },
        { title: "Produk Tambahan Sekali Beli (Kredit Konsultasi)", match: p => p.package_type === 'consultation', color: 'orange', typeId: 'consultation' }
      ].map((group, gIdx) => (
        <div key={gIdx} className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-gray-50/50">
            <h3 className={`text-sm font-bold px-3 py-1.5 rounded-lg ${group.color === 'blue' ? 'text-blue-900 bg-blue-100/50' : 'text-orange-900 bg-orange-100/50'}`}>
              {group.title}
            </h3>
            <button
              onClick={() => openCreateModal(group.typeId)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm whitespace-nowrap ${group.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              <Plus size={16} />
              {group.typeId === 'consultation' ? 'Tambah Kredit Konsultasi' : 'Tambah Paket'}
            </button>
          </div>
          {packages.filter(group.match).length === 0 && (
             <p className="text-sm text-gray-500 ml-2 italic">Belum ada produk terdaftar untuk kategori ini.</p>
          )}
          {packages.filter(group.match).map((pkg) => (
        <div
          key={pkg.id}
          className={`bg-white border rounded-xl overflow-hidden transition-colors ${
            pkg.is_active
              ? "border-gray-200"
              : "border-gray-200 opacity-60"
          }`}
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Package Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pkg.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      pkg.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {pkg.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                  {pkg.package_type && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                      {pkg.package_type}
                    </span>
                  )}
                </div>

                {pkg.description && (
                  <p className="text-sm text-gray-500 mb-3">
                    {pkg.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Harga: </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Durasi: </span>
                    <span className="font-medium text-gray-900">
                      {pkg.package_type === 'consultation'
                        ? `${pkg.duration_days} menit / sesi`
                        : `${pkg.duration_days} hari ${pkg.duration_days >= 365 ? ` (${Math.round(pkg.duration_days / 365)} tahun)` : pkg.duration_days >= 28 ? ` (${Math.round(pkg.duration_days / 30)} bulan)` : ""}`
                      }
                    </span>
                  </div>
                  {pkg.package_type === 'consultation' && (
                    <div>
                      <span className="text-gray-500">Kredit: </span>
                      <span className="font-medium text-gray-900">
                        {pkg.consultation_credits} Sesi
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Pembelian: </span>
                    <span className="font-medium text-gray-900">
                      {pkg.purchases_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Urutan: </span>
                    <span className="font-medium text-gray-900">
                      {pkg.sort_order || 0}
                    </span>
                  </div>
                </div>

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">
                      Fitur:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.features.map((feature, i) => {
                        let displayLabel = feature;
                        let isSystemFeature = false;
                        
                        if (feature === "feature_forecast") {
                          displayLabel = "Akses Forecast Keuangan";
                          isSystemFeature = true;
                        }
                        if (feature === "feature_pdf_export") {
                          displayLabel = "Akses Export PDF Lengkap";
                          isSystemFeature = true;
                        }
                        
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              isSystemFeature 
                                ? "bg-blue-100 text-blue-700 font-medium border border-blue-200"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {displayLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(pkg)}
                  disabled={togglingId === pkg.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                    pkg.is_active
                      ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                      : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
                  title={pkg.is_active ? "Nonaktifkan" : "Aktifkan"}
                >
                  {togglingId === pkg.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : pkg.is_active ? (
                    <ToggleRight size={14} />
                  ) : (
                    <ToggleLeft size={14} />
                  )}
                  {pkg.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>

                <button
                  onClick={() => openEditPackage(pkg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Hapus Paket"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
        </div>
      ))}
    </div>
  );
};

export default AdminPayments;
