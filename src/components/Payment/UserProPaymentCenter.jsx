import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, RefreshCw, ShieldCheck, ShieldX, Clock3, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import singapayApi from "../../services/singapayApi";
import PdfProPaymentModal from "../ManagementFinancial/ExportPDFLengkap/PdfProPaymentModal";
import { emitPaymentPendingCounts } from "../../utils/paymentEvents";

const UserProPaymentCenter = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [cancellingCode, setCancellingCode] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [accessRes, subscriptionRes, packagesRes, historyRes] = await Promise.all([
        singapayApi.checkAccess(),
        singapayApi.getSubscription(),
        singapayApi.getPackages(),
        singapayApi.getHistory(),
      ]);

      const accessPayload = accessRes?.data || {};
      const subscriptionPayload = subscriptionRes?.data || {};
      const packagePayload = packagesRes?.data || {};
      const historyPayload = historyRes?.data || {};

      setHasAccess(!!accessPayload.has_access);
      setSubscription(subscriptionPayload.subscription || null);

      const allPackages = packagePayload.data || packagePayload.packages || [];
      setPackages(allPackages.filter((pkg) => pkg.package_type !== "consultation"));

      const allHistory = historyPayload.data || [];
      const proHistory = allHistory.filter((item) => item.package_type !== "consultation");
      setHistory(proHistory);

      emitPaymentPendingCounts({
        pro: proHistory.filter((item) => item.status === "pending").length,
        consultation: allHistory.filter((item) => item.package_type === "consultation" && item.status === "pending").length,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memuat data pembayaran Pro.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  const handleCancelPayment = async (transactionCode) => {
    if (!window.confirm("Batalkan transaksi pending ini?")) {
      return;
    }

    try {
      setCancellingCode(transactionCode);
      await singapayApi.cancelPurchase(transactionCode);
      toast.success("Transaksi berhasil dibatalkan.");
      fetchData(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal membatalkan transaksi.");
    } finally {
      setCancellingCode(null);
    }
  };

  const pendingCount = useMemo(() => history.filter((item) => item.status === "pending").length, [history]);
  const filteredHistory = useMemo(() => {
    if (statusFilter === "all") {
      return history;
    }
    return history.filter((item) => item.status === statusFilter);
  }, [history, statusFilter]);

  const sortedHistory = useMemo(() => {
    const rows = [...filteredHistory];
    switch (sortBy) {
      case "oldest":
        return rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case "amount_desc":
        return rows.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
      case "amount_asc":
        return rows.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
      case "newest":
      default:
        return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [filteredHistory, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pembayaran Pro</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kelola langganan PDF Pro dan transaksi pembayaran Anda.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            {hasAccess ? <ShieldCheck className="text-green-600" size={18} /> : <ShieldX className="text-red-500" size={18} />}
            <h2 className="font-semibold text-gray-900 dark:text-white">Status Akses Pro</h2>
          </div>
          {hasAccess && subscription ? (
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>
                Paket aktif: <span className="font-semibold">{subscription.package_name || subscription.package_type}</span>
              </p>
              <p>
                Berlaku sampai: <span className="font-semibold">{new Date(subscription.expires_at).toLocaleDateString("id-ID")}</span>
              </p>
              <p>
                Sisa hari: <span className="font-semibold">{subscription.remaining_days ?? 0} hari</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">Belum ada langganan Pro aktif.</p>
          )}
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Transaksi Pending</div>
          <div className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{pendingCount}</div>
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setShowPaymentModal(true);
            }}
            className="mt-4 inline-flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <CreditCard size={16} />
            Bayar / Upgrade
          </button>
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Paket Langganan Pro</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">{pkg.name}</p>
              <p className="text-2xl font-black text-green-600 mt-1">{pkg.formatted_price}</p>
              <p className="text-xs text-gray-500 mt-1">{pkg.duration_text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Pembayaran Pro</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap gap-2">
              {["all", "pending", "paid", "cancelled", "expired", "failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === status ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
                >
                  {status === "all" ? "Semua" : status}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="amount_desc">Nominal terbesar</option>
              <option value="amount_asc">Nominal terkecil</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Belum ada transaksi pembayaran Pro.</p>
        ) : (
          <div className="space-y-3">
            {sortedHistory.map((item) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.package_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.transaction_code} • {item.formatted_date}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.formatted_amount} • {item.payment_method_label}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.status === "paid" ? "bg-green-100 text-green-700" : item.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                      {item.status}
                    </span>

                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTransaction(item);
                            setShowPaymentModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100"
                        >
                          <ExternalLink size={14} />
                          Lanjut
                        </button>
                        <button
                          onClick={() => handleCancelPayment(item.transaction_code)}
                          disabled={cancellingCode === item.transaction_code}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          Batal
                        </button>
                      </>
                    )}

                    {item.status === "paid" && item.formatted_expires_at && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock3 size={14} />
                        s/d {item.formatted_expires_at}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PdfProPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => fetchData(true)}
        initialTransaction={selectedTransaction}
      />
    </div>
  );
};

export default UserProPaymentCenter;
