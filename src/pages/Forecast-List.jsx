import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';

const ForecastList = ({ onBack }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [forecastType, setForecastType] = useState('all'); // 'month' or 'all'

    const handleGenerateForecast = () => {
        // TODO: Implement forecast generation logic
        console.log('Generating forecast for', selectedYear, 'type:', forecastType);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="text-gray-600 dark:text-gray-400" size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Buat Forecast Baru
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Generate forecast dengan metode ARIMA dan AI
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="space-y-6">
                    {/* Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            <Calendar className="inline mr-2" size={16} />
                            Pilih Tahun
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {[2024, 2025, 2026, 2027, 2028].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Forecast Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Tipe Forecast
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="forecastType"
                                    value="month"
                                    checked={forecastType === 'month'}
                                    onChange={(e) => setForecastType(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Per Bulan (Month)
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="forecastType"
                                    value="all"
                                    checked={forecastType === 'all'}
                                    onChange={(e) => setForecastType(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Semua Bulan Sekaligus (All)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleGenerateForecast}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Generate Forecast
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Informasi Forecast
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Forecast menggunakan metode ARIMA dan Machine Learning</li>
                    <li>• Data historis minimal 12 bulan diperlukan untuk hasil optimal</li>
                    <li>• Pilih "Per Bulan" untuk generate forecast bulan per bulan</li>
                    <li>• Pilih "Semua Bulan" untuk generate semua bulan sekaligus</li>
                </ul>
            </div>
        </div>
    );
};

export default ForecastList;
