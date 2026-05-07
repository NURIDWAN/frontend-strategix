import React, { useState } from 'react';
import { AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { forecastResultsApi } from '../../services/forecast/forecastApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastCreate = ({ onCancel }) => {
    const [formData, setFormData] = useState({
        income_sales: '',
        income_other: '',
        expense_operational: '',
        expense_other: '',
        seasonal_factor: '1.0',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [simulationResults, setSimulationResults] = useState(null);
    const [durationMonths, setDurationMonths] = useState(12);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSimulate = async (e) => {
        e.preventDefault();
        setError('');
        setSimulationResults(null);
        setLoading(true);

        try {
            if (!formData.income_sales || !formData.expense_operational) {
                setError('Pendapatan penjualan dan pengeluaran operasional harus diisi');
                setLoading(false);
                return;
            }

            // Simulate forecast data
            const totalIncome = parseFloat(formData.income_sales) + (parseFloat(formData.income_other) || 0);
            const totalExpense = parseFloat(formData.expense_operational) + (parseFloat(formData.expense_other) || 0);
            const seasonalFactor = parseFloat(formData.seasonal_factor) || 1.0;

            // Generate simulated forecast data
            const results = [];
            const baseIncome = totalIncome * seasonalFactor;
            const baseExpense = totalExpense * seasonalFactor;
            let growthRate = 0.02; // 2% monthly growth

            for (let month = 1; month <= durationMonths; month++) {
                const monthlyIncome = baseIncome * (1 + growthRate * month);
                const monthlyExpense = baseExpense * (1 + (growthRate * 0.7) * month);
                const profit = monthlyIncome - monthlyExpense;
                const margin = (profit / monthlyIncome) * 100;
                const confidence = 85 + Math.random() * 10; // 85-95% confidence

                results.push({
                    month,
                    forecast_income: monthlyIncome,
                    forecast_expense: monthlyExpense,
                    forecast_profit: profit,
                    forecast_margin: margin,
                    confidence_level: confidence,
                });
            }

            // Calculate annual summary
            const totalForecasted = {
                total_income: results.reduce((sum, r) => sum + r.forecast_income, 0),
                total_expense: results.reduce((sum, r) => sum + r.forecast_expense, 0),
                total_profit: results.reduce((sum, r) => sum + r.forecast_profit, 0),
                avg_margin: results.reduce((sum, r) => sum + r.forecast_margin, 0) / results.length,
                avg_confidence: results.reduce((sum, r) => sum + r.confidence_level, 0) / results.length,
            };

            setSimulationResults({
                results,
                annual_summary: totalForecasted,
            });
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat membuat simulasi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Simulasi Forecast Keuangan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Coba prediksi dengan menginputkan data. Data tidak akan disimpan, hanya untuk simulasi.
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
                        <form onSubmit={handleSimulate} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Input Data</h3>
                            </div>

                            {/* Pendapatan Penjualan */}
                            <div>
                                <label htmlFor="income_sales" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pendapatan Penjualan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="income_sales"
                                    type="number"
                                    name="income_sales"
                                    value={formData.income_sales}
                                    onChange={handleChange}
                                    placeholder="100000"
                                    step="1000"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Pendapatan Lain */}
                            <div>
                                <label htmlFor="income_other" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pendapatan Lain
                                </label>
                                <input
                                    id="income_other"
                                    type="number"
                                    name="income_other"
                                    value={formData.income_other}
                                    onChange={handleChange}
                                    placeholder="0"
                                    step="1000"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Pengeluaran Operasional */}
                            <div>
                                <label htmlFor="expense_operational" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pengeluaran Operasional <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="expense_operational"
                                    type="number"
                                    name="expense_operational"
                                    value={formData.expense_operational}
                                    onChange={handleChange}
                                    placeholder="50000"
                                    step="1000"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Pengeluaran Lain */}
                            <div>
                                <label htmlFor="expense_other" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Pengeluaran Lain
                                </label>
                                <input
                                    id="expense_other"
                                    type="number"
                                    name="expense_other"
                                    value={formData.expense_other}
                                    onChange={handleChange}
                                    placeholder="0"
                                    step="1000"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Faktor Seasonal */}
                            <div>
                                <label htmlFor="seasonal_factor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Faktor Seasonal
                                </label>
                                <input
                                    id="seasonal_factor"
                                    type="number"
                                    name="seasonal_factor"
                                    value={formData.seasonal_factor}
                                    onChange={handleChange}
                                    placeholder="1.0"
                                    step="0.1"
                                    min="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    1.0 = normal, &gt; 1.0 = musim tinggi
                                </p>
                            </div>

                            {/* Duration */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Durasi Forecast
                                </label>
                                <select
                                    id="duration"
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value={12}>12 Bulan (1 Tahun)</option>
                                    <option value={24}>24 Bulan (2 Tahun)</option>
                                    <option value={36}>36 Bulan (3 Tahun)</option>
                                    <option value={48}>48 Bulan (4 Tahun)</option>
                                    <option value={60}>60 Bulan (5 Tahun)</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 font-medium text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 text-sm"
                                >
                                    <TrendingUp size={16} />
                                    {loading ? 'Simulasi...' : 'Simulasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    {simulationResults ? (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                    <p className="text-xs text-blue-100 mb-1">Total Pendapatan</p>
                                    <p className="text-xl font-bold">
                                        Rp {parseFloat(simulationResults.annual_summary.total_income).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                                    <p className="text-xs text-red-100 mb-1">Total Pengeluaran</p>
                                    <p className="text-xl font-bold">
                                        Rp {parseFloat(simulationResults.annual_summary.total_expense).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                                    <p className="text-xs text-green-100 mb-1">Total Laba</p>
                                    <p className="text-xl font-bold">
                                        Rp {parseFloat(simulationResults.annual_summary.total_profit).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                                    <p className="text-xs text-purple-100 mb-1">Rata-rata Margin</p>
                                    <p className="text-xl font-bold">
                                        {parseFloat(simulationResults.annual_summary.avg_margin).toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            {/* Chart - Income vs Expense */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Proyeksi Pendapatan vs Pengeluaran
                                </h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={simulationResults.results}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" label={{ value: 'Bulan', position: 'insideBottomRight', offset: -5 }} />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                                        <Legend />
                                        <Bar dataKey="forecast_income" fill="#3b82f6" name="Pendapatan" />
                                        <Bar dataKey="forecast_expense" fill="#ef4444" name="Pengeluaran" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Chart - Profit Margin */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Proyeksi Margin Keuntungan
                                </h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={simulationResults.results}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" label={{ value: 'Bulan', position: 'insideBottomRight', offset: -5 }} />
                                        <YAxis label={{ value: 'Margin %', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="forecast_margin" stroke="#10b981" name="Margin %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detail Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Proyeksi</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Bulan</th>
                                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Pendapatan</th>
                                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Pengeluaran</th>
                                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Laba</th>
                                                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Margin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {simulationResults.results.map((result, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-4 py-2 text-gray-900 dark:text-white">Bln {result.month}</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                                        Rp {parseFloat(result.forecast_income).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                                        Rp {parseFloat(result.forecast_expense).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                                        Rp {parseFloat(result.forecast_profit).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                                        {parseFloat(result.forecast_margin).toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <BarChart3 size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Isi form di sebelah kiri dan klik "Simulasi" untuk melihat proyeksi keuangan
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-6 rounded-lg">
                <div className="flex gap-4">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Tentang Simulasi Forecast
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                            <li>Ini adalah halaman simulasi untuk mencoba berbagai skenario keuangan</li>
                            <li>Data yang Anda masukkan tidak akan disimpan ke database</li>
                            <li>Gunakan fitur ini untuk eksperimen dan melihat proyeksi sebelum membuat forecast resmi di "Daftar Forecast"</li>
                            <li>Hasil simulasi menunjukkan pertumbuhan 2% per bulan dengan faktor seasonal</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForecastCreate;
