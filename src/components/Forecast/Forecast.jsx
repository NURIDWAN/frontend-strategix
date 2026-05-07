import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertCircle, Download, Crown } from 'lucide-react';
import ForecastList from './Forecast-List';
import ForecastView from './Forecast-View';
import ForecastResults from './Forecast-Results';
import ProFeatureLock from '../Common/ProFeatureLock';
import singapayApi from '../../services/singapayApi';

const Forecast = ({ activeSubSection, setActiveSubSection }) => {
    const [view, setView] = useState('main');
    const [selectedForecastData, setSelectedForecastData] = useState(null);
    const [selectedGeneratedForecast, setSelectedGeneratedForecast] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [checkingPro, setCheckingPro] = useState(true);

    useEffect(() => {
        checkProAccess();
        if (activeSubSection) {
            setView(activeSubSection);
        } else {
            setView('main');
        }
    }, [activeSubSection]);

    const checkProAccess = async () => {
        try {
            const response = await singapayApi.checkAccess();
            setIsPro(response.data?.has_access || false);
        } catch (error) {
            console.error("Failed to check Pro access for Forecast:", error);
            setIsPro(false);
        } finally {
            setCheckingPro(false);
        }
    };

    const handleSubSectionClick = (subSectionId) => {
        setActiveSubSection(subSectionId);
        setView(subSectionId);
    };

    const handleBackToMain = () => {
        setActiveSubSection('');
        setView('main');
    };

    const handleCreateSuccess = () => {
        handleBackToMain();
        setRefreshKey((prev) => prev + 1);
    };

    const handleViewGeneratedForecast = (forecastData, generatedResults) => {
        setSelectedForecastData(forecastData);
        setSelectedGeneratedForecast(generatedResults);
        setView('view-results');
    };

    const renderMainView = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Forecast Keuangan
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Prediksi pendapatan & pengeluaran dengan metode ARIMA dan AI
                </p>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            📊 Prediksi Keuangan Akurat
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Analisis data historis dan prediksi pendapatan serta pengeluaran untuk 12 bulan ke depan
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSubSectionClick('daftar-forecast')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                            <TrendingUp size={18} />
                            Lihat Forecast
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Data Input Card */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-green-300 dark:hover:border-green-600"
                    onClick={() => handleSubSectionClick('daftar-forecast')}
                >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Daftar Forecast
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Kelola dan lihat semua data forecast historis yang telah dibuat
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                        <span>Kelola Data</span>
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Hasil Forecast Card */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-orange-300 dark:hover:border-orange-600 relative overflow-hidden"
                    onClick={() => handleSubSectionClick('hasil-forecast')}
                >
                    {!checkingPro && !isPro && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Crown size={10} />
                            PRO
                        </div>
                    )}
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Hasil & Insights
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Dapatkan insight otomatis tentang puncak pendapatan dan risiko keuangan
                    </p>
                    <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium">
                        <span>Lihat Insights</span>
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-6 rounded-lg">
                <div className="flex gap-4">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Tentang Forecast Keuangan
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            Fitur forecast menggunakan data historis untuk memprediksi pendapatan dan pengeluaran bulan depan dengan metode ARIMA atau Exponential Smoothing.
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                            <li>📈 Prediksi akurat berdasarkan tren historis</li>
                            <li>🎯 Insight otomatis tentang risiko dan peluang</li>
                            <li>📊 Visualisasi data dalam bentuk chart</li>
                            <li>🔄 Dua metode forecasting untuk perbandingan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {view === 'main' && renderMainView()}
                {view === 'daftar-forecast' && (
                    <ForecastList
                        key={refreshKey}
                        onViewGeneratedForecast={handleViewGeneratedForecast}
                        onCreateNew={() => handleSubSectionClick('buat-forecast')}
                        onBack={handleBackToMain}
                    />
                )}
                {view === 'view-results' && selectedForecastData && selectedGeneratedForecast && (
                    !isPro ? (
                        <ProFeatureLock 
                            onBack={handleBackToMain}
                            description="Fitur detail hasil forecast per bulan hanya tersedia untuk pengguna Paket Pro. Upgrade sekarang untuk melihat grafik tren dan data detail."
                        />
                    ) : (
                        <ForecastView
                            forecastData={selectedForecastData}
                            generatedResults={selectedGeneratedForecast}
                            onBack={handleBackToMain}
                        />
                    )
                )}
                {view === 'hasil-forecast' && (
                    !isPro ? (
                        <ProFeatureLock onBack={handleBackToMain} />
                    ) : (
                        <ForecastResults onBack={handleBackToMain} />
                    )
                )}
            </div>
        </div>
    );
};

export default Forecast;
