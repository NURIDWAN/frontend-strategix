import React, { useState, useEffect } from "react";
import { X, Calendar, Check, AlertCircle, Loader } from "lucide-react";
import singapayApi from "../../services/singapayApi";

const ConsultationTopupModal = ({ isOpen, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [bankCode, setBankCode] = useState("BRI");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await singapayApi.getPackages();
      const payload = response?.data || {};

      if (payload.success) {
        const apiPackages = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.packages)
          ? payload.packages
          : [];

        const consultationPackages = apiPackages.filter((pkg) => pkg.package_type === "consultation");
        setPackages(consultationPackages);

        if (consultationPackages.length > 0) {
          setSelectedPackage((prev) => {
            if (!prev) return consultationPackages[0];
            return consultationPackages.find((pkg) => pkg.id === prev.id) || consultationPackages[0];
          });
        } else {
          setSelectedPackage(null);
          setError("Paket top up konsultasi belum tersedia saat ini.");
        }
      } else {
        setError("Gagal mengambil paket.");
      }
    } catch (err) {
      setError("Terjadi kesalahan server saat mengambil paket.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError("Pilih paket konsultasi terlebih dahulu.");
      return;
    }
    
    setProcessing(true);
    setError(null);

    try {
      const payload = {
        package_id: selectedPackage.id,
        payment_method: paymentMethod,
        ...(paymentMethod === "virtual_account" && { bank_code: bankCode }),
      };

      const response = await singapayApi.createPurchase(payload);

      if (response.data.success && response.data.payment.is_redirect) {
        // Redirect to SingaPay checkout URL
        window.location.href = response.data.payment.payment_url;
      } else {
        setError("Gagal membuat pembayaran.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top-up Kredit Konsultasi</h3>
            <p className="text-xs text-gray-500">Beli sesi tambahan untuk diskusi mendalam bersama pakar.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 transition-colors bg-white border border-gray-200 rounded-full dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin text-green-500" size={32} />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
              <AlertCircle className="inline-block mb-2" size={24} />
              <p>{error}</p>
              <button
                onClick={fetchPackages}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-100"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Package Selection */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pilih Paket Sesi Konsultasi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                        selectedPackage?.id === pkg.id 
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className={`font-bold ${selectedPackage?.id === pkg.id ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                          {pkg.name}
                        </h5>
                        {selectedPackage?.id === pkg.id && <Check className="text-green-500" size={18} />}
                      </div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                        {pkg.formatted_price}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {pkg.consultation_credits} Sesi • Berlaku {pkg.duration_days ? `${pkg.duration_days} Hari` : 'Selamanya'}
                      </div>
                      <ul className="text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
                        {(pkg.features || []).map((f, i) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <Check size={12} className="text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Metode Pembayaran</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod("qris")}
                    className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                      paymentMethod === "qris" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center font-bold text-blue-600 text-xs text-center leading-none">
                      QRIS
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">QRIS</span>
                      <span className="text-xs text-gray-500">Otomatis / Instan</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("virtual_account")}
                    className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                      paymentMethod === "virtual_account" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center font-bold text-orange-600 text-[10px] text-center leading-none border border-orange-200">
                      VA
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Virtual Acc</span>
                      <span className="text-xs text-gray-500">Bank Transfer</span>
                    </div>
                  </div>
                </div>

                {/* Bank Selector for VA */}
                {paymentMethod === "virtual_account" && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pilih Bank</label>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full p-2 text-sm border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="BRI">Bank BRI</option>
                      <option value="BNI">Bank BNI</option>
                      <option value="DANAMON">Bank Danamon</option>
                      <option value="MAYBANK">Bank Maybank</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            onClick={handlePurchase}
            disabled={processing || !selectedPackage}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-colors flex items-center justify-center min-w-[120px] ${
              processing || !selectedPackage ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {processing ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              `Bayar ${selectedPackage ? selectedPackage.formatted_price : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationTopupModal;
