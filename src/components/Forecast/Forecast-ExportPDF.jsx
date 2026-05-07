import React, { useState, useEffect } from 'react';
import { Download, Loader, Eye, AlertCircle, FileText } from 'lucide-react';
import { pdfForecastApi } from '../../services/forecast/forecastApi';
import ForecastChartCaptureRenderer from './Forecast-ChartCaptureRenderer';

const ForecastExportPDF = ({ forecastData, generatedResults, chartRefs }) => {
    const [mode, setMode] = useState('free');
    const [loading, setLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isCapturingCharts, setIsCapturingCharts] = useState(false);
    const [chartImages, setChartImages] = useState(null);

    const handleGeneratePdf = async (preview = false) => {
        if (!forecastData || !forecastData.id) {
            setMessage({ type: 'error', text: 'Data forecast tidak tersedia' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let charts = null;

            // Capture charts jika ada hasil forecast
            if (generatedResults?.results && generatedResults.results.length > 0 && !preview) {
                console.log('Starting chart capture...');
                setMessage({ type: 'info', text: 'Memproses grafik...' });
                setIsCapturingCharts(true);

                // Tunggu hingga charts di-capture
                charts = await new Promise((resolve, reject) => {
                    window.__forecastChartCaptureComplete = (capturedCharts) => {
                        console.log('Charts captured:', capturedCharts);
                        resolve(capturedCharts);
                    };
                    window.__forecastChartCaptureError = reject;

                    setTimeout(() => {
                        reject(new Error('Timeout capturing charts'));
                    }, 30000);
                });

                setIsCapturingCharts(false);
                setChartImages(charts);
                console.log('Charts ready:', charts);
            }

            if (preview) {
                const response = await pdfForecastApi.generatePdf(forecastData.id, mode, null, true);
                if (response.status === 'success') {
                    setPreviewData(response.data);
                    setPreviewOpen(true);
                }
            } else {
                setMessage({ type: 'info', text: 'Membuat PDF...' });
                
                const response = await pdfForecastApi.generatePdf(forecastData.id, mode, charts, false);
                
                if (response.status === 'success') {
                    const { filename, pdf_base64 } = response.data;
                    
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

                    setMessage({ type: 'success', text: 'PDF berhasil diunduh' });
                } else {
                    throw new Error(response.message || 'Failed to generate PDF');
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            setIsCapturingCharts(false);

            let errorMessage = 'Gagal menghasilkan PDF. ';
            if (error.message === 'Timeout capturing charts') {
                errorMessage += 'Timeout saat memproses grafik. Silakan coba lagi.';
            } else if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else {
                errorMessage += 'Silakan coba lagi atau hubungi administrator.';
            }

            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3">
                {/* Mode Selection */}
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    <option value="free">🆓 Gratis (Watermark)</option>
                    <option value="pro">💎 Pro (Tanpa Watermark)</option>
                </select>

                {/* Preview Button */}
                <button
                    onClick={() => handleGeneratePdf(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader size={16} className="animate-spin" />
                    ) : (
                        <Eye size={16} />
                    )}
                    Preview
                </button>

                {/* Download PDF Button */}
                <button
                    onClick={() => handleGeneratePdf(false)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader size={16} className="animate-spin" />
                    ) : (
                        <Download size={16} />
                    )}
                    {loading ? 'Generating...' : 'Download PDF'}
                </button>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`mt-4 p-4 rounded-lg ${
                    message.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                        : message.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                }`}>
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span className="text-sm">{message.text}</span>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewOpen && previewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Preview Laporan Forecast
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {previewData.filename}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mode PDF
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {previewData.mode === 'free' ? '🆓 Gratis (Watermark)' : '💎 Pro (Tanpa Watermark)'}
                                    </span>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                        Konten yang akan disertakan:
                                    </h3>
                                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Ringkasan Eksekutif
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Data Historis
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Hasil Proyeksi dengan Grafik ({generatedResults?.results?.length || 0} bulan)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Analisis Statistik
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Auto Insights ({generatedResults?.insights?.length || 0} insight)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Tabel Detail Proyeksi
                                        </li>
                                    </ul>
                                </div>

                                {generatedResults?.annual_summary && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Pendapatan Proyeksi</p>
                                            <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                                Rp {parseFloat(generatedResults.annual_summary.total_income).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Laba Proyeksi</p>
                                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                                Rp {parseFloat(generatedResults.annual_summary.total_profit).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setPreviewOpen(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    setPreviewOpen(false);
                                    handleGeneratePdf(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart Capture Renderer (Hidden) */}
            {isCapturingCharts && generatedResults && (
                <ForecastChartCaptureRenderer
                    forecastResults={generatedResults.results || []}
                    onCaptureComplete={(charts) => {
                        if (window.__forecastChartCaptureComplete) {
                            window.__forecastChartCaptureComplete(charts);
                        }
                    }}
                    onError={(error) => {
                        if (window.__forecastChartCaptureError) {
                            window.__forecastChartCaptureError(error);
                        }
                    }}
                />
            )}
        </>
    );
};

export default ForecastExportPDF;