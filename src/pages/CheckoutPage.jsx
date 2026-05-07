import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, BadgeCheck } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import singapayApi from "../services/singapayApi";
import { readCheckoutIntent, saveCheckoutIntent as persistCheckoutIntent, clearCheckoutIntent } from "../utils/checkoutIntent";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

function CheckoutPage({ isDarkMode, toggleDarkMode }) {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [bankCode, setBankCode] = useState("BRI");
  const [processing, setProcessing] = useState(false);
  const preserveIntentOnUnmountRef = useRef(false);

  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);

  useEffect(() => {
    const readIntent = () => {
      const intent = readCheckoutIntent();
      if (!intent) return;

      if (String(intent.packageId) === String(packageId)) {
        if (intent.paymentMethod === "virtual_account" || intent.paymentMethod === "qris") {
          setPaymentMethod(intent.paymentMethod);
        }
        if (intent.bankCode) {
          setBankCode(intent.bankCode);
        }
      }
    };

    readIntent();
  }, [packageId]);

  useEffect(() => {
    if (!packageId) return;

    persistCheckoutIntent({
      packageId,
      paymentMethod,
      bankCode,
    });
  }, [packageId, paymentMethod, bankCode]);

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await singapayApi.getPackages();
        const payload = response.data || {};
        const allPackages = payload.data || payload.packages || [];

        if (!payload.success || !Array.isArray(allPackages)) {
          setError("Data paket tidak valid.");
          return;
        }

        const pkg = allPackages.find((item) => String(item.id) === String(packageId));
        if (!pkg) {
          setError("Paket tidak ditemukan atau sudah tidak aktif.");
          return;
        }

        if (pkg.package_type === "consultation") {
          setError("Paket ini hanya bisa dibeli dari menu konsultasi.");
          return;
        }

        setSelectedPackage(pkg);
      } catch {
        setError("Gagal memuat detail paket. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const saveCheckoutIntent = () => {
    persistCheckoutIntent({
        packageId,
        paymentMethod,
        bankCode,
    });
  };

  const handleCheckout = async () => {
    if (!selectedPackage) return;

    if (!localStorage.getItem("token")) {
      saveCheckoutIntent();
      preserveIntentOnUnmountRef.current = true;
      toast.info("Silakan login untuk melanjutkan pembayaran.");
      navigate(`/login?redirect=${encodeURIComponent(`/checkout/${packageId}`)}`);
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        package_id: selectedPackage.id,
        payment_method: paymentMethod,
        ...(paymentMethod === "virtual_account" && { bank_code: bankCode }),
      };

      const response = await singapayApi.createPurchase(payload);
      const data = response.data || {};

      if (data.success && data.payment?.is_redirect && data.payment?.payment_url) {
        clearCheckoutIntent();
        preserveIntentOnUnmountRef.current = true;
        window.location.href = data.payment.payment_url;
        return;
      }

      throw new Error(data.message || "Gagal membuat transaksi pembayaran.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Gagal memproses pembayaran.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (!preserveIntentOnUnmountRef.current) {
        clearCheckoutIntent();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <section className="px-4 pt-24 pb-14">
        <div className="mx-auto max-w-5xl">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <ArrowLeft size={16} />
            Kembali ke Pricing
          </Link>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Checkout Paket</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Pilih metode pembayaran lalu lanjutkan ke gateway pembayaran aman.</p>

              {loading && (
                <div className="mt-8 flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Loader2 className="animate-spin" size={18} />
                  Memuat detail paket...
                </div>
              )}

              {!loading && error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              {!loading && !error && selectedPackage && (
                <>
                  <div className="mt-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPackage.name}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedPackage.description || "Akses penuh fitur Pro sesuai durasi paket."}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(selectedPackage.price)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{selectedPackage.duration_text || `${selectedPackage.duration_days} hari`}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">Metode Pembayaran</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("qris")}
                        className={`rounded-xl border p-4 text-left transition ${paymentMethod === "qris" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"}`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">QRIS</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Instan dan otomatis</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("virtual_account")}
                        className={`rounded-xl border p-4 text-left transition ${paymentMethod === "virtual_account" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"}`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">Virtual Account</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Transfer bank</p>
                      </button>
                    </div>

                    {paymentMethod === "virtual_account" && (
                      <div className="mt-3">
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">Pilih Bank</label>
                        <select
                          value={bankCode}
                          onChange={(e) => setBankCode(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          <option value="BRI">Bank BRI</option>
                          <option value="BNI">Bank BNI</option>
                          <option value="DANAMON">Bank Danamon</option>
                          <option value="MAYBANK">Bank Maybank</option>
                        </select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ringkasan</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Paket</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedPackage?.name || "-"}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Total Bayar</span>
                  <span className="text-base font-black text-gray-900 dark:text-white">{formatCurrency(selectedPackage?.price || 0)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !!error || !selectedPackage || processing}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                {isLoggedIn ? "Bayar Sekarang" : "Login untuk Bayar"}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-green-600" /> Pembayaran diproses secara aman.</p>
                <p className="inline-flex items-center gap-2"><BadgeCheck size={14} className="text-green-600" /> Aktivasi akses otomatis setelah pembayaran sukses.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default CheckoutPage;
