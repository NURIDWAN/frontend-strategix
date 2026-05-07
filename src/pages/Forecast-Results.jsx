import React, { useState } from 'react';
import { ArrowLeft, Download, TrendingUp, Calendar } from 'lucide-react';

const ForecastResults = ({ onBack }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [forecastData, setForecastData] = useState([
        // Placeholder data structure
    ]);

    const handleExport = () => {
        // TODO: Implement export logic
        console.log('Exporting forecast data');
    };

    const handleDeleteForecast = (id) => {
        // TODO: Implement delete logic
        console.log('Deleting forecast:', id);
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
                        Hasil & Insights Forecast
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review semua forecast yang telah disimpan dan dapatkan insights mendalam
                    </p>
                </div>
            </div>

            {/* Filter & Export Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[2024, 2025, 2026, 2027, 2028].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {forecastData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Periode
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        Tipe
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        Penjualan
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        Pengeluaran
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table rows will be populated here */}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Belum Ada Data Forecast
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Buat forecast baru untuk mulai melihat hasil dan insights
                        </p>
                    </div>
                )}
            </div>

            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                            Avg. Income
                        </h4>
                        <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        Rp 0
                    </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                            Avg. Expense
                        </h4>
                        <TrendingUp className="text-orange-600" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        Rp 0
                    </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                            Growth Rate
                        </h4>
                        <TrendingUp className="text-purple-600" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        0%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForecastResults;
