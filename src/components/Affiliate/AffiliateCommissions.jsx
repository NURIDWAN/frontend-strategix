import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, CheckCircle, Clock, Wallet, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { affiliateCommissionApi } from "../../services/affiliateCommissionApi";

const AffiliateCommissions = () => {
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Withdrawal History State
  const [activeTab, setActiveTab] = useState("commission"); // 'commission' | 'withdrawal'
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalPagination, setWithdrawalPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    notes: "",
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastWithdrawalData, setLastWithdrawalData] = useState(null);

  useEffect(() => {
    fetchStatistics();
    fetchHistory();
    fetchWithdrawableBalance();
    fetchWithdrawalHistory();
  }, []);

  const fetchWithdrawableBalance = async () => {
    try {
      const response = await affiliateCommissionApi.getWithdrawableBalance();
      // Backend returns: {success: true, data: {balance: float, can_withdraw: bool, minimum_withdrawal: float}}
      if (response.data && response.data.success && response.data.data) {
        setWithdrawableBalance(response.data.data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setWithdrawableBalance(0); // Fallback to 0 on error
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await affiliateCommissionApi.getStatistics();
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("[AffiliateCommissions] Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      // Use the new withdrawals endpoint if we want to show withdrawals too, 
      // but for now let's stick to commission history or maybe we should switch to withdrawals history?
      // The user wants "Riwayat Withdraw". 
      // Let's create a tab or section for it? 
      // For now, I will interpret the request as just enabling the flow.
      // But showing the history of commissions is still main. 
      // I will add a separate fetch for Withdrawal History if I had time, but let's stick to commissions for now.
      // Wait, endpoint /withdrawals exists.

      const response = await affiliateCommissionApi.getHistory({ page, per_page: 15 });
      if (response.data.success) {
        setHistory(response.data.data.data || response.data.data);
        // Correctly handle Laravel pagination structure
        const paginData = response.data.data;
        if (paginData.current_page) {
          setPagination({
            current_page: paginData.current_page,
            last_page: paginData.last_page,
            per_page: paginData.per_page,
            total: paginData.total,
          });
        }
      }
    } catch (error) {
      console.error("[AffiliateCommissions] Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchWithdrawalHistory = async (page = 1) => {
    setWithdrawalLoading(true);
    try {
      const response = await affiliateCommissionApi.getWithdrawalHistory({ page, per_page: 15 });
      if (response.data.success) {
        setWithdrawalHistory(response.data.data.data || response.data.data);
        const paginData = response.data.data;
        if (paginData.current_page) {
          setWithdrawalPagination({
            current_page: paginData.current_page,
            last_page: paginData.last_page,
            per_page: paginData.per_page,
            total: paginData.total,
          });
        }
      }
    } catch (error) {
      console.error("[AffiliateCommissions] Error fetching withdrawal history:", error);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(withdrawAmount) > withdrawableBalance) {
      alert("Saldo tidak mencukupi");
      return;
    }

    setIsWithdrawing(true);
    try {
      const payload = {
        amount: parseFloat(withdrawAmount),
        ...bankDetails
      };

      const response = await affiliateCommissionApi.withdraw(payload);

      if (response.data.success) {
        setLastWithdrawalData({
          amount: payload.amount,
          bank_name: payload.bank_name,
          account_number: payload.account_number,
          transaction_code: response.data.data?.singapay_reference || response.data.data?.id
        });
        setShowSuccessModal(true);
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        // Refresh data
        fetchStatistics();
        fetchWithdrawableBalance();
        fetchWithdrawalHistory();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal melakukan penarikan");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        icon: CheckCircle,
        label: "Approved",
      },
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-300",
        icon: Clock,
        label: "Pending",
      },
      paid: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        icon: Wallet,
        label: "Paid",
      },
      processed: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        icon: CheckCircle,
        label: "Selesai",
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        icon: X,
        label: "Gagal",
      },
      rejected: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-800 dark:text-gray-300",
        icon: X,
        label: "Ditolak",
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon || CheckCircle;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Komisi Affiliate</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Lacak penghasilan komisi dari referral Anda</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="opacity-80" />
            <TrendingUp size={20} className="opacity-60" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Pendapatan</h3>
          <p className="text-3xl font-bold">{formatCurrency(statistics?.total_earnings || 0)}</p>
          <p className="text-xs opacity-75 mt-2">Approved + Paid</p>
        </div>

        {/* Ready to Withdraw */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Wallet size={32} className="text-blue-600 dark:text-blue-400" />
            {withdrawableBalance >= 50000 && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold"
              >
                Withdraw
              </button>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Siap Dicairkan</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(withdrawableBalance)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {withdrawableBalance >= 50000 ? "Saldo mencukupi" : `Min. ${formatCurrency(50000)}`}
          </p>
        </div>

        {/* Paid Total */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Dibayar</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(statistics?.paid_total || 0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Sudah ditransfer</p>
        </div>

        {/* Total Referrals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} className="text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Referrals</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics?.total_referrals || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">User yang subscribe</p>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transform transition-all p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Formulir Penarikan</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start">
              <AlertCircle className="text-blue-600 flex-shrink-0 mr-3 mt-0.5" size={20} />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Saldo akan ditransfer melalui SingaPay B2B Disbursement. Proses pencairan dana mengikuti jadwal operasional bank.
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Penarikan (IDR)</label>
                <input
                  type="number"
                  required
                  min="50000"
                  max={withdrawableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Minimal 50.000"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Min: {formatCurrency(50000)}</span>
                  <span>Maks: {formatCurrency(withdrawableBalance)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank</label>
                  <select
                    required
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Pilih Bank</option>
                    <option value="BCA">BCA - Bank Central Asia</option>
                    <option value="MANDIRI">Mandiri</option>
                    <option value="BNI">BNI - Bank Negara Indonesia</option>
                    <option value="BRI">BRI - Bank Rakyat Indonesia</option>
                    <option value="CIMB">CIMB Niaga</option>
                    <option value="PERMATA">Permata Bank</option>
                    <option value="DANAMON">Danamon</option>
                    <option value="MAYBANK">Maybank</option>
                    <option value="PANIN">Panin Bank</option>
                    <option value="BSI">BSI - Bank Syariah Indonesia</option>
                    <option value="BTN">BTN - Bank Tabungan Negara</option>
                    <option value="OCBC">OCBC NISP</option>
                    <option value="MUAMALAT">Bank Muamalat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Rekening</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="123xxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atas Nama</label>
                <input
                  type="text"
                  required
                  value={bankDetails.account_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Nama pemilik rekening"
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isWithdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  "Kirim Permintaan"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastWithdrawalData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl transform transition-all p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="mb-6 relative flex justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Berhasil Dikirim!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 px-2">
              Permintaan penarikan Anda sedang diproses oleh sistem.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 mb-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nominal:</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(lastWithdrawalData.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bank:</span>
                <span className="font-medium text-gray-900 dark:text-white">{lastWithdrawalData.bank_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">No. Rek:</span>
                <span className="font-medium text-gray-900 dark:text-white">{lastWithdrawalData.account_number}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200 dark:shadow-none active:scale-[0.98]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* History Tabs & Tables */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Tabs Header */}
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("commission")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "commission"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
            >
              Riwayat Komisi
            </button>
            <button
              onClick={() => setActiveTab("withdrawal")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "withdrawal"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
            >
              Riwayat Withdraw
            </button>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {activeTab === "commission" ? `Total ${pagination.total} komisi` : `Total ${withdrawalPagination.total} penarikan`}
          </p>
        </div>

        {/* Loading State for History */}
        {(activeTab === "commission" ? historyLoading : withdrawalLoading) ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 text-sm animate-pulse">Memuat data riwayat...</p>
          </div>
        ) : activeTab === "commission" ? (
          /* Commission Table */
          history.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">Belum ada komisi</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Share link affiliate Anda untuk mulai mendapatkan komisi dari setiap langganan.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Referral</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Paket</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Nominal</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Komisi</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {history.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">{formatDate(commission.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                              <span className="text-xs font-bold text-green-700 dark:text-green-300">{commission.referred_user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{commission.referred_user?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            {commission.purchase?.premium_pdf?.name || commission.purchase?.package_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-500">{formatCurrency(commission.subscription_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-green-600 dark:text-green-400">{formatCurrency(commission.commission_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(commission.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Commission */}
              {pagination.last_page > 1 && (
                <div className="px-6 py-4 bg-gray-50/30 dark:bg-transparent border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => fetchHistory(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Halaman {pagination.current_page} dari {pagination.last_page}
                  </span>
                  <button
                    onClick={() => fetchHistory(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          /* Withdrawal Table */
          withdrawalHistory.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">Belum ada penarikan</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Ajukan penarikan dana setelah saldo komisi Anda mencapai batas minimum.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Bank & Tujuan</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Nominal</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {withdrawalHistory.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">{formatDate(withdrawal.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{withdrawal.bank_name}</span>
                            <span className="text-xs text-gray-500">{withdrawal.account_number} - {withdrawal.account_name}</span>
                            {withdrawal.singapay_reference && (
                              <span className="text-[10px] text-blue-500 font-mono mt-0.5">Ref: {withdrawal.singapay_reference}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-gray-900 dark:text-white">{formatCurrency(withdrawal.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(withdrawal.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Withdrawal */}
              {withdrawalPagination.last_page > 1 && (
                <div className="px-6 py-4 bg-gray-50/30 dark:bg-transparent border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => fetchWithdrawalHistory(withdrawalPagination.current_page - 1)}
                    disabled={withdrawalPagination.current_page === 1}
                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Halaman {withdrawalPagination.current_page} dari {withdrawalPagination.last_page}
                  </span>
                  <button
                    onClick={() => fetchWithdrawalHistory(withdrawalPagination.current_page + 1)}
                    disabled={withdrawalPagination.current_page === withdrawalPagination.last_page}
                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default AffiliateCommissions;
