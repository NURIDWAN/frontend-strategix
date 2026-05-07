import React from 'react';
import { Crown, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProFeatureLock = ({ 
    title = "Fitur Eksklusif Pro", 
    description = "Dapatkan insights mendalam dan hasil forecast otomatis untuk memudahkan perencanaan bisnis Anda.",
    features = [
        "Prediksi Pendapatan & Pengeluaran 12 Bulan",
        "Auto-Insight AI tentang Kesehatan Keuangan",
        "Analisis Tren & Grafik Interaktif",
        "Export Laporan Forecast ke PDF"
    ],
    onBack
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-in fade-in zoom-in duration-300">
            {/* Visual element */}
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl rotate-12 absolute -top-2 -right-2 opacity-20 blur-xl"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 rounded-2xl flex items-center justify-center relative border-2 border-yellow-200 dark:border-yellow-700 shadow-xl">
                    <Crown size={48} className="text-yellow-600 dark:text-yellow-400" />
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                        <Lock size={16} className="text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                {title}
            </h2>
            <p className="max-w-md text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {description}
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mb-10 text-left">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Kembali
                    </button>
                )}
                <Link
                    to="/pricing"
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/20 transform transition-all hover:scale-105 active:scale-95"
                >
                    Upgrade ke Pro Sekarang
                    <ArrowRight size={18} />
                </Link>
            </div>

            {/* Trust badge */}
            <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Bergabunglah dengan 500+ pebisnis Pro lainnya
            </p>
        </div>
    );
};

export default ProFeatureLock;
