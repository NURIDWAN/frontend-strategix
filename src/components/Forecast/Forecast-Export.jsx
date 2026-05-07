import React, { useState } from 'react';
import { Download, Loader, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { pdfForecastApi } from '../../services/forecast/forecastApi';

const ForecastExport = ({ forecastData, generatedResults, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mode, setMode] = useState('free');

    const handleGeneratePDF = async () => {
        if (!forecastData || !forecastData.id) {
            setMessage({ type: 'error', text: 'Data forecast tidak tersedia' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await pdfForecastApi.generatePdf(forecastData.id, mode, false);
            
            if (response.status === 'success' && response.data.pdf_base64) {
                // Convert base64 to blob
                const binaryString = window.atob(response.data.pdf_base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = response.data.filename || 'forecast-report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                setMessage({ 
                    type: 'success', 
                    text: `✓ PDF berhasil diunduh: ${response.data.filename}` 
                });
            } else {
                setMessage({ type: 'error', text: response.message || 'Gagal generate PDF' });
            }
        } catch (error) {
            console.error('Error exporting PDF:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Gagal mengexport PDF' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Export Forecast Report
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tahun {forecastData.year} {forecastData.month && `- Bulan ${forecastData.month}`}
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
                >
                    ← Kembali
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Options */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Pilihan Export
                            </h3>
                            
                            {/* Mode Selection */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                                    style={{
                                        borderColor: mode === 'free' ? '#3b82f6' : '#e5e7eb',
                                        backgroundColor: mode === 'free' ? '#eff6ff' : 'transparent'
                                    }}>
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="free"
                                        checked={mode === 'free'}
                                        onChange={(e) => setMode(e.target.value)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Mode Standar</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Format PDF dasar</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all opacity-50"
                                    style={{
                                        borderColor: mode === 'premium' ? '#8b5cf6' : '#e5e7eb',
                                        backgroundColor: mode === 'premium' ? '#faf5ff' : 'transparent'
                                    }}>
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="premium"
                                        disabled
                                        className="w-4 h-4 cursor-not-allowed"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Mode Premium <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">Coming Soon</span></p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Format PDF dengan grafik</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleGeneratePDF}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    Sedang memproses...
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    Generate & Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Preview & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Message Alert */}
                    {message.text && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${
                            message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                            message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="font-medium">{message.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Forecast Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" />
                            Ringkasan Data Forecast
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tahun</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{forecastData.year}</p>
                            </div>
                            {forecastData.month && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bulan</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">Bulan {forecastData.month}</p>
                                </div>
                            )}
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendapatan Historis</p>
                                <p className="text-lg font-bold text-green-600">Rp {parseFloat(forecastData.income_sales).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pengeluaran Historis</p>
                                <p className="text-lg font-bold text-red-600">Rp {parseFloat(forecastData.expense_operational).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    {/* PDF Contents Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Konten PDF Report
                        </h3>
                        
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Ringkasan Eksekutif Forecast</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Data Historis & Proyeksi</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Statistik Kepercayaan Prediksi</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Analisis Insights & Rekomendasi</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Detail Bulan per Bulan (jika tersedia)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForecastExport;
