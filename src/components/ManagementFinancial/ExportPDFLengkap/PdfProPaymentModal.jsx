import { useState, useEffect, useCallback, useRef } from "react";
import { X, CreditCard, Check, Copy, Clock, AlertCircle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";
import axios from "axios";

const PdfProPaymentModal = ({ isOpen, onClose, onSuccess, initialTransaction = null }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("virtual_account");
    const [selectedBank, setSelectedBank] = useState("BRI");
    const [paymentData, setPaymentData] = useState(null);
    const [transactionCode, setTransactionCode] = useState(null);
    const [checking, setChecking] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState("pending");
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [error, setError] = useState(null);

    // Tambahkan refs untuk fix timer issue
    const checkIntervalRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const isClosingRef = useRef(false);
    const transactionCodeRef = useRef(null);
    const onCloseRef = useRef(onClose); // Tambahkan ref untuk onClose

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const MAX_RETRIES = 60;
    const POLL_INTERVAL = 5000;

    // Update onClose ref ketika prop berubah
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast("Silakan login terlebih dahulu untuk mengakses fitur Pro", "error");
                return;
            }

            // Hydrate from initial transaction if provided
            if (initialTransaction) {
                hydrateTransaction(initialTransaction);
            } else {
                fetchPackages();
            }
        } else {
            cleanup();
        }
    }, [isOpen, initialTransaction]);

    const hydrateTransaction = (tx) => {
        const isRedirect = !!tx.payment_url;

        setPaymentData({
            va_number: tx.va_number,
            bank_code: tx.bank_code,
            bank_name: tx.bank_code || 'QRIS',
            formatted_amount: tx.formatted_amount,
            expired_at: tx.expires_at, // Ensure backend returns this
            payment_instructions: tx.payment_instructions || {},
            qris_content: tx.qris_content,
            qris_url: tx.qris_url,
            // New fields for Redirect/Payment Link
            is_redirect: isRedirect,
            payment_url: tx.payment_url
        });
        setTransactionCode(tx.transaction_code);
        transactionCodeRef.current = tx.transaction_code;
        setPaymentMethod(tx.payment_method);
        setPaymentStatus(tx.status);
        setStep(3);

        // Start polling immediately
        if (tx.status === 'pending') {
            startPaymentPolling(tx.transaction_code);
        }
    };

    // Countdown timer yang terpisah dari polling
    useEffect(() => {
        if (paymentData?.expired_at && paymentStatus === "pending") {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }

            countdownIntervalRef.current = setInterval(() => {
                const expiry = new Date(paymentData.expired_at);
                const now = new Date();
                const diff = expiry - now;

                if (diff <= 0) {
                    setTimeRemaining("Expired");
                    setPaymentStatus("expired");
                    stopPolling();
                    clearInterval(countdownIntervalRef.current);
                } else {
                    const hours = Math.floor(diff / 3600000);
                    const minutes = Math.floor((diff % 3600000) / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    setTimeRemaining(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
                }
            }, 1000);

            return () => {
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
            };
        }
    }, [paymentData?.expired_at, paymentStatus]);

    const handleClose = () => {
        if (paymentStatus === "paid") {
            onCloseRef.current();
            return;
        }

        if (step === 3 && paymentStatus === "pending") {
            const confirmClose = window.confirm(
                "Pembayaran masih dalam proses. Yakin ingin menutup? Anda bisa kembali lagi nanti untuk mengecek status."
            );

            if (confirmClose) {
                onCloseRef.current();
            }
        } else {
            onCloseRef.current();
        }
    };

    const cleanup = () => {
        setStep(1);
        setSelectedPackage(null);
        setPaymentData(null);
        setTransactionCode(null);
        transactionCodeRef.current = null;
        setPaymentStatus("pending");
        setRetryCount(0);
        setError(null);
        setTimeRemaining(null);
        isClosingRef.current = false;
        stopPolling();

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    };

    const stopPolling = () => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
    };

    const fetchPackages = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${apiUrl}/api/payment/packages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const payload = response.data || {};
            const allPackages = payload.packages || payload.data || [];
            const proPackages = allPackages.filter((pkg) => pkg.package_type !== "consultation");

            if (payload.success && proPackages.length > 0) {
                setPackages(proPackages);
                setSelectedPackage(proPackages[0]);
            } else {
                setPackages([]);
                setSelectedPackage(null);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            setError(error.response?.data?.message || "Gagal memuat paket");
            showToast("Gagal memuat paket: " + (error.response?.data?.message || error.message), "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!selectedPackage) {
            showToast("Silakan pilih paket", "error");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const purchaseData = {
                package_id: selectedPackage.id,
                payment_method: paymentMethod,
            };

            if (paymentMethod === "virtual_account") {
                purchaseData.bank_code = selectedBank;
            }

            const response = await axios.post(`${apiUrl}/api/payment/purchase`, purchaseData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                // Backend returns 'payment' key containing the payment link data
                const paymentInfo = response.data.payment || response.data.data || {};
                const txCode = response.data.purchase?.transaction_code || paymentInfo.transaction_code;

                setTransactionCode(txCode);
                transactionCodeRef.current = txCode;
                setPaymentStatus("pending");
                setRetryCount(0);
                setStep(3);

                // Handle Redirect Flow (Payment Link)
                if (paymentInfo.is_redirect && paymentInfo.payment_url) {
                    setPaymentData({
                        ...paymentInfo,
                        formatted_amount: selectedPackage.formatted_price, // Fallback display
                        is_redirect: true,
                        payment_url: paymentInfo.payment_url
                    });

                    // Auto-open in new tab (might be blocked, so we also show button)
                    if (paymentInfo.payment_url) {
                        try {
                            window.open(paymentInfo.payment_url, '_blank');
                            showToast("Membuka halaman pembayaran...", "info");
                        } catch (e) {
                            console.error("Popup blocked?", e);
                        }
                    }
                } else {
                    // Fallback to legacy structure if backend reverts
                    setPaymentData(response.data.payment || paymentInfo);
                }

                startPaymentPolling(txCode);
                showToast("Payment berhasil dibuat!", "success");
            } else {
                throw new Error(response.data.message || "Gagal membuat payment");
            }
        } catch (error) {
            console.error("Error creating purchase:", error);
            setError(error.response?.data?.message || error.message);
            showToast(error.response?.data?.message || "Gagal membuat payment", "error");
        } finally {
            setLoading(false);
        }
    };

    const startPaymentPolling = useCallback((txCode) => {
        // Hentikan polling sebelumnya jika ada
        stopPolling();

        // Check pertama kali
        checkPaymentStatus(txCode);

        // Setup interval baru
        checkIntervalRef.current = setInterval(() => {
            setRetryCount(prev => {
                const newCount = prev + 1;

                if (newCount >= MAX_RETRIES) {
                    stopPolling();
                    showToast("Polling timeout. Refresh manual atau tunggu pembayaran.", "warning");
                    return newCount;
                }

                checkPaymentStatus(txCode);
                return newCount;
            });
        }, POLL_INTERVAL);
    }, []);

    const checkPaymentStatus = async (txCode) => {
        // Prevent multiple checks
        if (checking || isClosingRef.current) return;

        try {
            setChecking(true);

            const response = await axios.get(`${apiUrl}/api/payment/status/${txCode}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success && response.data.paid) {
                setPaymentStatus("paid");
                stopPolling();

                showToast("🎉 Pembayaran berhasil! Akses PDF Pro telah aktif.", "success");

                if (onSuccess) {
                    onSuccess();
                }

                // Set flag dan delay close
                isClosingRef.current = true;

                setTimeout(() => {
                    // Gunakan onCloseRef.current agar mendapatkan value terbaru
                    onCloseRef.current();
                }, 2500);

            } else if (response.data.status === "expired" || response.data.status === "failed") {
                setPaymentStatus(response.data.status);
                stopPolling();
            }
        } catch (error) {
            console.error("Error checking status:", error);
        } finally {
            setChecking(false);
        }
    };

    const handleTestWebhook = async () => {
        if (!transactionCode) return;

        try {
            setLoading(true);

            const response = await axios.post(`${apiUrl}/api/webhook/singapay/test`, {
                transaction_code: transactionCode
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                showToast("✅ Webhook triggered! Checking status...", "success");
                setTimeout(() => {
                    checkPaymentStatus(transactionCode);
                }, 1000);
            }
        } catch (error) {
            console.error("Error testing webhook:", error);
            showToast("Gagal trigger webhook", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefresh = () => {
        if (transactionCode && !checking) {
            checkPaymentStatus(transactionCode);
            showToast("Refreshing status...", "info");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!", "success");
    };

    const showToast = (message, type = "info") => {
        console.log(`[${type.toUpperCase()}]`, message);
        // Anda bisa menambahkan toast library seperti react-hot-toast di sini
    };

    const getQRISImageSrc = () => {
        if (!paymentData) return null;

        const qrisContent = paymentData.qris_content || paymentData.qr_data;

        if (!qrisContent) return null;

        if (qrisContent.startsWith('http')) {
            return qrisContent;
        }

        return `data:image/png;base64,${qrisContent}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Export PDF Pro
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
                    >
                        <X className="text-xl" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: "Pilih Paket" },
                            { num: 2, label: "Metode Pembayaran" },
                            { num: 3, label: "Bayar" },
                        ].map((s, idx) => (
                            <div key={s.num} className="flex items-center flex-1">
                                <div className="flex items-center flex-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= s.num
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                            }`}
                                    >
                                        {step > s.num ? <Check /> : s.num}
                                    </div>
                                    <span
                                        className={`ml-2 text-sm font-medium ${step >= s.num
                                            ? "text-gray-900 dark:text-white"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${step > s.num
                                            ? "bg-indigo-600"
                                            : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 mx-6 mt-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div className="text-sm text-red-800 dark:text-red-200">
                                {error}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Package Selection */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Pilih Paket Berlangganan
                            </h3>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            ) : packages.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mb-4 text-4xl">📦</div>
                                    <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        Paket Tidak Tersedia
                                    </p>
                                    <button
                                        onClick={fetchPackages}
                                        className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            onClick={() => setSelectedPackage(pkg)}
                                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedPackage?.id === pkg.id
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {pkg.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {pkg.duration_text}
                                                    </p>
                                                </div>
                                                {selectedPackage?.id === pkg.id && (
                                                    <div className="p-1 text-white bg-indigo-600 rounded-full">
                                                        <Check />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {pkg.formatted_price}
                                                </div>
                                                {pkg.package_type === "yearly" && (
                                                    <div className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
                                                        💰 Hemat 30%!
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {pkg.features && pkg.features.slice(0, 4).map((feature, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                                        <Check className="mt-0.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedPackage || loading}
                                className="w-full py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Lanjutkan
                            </button>
                        </div>
                    )}

                    {/* Step 2: Payment Method */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Pilih Metode Pembayaran
                            </h3>

                            <div className="space-y-3">
                                {/* Virtual Account */}
                                <div
                                    onClick={() => setPaymentMethod("virtual_account")}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "virtual_account"
                                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="text-2xl text-indigo-600 dark:text-indigo-400" />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    Virtual Account
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Transfer bank (BRI, BNI, Danamon, Maybank)
                                                </div>
                                            </div>
                                        </div>
                                        {paymentMethod === "virtual_account" && (
                                            <Check className="text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>

                                    {paymentMethod === "virtual_account" && (
                                        <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
                                            {["BRI", "BNI", "DANAMON", "MAYBANK"].map((bank) => (
                                                <button
                                                    key={bank}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBank(bank);
                                                    }}
                                                    className={`py-2 px-3 rounded-lg font-medium transition-all ${selectedBank === bank
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                                        }`}
                                                >
                                                    {bank}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* QRIS */}
                                <div
                                    onClick={() => setPaymentMethod("qris")}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "qris"
                                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 text-white bg-indigo-600 rounded-lg">
                                                QR
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    QRIS
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Scan QR dengan e-wallet atau mobile banking
                                                </div>
                                            </div>
                                        </div>
                                        {paymentMethod === "qris" && (
                                            <Check className="text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Paket:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {selectedPackage?.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {selectedPackage?.formatted_price}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className="flex-1 py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                                >
                                    {loading ? "Memproses..." : "Bayar Sekarang"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment Info */}
                    {step === 3 && paymentData && (
                        <div className="space-y-4">
                            {/* Payment Status Banner */}
                            {paymentStatus === "paid" && (
                                <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                                        <div>
                                            <div className="font-semibold text-green-900 dark:text-green-100">
                                                Pembayaran Berhasil!
                                            </div>
                                            <div className="text-sm text-green-700 dark:text-green-200">
                                                Akses PDF Pro Anda telah aktif
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Link Redirect Info (New Flow) */}
                            {paymentData.is_redirect && paymentStatus !== "paid" && (
                                <div className="space-y-4">
                                    <div className="p-6 text-center border-2 border-indigo-200 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800">
                                        <div className="mb-4">
                                            <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                                                <CreditCard className="text-3xl text-indigo-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                Selesaikan Pembayaran
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Silakan lanjutkan pembayaran di halaman Singapay.
                                            </p>
                                        </div>

                                        <a
                                            href={paymentData.payment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 w-full md:w-auto"
                                        >
                                            Bayar Sekarang <ExternalLink className="ml-1" />
                                        </a>

                                        <p className="mt-4 text-xs text-gray-500">
                                            *Halaman pembayaran akan terbuka di tab baru
                                        </p>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Total Tagihan:</span>
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                {paymentData.formatted_amount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Legacy: Virtual Account Info */}
                            {!paymentData.is_redirect && paymentMethod === "virtual_account" && paymentStatus !== "paid" && (
                                <>
                                    <div className="p-6 text-center border-2 border-indigo-200 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800">
                                        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                            {paymentData.bank_name}
                                        </div>
                                        <div className="mb-4 text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                            {paymentData.va_number}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(paymentData.va_number)}
                                            className="flex items-center gap-2 px-4 py-2 mx-auto text-sm font-medium text-indigo-600 transition-colors bg-white border border-indigo-600 rounded-lg dark:bg-gray-800 hover:bg-indigo-50"
                                        >
                                            <Copy /> Copy Nomor VA
                                        </button>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Total Bayar:</span>
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                {paymentData.formatted_amount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                <Clock />
                                                <span>Sisa Waktu:</span>
                                            </div>
                                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                                                {timeRemaining || "Loading..."}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg max-h-64 overflow-y-auto">
                                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                                            Cara Pembayaran:
                                        </h4>
                                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                            {paymentData.payment_instructions && Object.entries(paymentData.payment_instructions).map(([method, steps]) => (
                                                <div key={method}>
                                                    <div className="mb-1 font-medium text-gray-900 dark:text-white">
                                                        {method}:
                                                    </div>
                                                    <ol className="ml-4 space-y-1 list-decimal">
                                                        {steps.map((step, idx) => (
                                                            <li key={idx}>{step}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Legacy: QRIS Info */}
                            {!paymentData.is_redirect && paymentMethod === "qris" && paymentStatus !== "paid" && (
                                <>
                                    <div className="p-6 text-center border-2 border-indigo-200 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800">
                                        <div className="mb-4">
                                            {getQRISImageSrc() ? (
                                                <img
                                                    src={getQRISImageSrc()}
                                                    alt="QRIS Code"
                                                    className="w-64 h-64 mx-auto bg-white rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect fill="%23f0f0f0" width="256" height="256"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">QR Code</text></svg>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-64 h-64 mx-auto bg-gray-200 rounded-lg dark:bg-gray-700">
                                                    <span className="text-gray-400">QR Code Loading...</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                            Scan dengan aplikasi e-wallet atau mobile banking
                                        </div>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Total Bayar:</span>
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                {paymentData.formatted_amount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                <Clock />
                                                <span>Sisa Waktu:</span>
                                            </div>
                                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                                                {timeRemaining || "Loading..."}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Status Check */}
                            <div className="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${paymentStatus === "paid" ? "bg-green-500" :
                                            paymentStatus === "expired" ? "bg-red-500" :
                                                checking ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                                            }`} />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            Status: {
                                                paymentStatus === "paid" ? "Berhasil ✅" :
                                                    paymentStatus === "expired" ? "Kadaluarsa ⏰" :
                                                        paymentStatus === "failed" ? "Gagal ❌" :
                                                            "Menunggu Pembayaran"
                                            }
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleManualRefresh}
                                        disabled={checking || loading || paymentStatus === "paid"}
                                        className="p-2 text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50"
                                        title="Refresh Status"
                                    >
                                        <RefreshCw className={checking ? "animate-spin" : ""} />
                                    </button>
                                </div>
                                {paymentStatus === "pending" && (
                                    <>
                                        <div className="flex items-start gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                                            <AlertCircle className="mt-0.5 flex-shrink-0" />
                                            <span>
                                                Sistem akan otomatis mendeteksi pembayaran Anda. Proses verifikasi memakan waktu 1-5 menit.
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Polling: {retryCount}/{MAX_RETRIES}
                                            {retryCount >= MAX_RETRIES && " (Timeout)"}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mock Test Button */}
                            {import.meta.env.DEV && paymentStatus === "pending" && (
                                <div className="p-4 border-2 border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                                    <div className="flex items-start gap-2 mb-3 text-sm text-amber-900 dark:text-amber-100">
                                        <AlertCircle className="mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold">Testing Mode</div>
                                            <div className="text-amber-700 dark:text-amber-200">
                                                Simulasi pembayaran berhasil (development only)
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleTestWebhook}
                                        disabled={loading}
                                        className="w-full py-2 font-medium text-amber-900 transition-colors bg-amber-200 rounded-lg hover:bg-amber-300 disabled:bg-gray-400"
                                    >
                                        🧪 Simulasi Pembayaran Berhasil
                                    </button>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300"
                                >
                                    Kembali
                                </button>
                                {paymentStatus === "expired" && (
                                    <button
                                        onClick={() => {
                                            setStep(2);
                                            setPaymentStatus("pending");
                                        }}
                                        className="flex-1 py-3 font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Buat Pembayaran Baru
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default PdfProPaymentModal;
