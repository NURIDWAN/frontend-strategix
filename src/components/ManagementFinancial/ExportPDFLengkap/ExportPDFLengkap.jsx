import { useState, useEffect } from "react";
import { Download, ArrowLeft, Calendar, FileText, TrendingUp, AlertCircle, Check, Layers, ChevronDown, Lock, CheckCircle, ShieldOff } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import combinedPdfApi from "../../../services/managementFinancial/combinedPdfApi";
import useFeatureAccess from "../../../hooks/useFeatureAccess";
import PdfProPaymentModal from "./PdfProPaymentModal";
import SubscriptionHistory from "./SubscriptionHistory";
import RequestConsultation from "../../Consultation/RequestConsultation";
// TODO: Comment - FinancialPlan nonaktif di Business Plan, gunakan axios langsung
// import { financialPlanApi } from "../../../services/businessPlan";

const ExportPDFLengkap = ({ onBack, selectedBusiness: propSelectedBusiness }) => {
  const { user } = useAuth();
  const { hasProAccess, isFeatureEnabled, loading: accessLoading, refreshAccess } = useFeatureAccess();
  const [loading, setLoading] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(propSelectedBusiness || null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [mode, setMode] = useState("free"); // free or pro
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const pdfExportEnabled = isFeatureEnabled("feature_pdf_export");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Auto-set mode to pro if user has access
  useEffect(() => {
    if (!accessLoading && hasProAccess) {
      setMode("pro");
    }
  }, [accessLoading, hasProAccess]);

  useEffect(() => {
    console.log("ExportPDFLengkap Component Loaded!");
    generateAvailableYears();
    if (!propSelectedBusiness) {
      fetchBusinesses();
    }
  }, []);

  const fetchBusinesses = async () => {
    if (!user || !user.id) {
      console.log("⚠️ No user found, skipping fetch");
      setLoadingBusinesses(false);
      return;
    }

    try {
      setLoadingBusinesses(true);
      console.log("📡 Fetching businesses for user:", user.id);
      // TODO: Comment - FinancialPlan nonaktif di Business Plan, gunakan axios langsung
      // const response = await financialPlanApi.getBusinesses({ user_id: user.id });
      const response = await axios.get(`${apiUrl}/api/business-background`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log("✅ Businesses fetched:", response.data);
      if (response.data.status === "success") {
        setBusinesses(response.data.data);
        console.log("📊 Total businesses:", response.data.data.length);
        // Auto select first business if only one exists
        if (response.data.data.length === 1) {
          console.log("✨ Auto-selecting first business:", response.data.data[0].name);
          setSelectedBusiness(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching businesses:", error);
      toast.error("Gagal memuat daftar bisnis");
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const generateAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      years.push(year);
    }
    setAvailableYears(years.reverse());
  };

  const handlePaymentSuccess = () => {
    toast.success("Pembayaran berhasil! Akses Pro telah aktif.");
    refreshAccess(); // Refresh access status via hook
    setShowPaymentModal(false);
  };

  const handleModeChange = (newMode) => {
    if (newMode === "pro" && !hasProAccess) {
      // Show payment modal
      setShowPaymentModal(true);
    } else {
      setMode(newMode);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedBusiness) {
      toast.error("Silakan pilih bisnis terlebih dahulu");
      return;
    }

    if (!user || !user.id) {
      toast.error("User tidak terautentikasi. Silakan login kembali");
      return;
    }

    setLoading(true);

    try {
      const periodValue = selectedYear.toString();

      console.log("📤 Sending PDF Request with axios...");
      console.log("📋 Request Data:", {
        user_id: parseInt(user.id),
        business_background_id: selectedBusiness.id,
        period_type: "year",
        period_value: periodValue,
        mode: mode,
      });

      // Use axios API client dengan auto-auth interceptor
      const response = await combinedPdfApi.generateCombinedPdf(
        user.id,
        selectedBusiness.id,
        "year",
        periodValue,
        mode
      );

      console.log("📥 Response Status:", response.status);
      console.log("📥 Response Data:", response.data);

      if (response.data.status === "success" && response.data.data?.pdf_base64) {
        // Convert base64 to Blob
        const byteCharacters = atob(response.data.data.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = response.data.data.filename || `laporan-lengkap-${selectedBusiness.name.toLowerCase().replace(/\s+/g, "-")}-${periodValue}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("✅ PDF Laporan Lengkap berhasil diunduh!");
        
        // Trigger Consultation Modal after success
        setTimeout(() => {
          setShowConsultationModal(true);
        }, 1500);
      } else {
        throw new Error(response.data.message || "Response format tidak sesuai");
      }
    } catch (error) {
      console.error("❌ Error generating combined PDF:", error);
      if (error.response?.status === 422) {
        toast.error("❌ Data tidak valid. Periksa kembali periode yang dipilih");
      } else if (error.response?.status === 404) {
        toast.error("❌ Data bisnis tidak ditemukan");
      } else if (error.response?.status === 401) {
        toast.error("❌ Sesi Anda telah berakhir. Silakan login kembali");
      } else {
        toast.error(error.response?.data?.message || "❌ Gagal mengunduh laporan PDF. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-600 transition-colors hover:text-indigo-600">
            <ArrowLeft className="text-xl" />
            <span className="font-medium">Kembali</span>
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100">
            <Layers className="text-2xl text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export PDF Lengkap</h1>
            <p className="mt-1 text-gray-600">Business Plan + Laporan Keuangan dalam 1 PDF</p>
          </div>
        </div>
      </div>

      {/* Feature Disabled Warning */}
      {!pdfExportEnabled && (
        <div className="p-6 bg-white border border-red-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100">
              <ShieldOff className="text-2xl text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fitur Tidak Tersedia</h3>
              <p className="mt-1 text-sm text-gray-600">Fitur Export PDF sedang dinonaktifkan oleh administrator. Silakan hubungi admin untuk informasi lebih lanjut.</p>
            </div>
          </div>
        </div>
      )}

      {pdfExportEnabled && (
        <>
          {/* Business Selection - Only show if not passed from props */}
          {!propSelectedBusiness && (
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                <TrendingUp className="text-xl text-indigo-600" />
                Pilih Bisnis
              </h3>

              {loadingBusinesses ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : businesses.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="mx-auto mb-4 text-6xl text-gray-300" />
                  <p className="mb-2 text-lg font-medium text-gray-900">Belum Ada Bisnis</p>
                  <p className="text-gray-500">Silakan buat bisnis terlebih dahulu di menu Business Plan</p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedBusiness?.id || ""}
                    onChange={(e) => {
                      const business = businesses.find((b) => b.id === parseInt(e.target.value));
                      setSelectedBusiness(business);
                    }}
                    className="w-full px-4 py-3 pr-10 text-gray-900 transition-all bg-white border border-gray-300 appearance-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">-- Pilih Bisnis --</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name} {business.business_type ? `- ${business.business_type}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute text-gray-400 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" />
                </div>
              )}
            </div>
          )}

          {/* Main Card */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            {!selectedBusiness ? (
              <div className="py-12 text-center">
                <AlertCircle className="mx-auto mb-4 text-6xl text-gray-300" />
                <p className="text-lg text-gray-500">Silakan pilih bisnis terlebih dahulu</p>
              </div>
            ) : (
              <>
                {/* Business Info */}
                <div className="p-6 mb-6 border border-indigo-100 bg-indigo-50 rounded-xl">
                  <h3 className="flex items-center gap-2 mb-4 font-semibold text-indigo-900">
                    <TrendingUp className="text-xl" />
                    Informasi Bisnis
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-gray-600">Nama Bisnis:</span>
                      <p className="mt-1 font-semibold text-gray-900">{selectedBusiness.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jenis Usaha:</span>
                      <p className="mt-1 font-semibold text-gray-900">{selectedBusiness.business_type || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Kategori:</span>
                      <p className="mt-1 font-semibold text-gray-900">{selectedBusiness.category || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="mt-1 font-semibold text-gray-900">{selectedBusiness.status || "Aktif"}</p>
                    </div>
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                    <FileText className="text-xl text-indigo-600" />
                    Mode PDF
                  </h3>
                  {hasProAccess && (
                    <div className="p-3 mb-4 border border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircle className="text-lg" />
                        <span className="font-semibold">Akses Pro Aktif</span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeChange("free")}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${mode === "free" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Free</span>
                        {mode === "free" && <Check className="text-xl" />}
                      </div>
                      <p className="mt-1 text-xs opacity-80">Dengan watermark</p>
                    </button>
                    <button
                      onClick={() => handleModeChange("pro")}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all relative ${mode === "pro" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Pro</span>
                        {!hasProAccess && <Lock className="text-sm" />}
                        {mode === "pro" && <Check className="text-xl" />}
                      </div>
                      <p className="mt-1 text-xs opacity-80">
                        {hasProAccess ? "Tanpa watermark" : "Berlangganan untuk unlock"}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Period Selection */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                    <Calendar className="text-xl text-indigo-600" />
                    Periode Laporan Keuangan
                  </h3>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Tahun</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview Info */}
                <div className="p-4 mb-6 border border-amber-200 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-xl text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-900">
                      <p className="mb-1 font-semibold">Laporan PDF akan mencakup:</p>
                      <ul className="ml-2 space-y-1 list-disc list-inside">
                        <li>
                          <strong>Bagian 1: Business Plan</strong> - Latar belakang bisnis, analisis pasar, produk/layanan, strategi pemasaran, operasional, dan tim
                        </li>
                        <li>
                          <strong>Bagian 2: Laporan Keuangan (Tahun {selectedYear})</strong> - Ringkasan eksekutif, kategori, tren bulanan, dan proyeksi keuangan
                        </li>
                        <li>
                          <strong>Grafik & Visualisasi:</strong> Semua chart akan disertakan secara otomatis
                        </li>
                        <li>
                          <strong>Mode:</strong> {mode === "free" ? "FREE (Dengan watermark)" : "PRO (Tanpa watermark)"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGeneratePDF}
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-3 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                      <span>Membuat PDF Lengkap...</span>
                    </>
                  ) : (
                    <>
                      <Download className="text-xl" />
                      <span>Unduh Laporan PDF Lengkap</span>
                    </>
                  )}
                </button>

                <div className="mt-6 text-sm text-center text-gray-600">
                  Laporan akan diunduh untuk: <span className="font-semibold text-gray-900">{selectedBusiness.name}</span> | Periode Keuangan:{" "}
                  <span className="font-semibold text-gray-900">Tahun {selectedYear}</span>
                </div>
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h4 className="mb-3 font-semibold text-gray-900">Catatan Penting:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">&#8226;</span>
                <span>
                  PDF Lengkap menggabungkan <strong className="text-gray-900">Business Plan</strong> dan <strong className="text-gray-900">Laporan Keuangan</strong> dalam satu dokumen
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">&#8226;</span>
                <span>
                  Format PDF dalam <strong className="text-gray-900">landscape A4</strong> untuk kemudahan membaca tabel
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">&#8226;</span>
                <span>
                  Mode <strong className="text-gray-900">FREE</strong> akan menambahkan watermark, Mode <strong className="text-gray-900">PRO</strong> tanpa watermark
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">&#8226;</span>
                <span>Pastikan bisnis Anda memiliki data lengkap (business plan dan transaksi keuangan)</span>
              </li>
            </ul>
          </div>

          {/* Subscription History */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <SubscriptionHistory />
          </div>
        </>
      )}

      {/* Payment Modal */}
      <PdfProPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Consultation Request Modal */}
      <RequestConsultation
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        reportType="Laporan Lengkap"
        reportId={selectedBusiness?.id}
      />
    </div>
  );
};

export default ExportPDFLengkap;
