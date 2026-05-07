import React, { useState, useEffect } from "react";
import { consultationApi } from "../../services/consultationApi";
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Check, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  Video,
  MessageSquare,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";
import { backgroundApi } from "../../services/businessPlan/backgroundApi";

const RequestConsultation = ({ isOpen, onClose, reportType, reportId }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCredits] = useState(0);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(reportId || "");

  useEffect(() => {
    if (isOpen) {
      fetchConsultants();
      fetchCredits();
      fetchBusinesses();
      setStep(1);
      setSelectedConsultant(null);
      setSelectedDate("");
      setSelectedSlot(null);
      setTopic("");
      setSelectedBusinessId(reportId || "");
    }
  }, [isOpen, reportId]);

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const response = await consultationApi.getConsultants();
      setConsultants(response.data.data);
    } catch (error) {
      toast.error("Gagal mengambil daftar konsultan");
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await consultationApi.getCredits();
      setCredits(response.data.data.total_remaining);
    } catch (error) {
       console.error("Failed to fetch credits");
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await backgroundApi.getAll();
      setBusinesses(response.data.data);
    } catch (error) {
      console.error("Failed to fetch businesses");
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    
    if (selectedConsultant && date) {
      setLoading(true);
      try {
        const response = await consultationApi.getAvailableSlots(selectedConsultant.id, date);
        setAvailableSlots(response.data.data);
        if (response.data.data.length === 0 && response.data.message) {
           toast.info(response.data.message);
        }
      } catch (error) {
        toast.error("Gagal mengambil jadwal");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !topic) return;

    setSubmitting(true);
    try {
      await consultationApi.requestSession({
        consultant_id: selectedConsultant.id,
        date: selectedDate,
        start_time: selectedSlot.start,
        topic: topic,
        report_type: selectedBusinessId ? "Laporan Lengkap" : reportType,
        related_report_id: selectedBusinessId || reportId
      });
      toast.success("Konsultasi berhasil dijadwalkan!");
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menjadwalkan konsultasi";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Jadwalkan Konsultasi Premium</h3>
            <p className="text-sm text-gray-500 mt-1">Sisa kredit: <span className="font-bold text-green-600">{credits} Sesi</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 flex items-center gap-2">
                <div className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                {i < 3 && <ChevronRight size={12} className="text-gray-300" />}
              </div>
            ))}
          </div>

          {/* Stepper Content */}
          <div className="min-h-[350px]">
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={18} className="text-green-600" /> Pilih Pakar Konsultan
                </h4>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
                    <p className="text-sm text-gray-500">Memuat pakar...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consultants.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConsultant(c)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          selectedConsultant?.id === c.id 
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/10' 
                          : 'border-gray-100 dark:border-gray-700 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                             {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.specialization}</div>
                            <div className="flex items-center gap-1 mt-1">
                               <Check size={12} className="text-green-600" />
                               <span className="text-[10px] text-green-700 font-bold uppercase">{c.completed_sessions} Review</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon size={18} className="text-green-600" /> Pilih Jadwal & Waktu
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tanggal</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Slot Jam Tersedia (Auto-Sync)</label>
                    {loading ? (
                       <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                         <Loader2 size={16} className="animate-spin" /> Mencari slot kosong...
                       </div>
                    ) : selectedDate ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 text-xs font-bold rounded-lg border transition-all ${
                              selectedSlot === slot 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-600'
                            }`}
                          >
                            {slot.start} - {slot.end}
                          </button>
                        ))}
                        {availableSlots.length === 0 && (
                          <div className="col-span-2 py-4 text-center text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
                             Tidak ada slot tersedia di tanggal ini.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-3 text-sm text-gray-400 italic">Pilih tanggal terlebih dahulu</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-green-600" /> Konfirmasi Konsultasi
                </h4>
                
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-start gap-4">
                   <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-green-600 shadow-sm border border-green-100 dark:border-green-800">
                      <Video size={24} />
                   </div>
                   <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Pertemuan Online (Video Call)</div>
                      <div className="text-xs text-gray-500 mt-1">Tautan meeting akan diberikan oleh konsultan setelah sesi dikonfirmasi.</div>
                   </div>
                </div>

                <div className="space-y-4">
                  {/* Business Report Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pilih Laporan / Bisnis Terkait (Opsional)</label>
                    <div className="relative">
                      <select
                        value={selectedBusinessId}
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-600 outline-none dark:text-white text-sm appearance-none"
                      >
                        <option value="">-- Tidak ada laporan tertaut --</option>
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>Laporan Lengkap - {b.name}</option>
                        ))}
                      </select>
                      <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Topik atau Masalah Utama</label>
                    <textarea 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      rows={4}
                      placeholder="Apa yang ingin Anda diskusikan dengan konsultan kami?"
                      className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-600 outline-none dark:text-white text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
                    <AlertCircle size={14} />
                    <span>Konfirmasi ini akan mengurangi 1 kredit sesi dari akun Anda.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {step === 1 ? 'Batal' : 'Kembali'}
            </button>
            
            <button 
              disabled={(step === 1 && !selectedConsultant) || (step === 2 && !selectedSlot) || (step === 3 && (!topic || submitting)) || credits === 0}
              onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
              className="px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {step < 3 ? 'Lanjut' : 'Konfirmasi & Potong Kredit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestConsultation;
