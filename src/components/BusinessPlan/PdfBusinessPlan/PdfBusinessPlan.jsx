import React, { useState, useEffect } from "react";
import { backgroundApi } from "../../../services/businessPlan/backgroundApi";
import pdfBusinessPlanApi from "../../../services/businessPlan/pdfBusinessPlanApi";
// TODO: Comment - FinancialPlan nonaktif di Business Plan
// import { financialPlanApi, operationalPlanApi } from "../../../services/businessPlan";
import { operationalPlanApi } from "../../../services/businessPlan";
import ChartCaptureRenderer from "./ChartCaptureRenderer";

const PdfBusinessPlan = ({ onBack }) => {
  const [businessBackgrounds, setBusinessBackgrounds] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedBusinessData, setSelectedBusinessData] = useState(null);
  const [mode, setMode] = useState("free");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState([]);
  const [isCapturingCharts, setIsCapturingCharts] = useState(false);
  const [financialPlan, setFinancialPlan] = useState(null);
  const [chartImages, setChartImages] = useState(null);
  const [operationalPlans, setOperationalPlans] = useState([]);

  useEffect(() => {
    loadBusinessBackgrounds();
    loadStatistics();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      loadSelectedBusinessData();
    } else {
      setSelectedBusinessData(null);
      setValidationErrors([]);
    }
  }, [selectedBusiness]);

  const loadBusinessBackgrounds = async () => {
    try {
      const response = await backgroundApi.getAll();
      if (response.data.status === "success") {
        setBusinessBackgrounds(response.data.data);
      }
    } catch (error) {
      console.error("Error loading business backgrounds:", error);
      setMessage({ type: "error", text: "Gagal memuat data bisnis" });
    }
  };

  const loadSelectedBusinessData = async () => {
    try {
      const response = await backgroundApi.getById(selectedBusiness);
      if (response.data.status === "success") {
        setSelectedBusinessData(response.data.data);
        // TODO: Comment - FinancialPlan nonaktif di Business Plan
        // Load financial plan untuk business ini
        // await loadFinancialPlan(selectedBusiness);
        // Load operational plans untuk business ini
        await loadOperationalPlans(selectedBusiness);
      }
    } catch (error) {
      console.error("Error loading selected business data:", error);
    }
  };

  // TODO: Comment - FinancialPlan nonaktif di Business Plan
  /*
  const loadFinancialPlan = async (businessBackgroundId) => {
    try {
      const response = await financialPlanApi.getAll();
      console.log("Financial Plan API Response:", response.data); // Debug log

      if (response.data.status === "success") {
        let plans = response.data.data;

        // Pastikan plans adalah array
        if (!Array.isArray(plans)) {
          console.warn("Plans is not an array, converting...", plans);
          // Jika data adalah object dengan property plans atau items
          if (plans && typeof plans === "object") {
            plans = plans.plans || plans.items || plans.data || [];
          } else {
            plans = [];
          }
        }

        console.log("Financial Plans Array:", plans); // Debug log

        // Cari financial plan yang sesuai dengan business background
        const plan = plans.find((p) => p.business_background_id === parseInt(businessBackgroundId));

        console.log("Found Financial Plan:", plan); // Debug log
        setFinancialPlan(plan || null);
      }
    } catch (error) {
      console.error("Error loading financial plan:", error);
      setFinancialPlan(null);
    }
  };
  */

  const loadOperationalPlans = async (businessBackgroundId) => {
    try {
      const response = await operationalPlanApi.getAll();
      if (response.data.status === "success") {
        const plans = response.data.data.filter((plan) => plan.business_background_id == businessBackgroundId && plan.workflow_diagram);
        console.log("Operational Plans with Workflow:", plans);
        setOperationalPlans(plans);
      }
    } catch (error) {
      console.error("Error loading operational plans:", error);
      setOperationalPlans([]);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await pdfBusinessPlanApi.getStatistics();
      if (response.data.status === "success") {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const validateBusinessData = () => {
    const errors = [];

    if (!selectedBusinessData) {
      errors.push("Data bisnis tidak ditemukan");
      return errors;
    }

    // Validasi data minimal yang diperlukan
    if (!selectedBusinessData.name) {
      errors.push("Nama bisnis harus diisi");
    }

    if (!selectedBusinessData.description) {
      errors.push("Deskripsi bisnis harus diisi");
    }

    if (!selectedBusinessData.category) {
      errors.push("Kategori bisnis harus diisi");
    }

    return errors;
  };

  const handleGeneratePdf = async (preview = false) => {
    if (!selectedBusiness) {
      setMessage({ type: "error", text: "Pilih bisnis terlebih dahulu" });
      return;
    }

    // Validasi data sebelum generate PDF
    const errors = validateBusinessData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setMessage({
        type: "error",
        text: "Data bisnis belum lengkap. Silakan lengkapi data terlebih dahulu.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setValidationErrors([]);

    try {
      // TODO: Comment - FinancialPlan nonaktif di Business Plan
      // Jika ada financial plan, capture charts terlebih dahulu
      let charts = null;

      // console.log("Financial Plan:", financialPlan);

      /*
      if (financialPlan && !preview) {
        console.log("Starting chart capture...");
        setMessage({ type: "info", text: "Memproses grafik keuangan..." });

        // Set capturing state dan tunggu state update
        setIsCapturingCharts(true);

        // Tunggu hingga charts di-capture
        charts = await new Promise((resolve, reject) => {
          // ChartCaptureRenderer akan memanggil callback ini
          window.__chartCaptureComplete = (capturedCharts) => {
            console.log("Charts captured:", capturedCharts);
            resolve(capturedCharts);
          };
          window.__chartCaptureError = reject;

          // Timeout 30 detik
          setTimeout(() => {
            reject(new Error("Timeout capturing charts"));
          }, 30000);
        });

        setIsCapturingCharts(false);
        setChartImages(charts);
        console.log("Charts ready to send:", charts);
      } else if (!financialPlan) {
        console.warn("No financial plan found for this business");
      }
      */

      if (preview) {
        const response = await pdfBusinessPlanApi.previewPdf(selectedBusiness, mode);
        if (response.data.status === "success") {
          setPreviewData(response.data.data);
          setPreviewOpen(true);
        }
      } else {
        setMessage({ type: "info", text: "Membuat PDF..." });
        
        // Panggil API generate PDF (sekarang return JSON dengan base64)
        const response = await pdfBusinessPlanApi.generatePdf(selectedBusiness, mode, charts);
        
        if (response.data.status === "success") {
          const { filename, pdf_base64 } = response.data.data;
          
          // Convert base64 ke blob
          const byteCharacters = atob(pdf_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          setMessage({ type: "success", text: "PDF berhasil diunduh" });
        } else {
          throw new Error(response.data.message || 'Failed to generate PDF');
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsCapturingCharts(false);

      let errorMessage = "Gagal menghasilkan PDF. ";

      if (error.message === "Timeout capturing charts") {
        errorMessage += "Timeout saat memproses grafik. Silakan coba lagi.";
      } else if (error.response?.status === 500) {
        errorMessage += "Server error. Pastikan semua data bisnis sudah lengkap dan valid.";
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += "Silakan coba lagi atau hubungi administrator.";
      }

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExecutiveSummary = async () => {
    if (!selectedBusiness) {
      setMessage({ type: "error", text: "Pilih bisnis terlebih dahulu" });
      return;
    }

    // Validasi data sebelum generate executive summary
    const errors = validateBusinessData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setMessage({
        type: "error",
        text: "Data bisnis belum lengkap. Silakan lengkapi data terlebih dahulu.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await pdfBusinessPlanApi.generateExecutiveSummary(selectedBusiness);
      if (response.data.status === "success") {
        setPreviewData({
          executive_summary: response.data.data.executive_summary,
          business_name: response.data.data.business_name,
          type: "executive_summary",
        });
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error generating executive summary:", error);
      setMessage({ type: "error", text: "Gagal menghasilkan ringkasan eksekutif" });
    } finally {
      setLoading(false);
    }
  };

  const getBusinessCompletionStatus = () => {
    if (!selectedBusinessData) return 0;

    let completedFields = 0;
    const requiredFields = ["name", "description", "category", "location", "business_type"];

    requiredFields.forEach((field) => {
      if (selectedBusinessData[field]) completedFields++;
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  };

  return (
    <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header dengan Back Button */}
        <div className="mb-8">
          <button onClick={onBack} className="px-4 py-2 mb-4 text-gray-700 transition-colors duration-200 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            ← Kembali ke Menu Utama
          </button>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">📊 PDF Business Plan</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate laporan business plan profesional dalam format PDF</p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_business_plans}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Business Plans</div>
            </div>
            <div className="p-6 text-center bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg dark:bg-green-900/20">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.pdf_usage?.generated_today || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">PDF Generated Today</div>
            </div>
          </div>
        )}

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                : "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-400">⚠️ Data yang perlu dilengkapi:</h3>
            <ul className="space-y-1 text-yellow-700 list-disc list-inside dark:text-yellow-300">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Business Completion Status */}
        {selectedBusinessData && (
          <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Status Kelengkapan Data</h3>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{getBusinessCompletionStatus()}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="h-2 transition-all duration-300 bg-green-500 rounded-full" style={{ width: `${getBusinessCompletionStatus()}%` }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{getBusinessCompletionStatus() >= 80 ? "✅ Data sudah cukup lengkap untuk generate PDF" : "⚠️ Lengkapi data terlebih dahulu untuk hasil yang optimal"}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
            {/* Business Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Bisnis</label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih bisnis...</option>
                {businessBackgrounds.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mode PDF</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="free">🆓 Gratis - Dengan Watermark</option>
                <option value="pro">💎 Pro - Tanpa Watermark</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => handleGeneratePdf(true)}
              disabled={loading || !selectedBusiness || getBusinessCompletionStatus() < 50}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors duration-200 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={getBusinessCompletionStatus() < 50 ? "Lengkapi data minimal 50% untuk preview" : ""}
            >
              {loading ? <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin"></div> : "👁️ Preview"}
            </button>

            <button
              onClick={() => handleGeneratePdf(false)}
              disabled={loading || !selectedBusiness || getBusinessCompletionStatus() < 80}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title={getBusinessCompletionStatus() < 80 ? "Lengkapi data minimal 80% untuk download PDF" : ""}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div> : "📥 Download PDF"}
            </button>

            <button
              onClick={handleGenerateExecutiveSummary}
              disabled={loading || !selectedBusiness || getBusinessCompletionStatus() < 50}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-colors duration-200 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title={getBusinessCompletionStatus() < 50 ? "Lengkapi data minimal 50% untuk ringkasan eksekutif" : ""}
            >
              📄 Ringkasan Eksekutif
            </button>
          </div>

          {/* Features Info */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">✨ Fitur PDF Business Plan:</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Ringkasan Eksekutif otomatis</li>
              <li>• Analisis pasar dan kompetitor</li>
              <li>• Rencana keuangan lengkap</li>
              <li>• Struktur organisasi</li>
              <li>• Strategi pemasaran dan operasional</li>
              <li>• Format profesional dan rapi</li>
            </ul>
          </div>
        </div>

        {/* Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preview - {previewData?.business_name || "Business Plan"}</h2>
                  <button onClick={() => setPreviewOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {previewData?.type === "executive_summary" ? (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Ringkasan Eksekutif</h3>
                    <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                      <pre className="font-sans text-gray-700 whitespace-pre-line dark:text-gray-300">{previewData.executive_summary}</pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Data Preview untuk PDF</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Filename:</strong> {previewData?.filename}
                      </p>
                      <p>
                        <strong>Mode:</strong> {previewData?.mode === "free" ? "🆓 Gratis (Watermark)" : "💎 Pro (Tanpa Watermark)"}
                      </p>

                      <div className="mt-4">
                        <h4 className="mb-2 font-medium text-gray-900 dark:text-white">Data yang akan dimasukkan dalam PDF:</h4>
                        <ul className="space-y-1">
                          <li>• Informasi Bisnis: {previewData?.preview_data?.business_background?.name}</li>
                          <li>• Analisis Pasar: {previewData?.preview_data?.market_analysis ? "✅" : "❌"}</li>
                          <li>• Produk/Layanan: {previewData?.preview_data?.products_services?.length || 0} item</li>
                          <li>• Strategi Pemasaran: {previewData?.preview_data?.marketing_strategies?.length || 0} item</li>
                          <li>• Rencana Operasional: {previewData?.preview_data?.operational_plans?.length || 0} item</li>
                          <li>• Struktur Tim: {previewData?.preview_data?.team_structures?.length || 0} anggota</li>
                          <li>• Rencana Keuangan: {previewData?.preview_data?.financial_plans?.length || 0} plan</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 text-gray-700 transition-colors duration-200 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Tutup
                </button>
                {previewData?.type !== "executive_summary" && (
                  <button
                    onClick={() => {
                      setPreviewOpen(false);
                      handleGeneratePdf(false);
                    }}
                    className="px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TODO: Comment - FinancialPlan nonaktif di Business Plan */}
        {/* Chart Capture Renderer (Hidden) */}
        {/* {isCapturingCharts && financialPlan && (
          <ChartCaptureRenderer
            financialPlan={financialPlan}
            onCaptureComplete={(charts) => {
              if (window.__chartCaptureComplete) {
                window.__chartCaptureComplete(charts);
              }
            }}
            onError={(error) => {
              if (window.__chartCaptureError) {
                window.__chartCaptureError(error);
              }
            }}
          />
        )} */}

        {/* Workflows are now generated on backend */}
      </div>
    </div>
  );
};

export default PdfBusinessPlan;
