import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, Trash2 } from "lucide-react";
import singapayApi from "../../../services/singapayApi";
import PdfProPaymentModal from "./PdfProPaymentModal";

const SubscriptionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await singapayApi.getHistory();

            if (response.data.success) {
                setHistory(response.data.data || []);
            } else {
                setError(response.data.message || "Gagal memuat riwayat");
            }
        } catch (err) {
            console.error("Error fetching history:", err);
            setError(err.response?.data?.message || "Gagal memuat riwayat transaksi");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPayment = (transaction) => {
        setSelectedTransaction(transaction);
        setShowPaymentModal(true);
    };

    const handleCancelPayment = async (transactionCode) => {
        if (!window.confirm("Apakah Anda yakin ingin membatalkan pembayaran ini?")) {
            return;
        }

        try {
            await singapayApi.cancelPurchase(transactionCode);
            // Refresh history without full loading state if possible, or just re-fetch
            fetchHistory();
        } catch (err) {
            console.error("Error cancelling payment:", err);
            alert(err.response?.data?.message || "Gagal membatalkan pembayaran");
        }
    };

    const handlePdfSuccess = () => {
        setShowPaymentModal(false);
        fetchHistory();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: { icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Berhasil" },
            active: { icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Aktif" },
            pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Menunggu" },
            expired: { icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Kadaluarsa" },
            failed: { icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Gagal" },
            cancelled: { icon: XCircle, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", label: "Dibatalkan" },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="text-sm" />
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                        <div className="font-semibold text-red-800 dark:text-red-200">Gagal Memuat Riwayat</div>
                        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                        <button
                            onClick={fetchHistory}
                            className="flex items-center gap-1 mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                            <RefreshCw className="text-xs" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="mb-4 text-5xl">📋</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Belum Ada Riwayat Transaksi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Riwayat pembelian paket PDF Pro Anda akan muncul di sini
                </p>
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={fetchHistory}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <RefreshCw className="text-sm" />
                        Refresh Data
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Riwayat Langganan
                </h3>
                <button
                    onClick={fetchHistory}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                    <RefreshCw className="text-sm" />
                    Refresh
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-hidden border border-gray-200 rounded-lg md:block dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-gray-300">
                                Tanggal
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-gray-300">
                                Paket
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase dark:text-gray-300">
                                Metode
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase dark:text-gray-300">
                                Total
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase dark:text-gray-300">
                                Status
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase dark:text-gray-300">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {history.map((item) => (
                            <tr key={item.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                                    {item.formatted_date}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.package_name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.transaction_code}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {item.payment_method_label}
                                    {item.bank_code && (
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            {item.bank_code}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-sm font-semibold text-right text-gray-900 dark:text-white">
                                    {item.formatted_amount}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    {item.status === 'pending' && (
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewPayment(item)}
                                                className="p-1.5 text-indigo-600 transition-colors rounded hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                title="Lihat Detail Pembayaran"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleCancelPayment(item.transaction_code)}
                                                className="p-1.5 text-red-600 transition-colors rounded hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                title="Batalkan Pembayaran"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {item.package_name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.formatted_date}
                                </div>
                            </div>
                            {getStatusBadge(item.status)}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Metode:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {item.payment_method_label}
                                    {item.bank_code && ` (${item.bank_code})`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {item.formatted_amount}
                                </span>
                            </div>
                            <div className="pt-2 text-xs text-gray-500 border-t dark:text-gray-400 dark:border-gray-700">
                                ID: {item.transaction_code}
                            </div>

                            {item.status === 'pending' && (
                                <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t dark:border-gray-700">
                                    <button
                                        onClick={() => handleViewPayment(item)}
                                        className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400"
                                    >
                                        <Eye /> Lihat
                                    </button>
                                    <button
                                        onClick={() => handleCancelPayment(item.transaction_code)}
                                        className="flex items-center justify-center gap-1 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400"
                                    >
                                        <Trash2 /> Batal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            <PdfProPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePdfSuccess}
                initialTransaction={selectedTransaction}
            />
        </div>
    );
};

export default SubscriptionHistory;
