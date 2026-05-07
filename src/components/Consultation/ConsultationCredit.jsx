import React, { useState, useEffect } from "react";
import { consultationApi } from "../../services/consultationApi";
import { Calendar, CreditCard, Clock, Plus } from "lucide-react";
import RequestConsultation from "./RequestConsultation";

const ConsultationCredit = ({ onTopUp }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchCredits = async () => {
    try {
      const response = await consultationApi.getCredits();
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (!data || data.total_remaining === 0) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <CreditCard className="text-orange-600 dark:text-orange-400" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-400">Sesi Konsultasi</h4>
            <p className="text-xs text-orange-700 dark:text-orange-300">Anda belum memiliki kredit konsultasi.</p>
          </div>
        </div>

        {typeof onTopUp === "function" && (
          <button
            onClick={onTopUp}
            className="mt-3 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> Top Up Konsultasi
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-green-600" size={18} />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Kredit Konsultasi</h4>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
            AKTIF
          </span>
        </div>
        
        <div className="flex items-end gap-1 mb-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.total_remaining}</span>
          <span className="text-sm text-gray-500 mb-1">Sesi Tersisa</span>
        </div>

        <button 
          onClick={() => setIsBookingOpen(true)}
          className="mt-3 mb-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Calendar size={16} /> Pesan Jadwal Konsultasi
        </button>

        {typeof onTopUp === "function" && (
          <button
            onClick={onTopUp}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> Top Up Konsultasi
          </button>
        )}

        <div className="space-y-2 mt-4">
          {data.details.map((credit) => (
            <div key={credit.id} className="text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
              <span className="truncate max-w-[120px]">{credit.package?.name || 'Paket Kustom'}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                 {credit.expires_at ? new Date(credit.expires_at).toLocaleDateString() : 'Tanpa Expire'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <RequestConsultation 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          fetchCredits(); // Reload after booking
        }} 
      />
    </>
  );
};

export default ConsultationCredit;
