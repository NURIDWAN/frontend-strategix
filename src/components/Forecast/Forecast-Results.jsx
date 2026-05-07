import React, { useState, useEffect } from 'react';
import { Loader, ArrowLeft, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { forecastDataApi } from '../../services/forecast/forecastApi';
import { toast } from 'react-toastify';
import ForecastView from './Forecast-View';

const ForecastResults = ({ onBack }) => {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForecast, setSelectedForecast] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', atau 'export'
    const [deletingId, setDeletingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ title: "", message: "", type: "info" });
    const [forecastViewModes, setForecastViewModes] = useState({}); // Track view mode for each forecast

    useEffect(() => {
        loadSavedForecasts();
    }, []);

    const loadSavedForecasts = async () => {
        try {
            setLoading(true);
            const response = await forecastDataApi.getList();

            // Handle different response formats
            let forecastList = [];
            if (response.data) {
                forecastList = Array.isArray(response.data) ? response.data : (response.data.data || []);
            } else if (Array.isArray(response)) {
                forecastList = response;
            }

            // Extract available years and months
            const yearsSet = new Set();
            const monthsSet = new Set();

            forecastList.forEach(forecast => {
                if (forecast.year) yearsSet.add(forecast.year);
                if (forecast.month) monthsSet.add(forecast.month);
            });


            setForecasts(forecastList.map(forecast => {
                if (forecast.results_with_insights) {
                    return forecast;
                }

                return {
                    ...forecast,
                    results_with_insights: {
                        results: forecast.forecast_results || [],
                        insights: forecast.insights || [],
                        annual_summary: {
                            total_income: forecast.forecast_results?.reduce((sum, r) => sum + parseFloat(r.forecast_income || 0), 0) || 0,
                            total_expense: forecast.forecast_results?.reduce((sum, r) => sum + parseFloat(r.forecast_expense || 0), 0) || 0,
                            total_profit: forecast.forecast_results?.reduce((sum, r) => sum + parseFloat(r.forecast_profit || 0), 0) || 0,
                            avg_margin: forecast.forecast_results?.length > 0
                                ? forecast.forecast_results.reduce((sum, r) => sum + parseFloat(r.forecast_margin || 0), 0) / forecast.forecast_results.length
                                : 0,
                            avg_confidence: forecast.forecast_results?.length > 0
                                ? forecast.forecast_results.reduce((sum, r) => sum + parseFloat(r.confidence_level || 0), 0) / forecast.forecast_results.length
                                : 0,
                        },
                        yearly_summary: [],
                    }
                };
            }));
        } catch (error) {
            console.error('Error loading forecasts:', error);
            setForecasts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (forecast) => {
        setSelectedForecast(forecast);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedForecast(null);
    };



    const handleDeleteForecast = async (forecastId) => {
        // Tampilkan modal konfirmasi
        setModalData({
            title: 'Konfirmasi Hapus Forecast',
            message: 'Apakah Anda yakin ingin menghapus forecast ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            forecastId: forecastId,
            isConfirmDialog: true,
        });
        setShowModal(true);
    };

    const handleConfirmDelete = async (forecastId) => {
        setShowModal(false);
        try {
            setDeletingId(forecastId);
            await forecastDataApi.delete(forecastId);

            // Reload data setelah delete
            setForecasts(forecasts.filter(f => f.id !== forecastId));

            // Toast notification sukses
            toast.success('Forecast berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting forecast:', error);

            // Modal notification error
            setModalData({
                title: 'Gagal Menghapus Forecast',
                message: 'Terjadi kesalahan saat menghapus forecast. Silakan coba lagi.',
                type: 'error',
                isConfirmDialog: false,
            });
            setShowModal(true);
        } finally {
            setDeletingId(null);
        }
    };

    const getMonthName = (monthNumber) => {
        const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[monthNumber] || '-';
    };

    const toggleForecastView = (forecastId) => {
        setForecastViewModes(prev => ({
            ...prev,
            [forecastId]: prev[forecastId] === 'monthly' ? 'yearly' : 'monthly'
        }));
    };

    const getForecastViewMode = (forecastId) => {
        return forecastViewModes[forecastId] || 'yearly'; // Default to yearly for yearly forecasts
    };



    if (viewMode === 'detail' && selectedForecast) {
        return (
            <ForecastView
                forecastData={selectedForecast}
                generatedResults={selectedForecast.results_with_insights || {}}
                onBack={handleBackToList}
            />
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                Hasil & Insights Forecast
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Kelola semua hasil forecast dan insights yang telah disimpan
                            </p>
                        </div>
                    </div>

                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">Memuat forecast yang tersimpan...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && forecasts.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Belum ada forecast yang disimpan</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Generate forecast dari menu "Daftar Forecast", lalu klik "Simpan" untuk menyimpan hasil prediksi.
                        </p>
                    </div>
                )}

                {/* Forecasts List */}
                {!loading && forecasts.length > 0 && (
                    <div className="space-y-6">
                        {forecasts.length > 0 ? (
                            forecasts.map((forecast, idx) => (
                                <div
                                    key={forecast.id || idx}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                    <div className="p-6 space-y-6">
                                        {/* Header & Quick Stats */}
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {!forecast.month || forecast.month === null ? (
                                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded">FORECAST TAHUN</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">FORECAST BULAN</span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                        {!forecast.month || forecast.month === null ? 'Forecast Tahun' : getMonthName(forecast.month)} {forecast.year}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Dibuat: {forecast.created_at ? new Date(forecast.created_at).toLocaleDateString('id-ID') : '-'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(forecast)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 font-medium text-sm"
                                                    >
                                                        <TrendingUp size={16} />
                                                        Lihat Detail
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteForecast(forecast.id)}
                                                        disabled={deletingId === forecast.id}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Hapus forecast ini"
                                                    >
                                                        <Trash2 size={16} />
                                                        {deletingId === forecast.id ? 'Menghapus...' : 'Hapus'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Pendapatan</p>
                                                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                                                        Rp {forecast.results_with_insights?.annual_summary?.total_income
                                                            ? parseFloat(forecast.results_with_insights.annual_summary.total_income).toLocaleString('id-ID')
                                                            : '0'}
                                                    </p>
                                                </div>
                                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total Pengeluaran</p>
                                                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                                        Rp {forecast.results_with_insights?.annual_summary?.total_expense
                                                            ? parseFloat(forecast.results_with_insights.annual_summary.total_expense).toLocaleString('id-ID')
                                                            : '0'}
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Laba</p>
                                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                        Rp {forecast.results_with_insights?.annual_summary?.total_profit
                                                            ? parseFloat(forecast.results_with_insights.annual_summary.total_profit).toLocaleString('id-ID')
                                                            : '0'}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Rata-rata Margin</p>
                                                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                                        {forecast.results_with_insights?.annual_summary?.avg_margin
                                                            ? parseFloat(forecast.results_with_insights.annual_summary.avg_margin).toFixed(2)
                                                            : '0'}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Toggle for Yearly Forecasts */}
                                        {forecast.results_with_insights?.yearly_summary?.length > 0 && (
                                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Tampilan Data</h4>
                                                <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700">
                                                    <button
                                                        onClick={() => setForecastViewModes(prev => ({ ...prev, [forecast.id]: 'yearly' }))}
                                                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${getForecastViewMode(forecast.id) === 'yearly'
                                                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                            }`}
                                                    >
                                                        Per Tahun
                                                    </button>
                                                    <button
                                                        onClick={() => setForecastViewModes(prev => ({ ...prev, [forecast.id]: 'monthly' }))}
                                                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${getForecastViewMode(forecast.id) === 'monthly'
                                                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                            }`}
                                                    >
                                                        Per Bulan
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Charts Section - Conditional based on forecast type */}
                                        {forecast.results_with_insights?.results && forecast.results_with_insights.results.length > 0 && (
                                            <div>
                                                {/* Yearly Forecast View */}
                                                {forecast.results_with_insights?.yearly_summary?.length > 0 && getForecastViewMode(forecast.id) === 'yearly' ? (
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Tampilan Tahunan</h4>

                                                        {/* Yearly Trends Charts */}
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            {/* Yearly Income Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Tren Pendapatan Tahunan</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <LineChart data={forecast.results_with_insights.yearly_summary}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Line type="monotone" dataKey="total_income" stroke="#10b981" dot={true} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Yearly Expense Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Tren Pengeluaran Tahunan</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <LineChart data={forecast.results_with_insights.yearly_summary}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Line type="monotone" dataKey="total_expense" stroke="#ef4444" dot={true} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Yearly Profit Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Tren Laba Tahunan</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <BarChart data={forecast.results_with_insights.yearly_summary}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Bar dataKey="total_profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Yearly Margin Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Tren Margin Profit Tahunan (%)</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <LineChart data={forecast.results_with_insights.yearly_summary}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}%`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Line type="monotone" dataKey="avg_margin" stroke="#8b5cf6" dot={true} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>

                                                        {/* Yearly Summary Cards */}
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                            {forecast.results_with_insights.yearly_summary.map((yearData, idx) => (
                                                                <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                                                    <h5 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                                                                        {yearData.year}
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        <div>
                                                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mb-0.5">Pendapatan</p>
                                                                            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                                                                                Rp {(parseFloat(yearData.total_income) / 1000000).toFixed(1)}M
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mb-0.5">Laba</p>
                                                                            <p className={`text-xs font-semibold ${yearData.total_profit >= 0
                                                                                ? 'text-green-700 dark:text-green-300'
                                                                                : 'text-red-700 dark:text-red-300'
                                                                                }`}>
                                                                                Rp {(parseFloat(yearData.total_profit) / 1000000).toFixed(1)}M
                                                                            </p>
                                                                        </div>
                                                                        <div className="pt-1 border-t border-blue-200 dark:border-blue-700">
                                                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mb-0.5">Margin</p>
                                                                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                                                                {yearData.avg_margin}%
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Monthly Forecast View */
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Grafik Forecast Bulanan</h4>
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            {/* Income Chart */}
                                                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Pendapatan</h5>
                                                                <ResponsiveContainer width="100%" height={180}>
                                                                    <LineChart data={forecast.results_with_insights.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                                        <YAxis tick={{ fontSize: 11 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                                                        <Line type="monotone" dataKey="forecast_income" stroke="#10b981" dot={false} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Expense Chart */}
                                                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Pengeluaran</h5>
                                                                <ResponsiveContainer width="100%" height={180}>
                                                                    <LineChart data={forecast.results_with_insights.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                                        <YAxis tick={{ fontSize: 11 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                                                        <Line type="monotone" dataKey="forecast_expense" stroke="#ef4444" dot={false} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Profit Chart */}
                                                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Laba</h5>
                                                                <ResponsiveContainer width="100%" height={180}>
                                                                    <BarChart data={forecast.results_with_insights.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                                        <YAxis tick={{ fontSize: 11 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                                                        <Bar dataKey="forecast_profit" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Margin Chart */}
                                                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Margin Profit (%)</h5>
                                                                <ResponsiveContainer width="100%" height={180}>
                                                                    <LineChart data={forecast.results_with_insights.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                                        <YAxis tick={{ fontSize: 11 }} />
                                                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}%`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                                                        <Line type="monotone" dataKey="forecast_margin" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 mb-2">Tidak ada forecast yang sesuai dengan filter</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Coba ubah filter tahun atau bulan untuk melihat grafik forecast lainnya.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi & Notifikasi */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle
                                size={24}
                                className={
                                    modalData.type === "error" ? "text-red-500" :
                                        modalData.type === "warning" ? "text-yellow-500" :
                                            "text-blue-500"
                                }
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {modalData.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                                    {modalData.message}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            {modalData.isConfirmDialog ? (
                                <>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => handleConfirmDelete(modalData.forecastId)}
                                        disabled={deletingId === modalData.forecastId}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deletingId === modalData.forecastId ? 'Menghapus...' : 'Hapus'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
                                >
                                    Tutup
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ForecastResults;
