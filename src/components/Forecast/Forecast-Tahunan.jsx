import React, { useState, useEffect } from 'react';
import { Loader, ArrowLeft, TrendingUp, ChevronDown, ChevronUp, TrendingDown, Save, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { financialSimulationApi } from '../../services/managementFinancial/financialSimulationApi';
import { forecastResultsApi, forecastDataApi } from '../../services/managementFinancial/forecastApi';

const ForecastTahunan = ({ onBack }) => {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState('auto');
    const [forecastDuration, setForecastDuration] = useState(36); // Default 3 tahun
    const [generatingYear, setGeneratingYear] = useState(null);
    const [savingYear, setSavingYear] = useState(null);
    const [expandedYear, setExpandedYear] = useState(null);
    const [yearForecasts, setYearForecasts] = useState({});
    const [savedYears, setSavedYears] = useState(new Set());
    const [viewModes, setViewModes] = useState({}); // Track view mode per year (yearly/monthly)

    useEffect(() => {
        loadYears();
    }, []);

    const loadYears = async () => {
        try {
            setLoading(true);
            const response = await financialSimulationApi.getList();

            let simulationList = [];
            if (response.data) {
                simulationList = Array.isArray(response.data) ? response.data : (response.data.data || []);
            } else if (Array.isArray(response)) {
                simulationList = response;
            }

            // Extract unique years and sort descending
            const yearsSet = new Set();
            simulationList.forEach((sim) => {
                if (sim.year) yearsSet.add(sim.year);
            });

            const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
            setYears(sortedYears);
        } catch (error) {
            console.error('Error loading years:', error);
            toast.error('Gagal memuat data tahun', { autoClose: 3000 });
            setYears([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateYearForecast = async (year) => {
        try {
            setGeneratingYear(year);

            // Get first simulation for the year
            const response = await financialSimulationApi.getList({ year });
            let simulations = [];
            if (response.data) {
                simulations = Array.isArray(response.data) ? response.data : (response.data.data || []);
            }

            if (simulations.length === 0) {
                toast.error(`Tidak ada data simulasi untuk tahun ${year}`, { autoClose: 3000 });
                return;
            }

            const firstSimId = simulations[0].id;

            // Generate forecast
            const forecastResponse = await forecastResultsApi.generateFromSimulation(firstSimId, {
                forecast_months: forecastDuration,
                method: selectedMethod,
                year: year,
                month: null, // Null for year forecast
                forecast_label: `Forecast Tahun ${year} (Semua Bulan)`,
            });

            // Store in state
            setYearForecasts((prev) => ({
                ...prev,
                [year]: forecastResponse.data?.data || forecastResponse.data || forecastResponse,
            }));

            setExpandedYear(year);
            toast.success(`Forecast Tahun ${year} berhasil dibuat!`, { autoClose: 3000 });
        } catch (error) {
            console.error('Error generating forecast:', error);
            const errorMsg = error.response?.data?.message || 'Gagal membuat forecast tahun ini';
            toast.error(errorMsg, { autoClose: 3000 });
        } finally {
            setGeneratingYear(null);
        }
    };

    const getYearStats = (year) => {
        const forecast = yearForecasts[year];
        if (!forecast || !forecast.results) return null;

        const results = forecast.results;
        const totalIncome = results.reduce((sum, r) => sum + parseFloat(r.forecast_income || 0), 0);
        const totalExpense = results.reduce((sum, r) => sum + parseFloat(r.forecast_expense || 0), 0);
        const totalProfit = totalIncome - totalExpense;
        const avgMargin = results.length > 0
            ? results.reduce((sum, r) => sum + parseFloat(r.forecast_margin || 0), 0) / results.length
            : 0;

        return { totalIncome, totalExpense, totalProfit, avgMargin };
    };

    const handleSaveYearForecast = async (year) => {
        try {
            setSavingYear(year);
            const forecast = yearForecasts[year];

            if (!forecast || !forecast.results) {
                toast.error('Tidak ada data forecast untuk disimpan', { autoClose: 3000 });
                return;
            }

            // Create forecast data entry
            const response = await forecastDataApi.create({
                year: year,
                month: null, // Null for year forecast
                forecast_label: `Forecast Tahun ${year} (Semua Bulan)`,
            });

            const forecastDataId = response.data.id || response.data?.data?.id;

            if (!forecastDataId) {
                toast.error('Gagal menyimpan forecast data', { autoClose: 3000 });
                return;
            }

            // Save forecast results
            await forecastDataApi.update(forecastDataId, {
                method: selectedMethod,
                forecast_months: forecastDuration,
            });

            // Generate dan simpan results melalui generate endpoint
            await forecastDataApi.generate(forecastDataId, {
                method: selectedMethod,
                forecast_months: forecastDuration,
            });

            setSavedYears((prev) => new Set([...prev, year]));
            toast.success(`Forecast Tahun ${year} berhasil disimpan ke Hasil & Insight!`, { autoClose: 3000 });
        } catch (error) {
            console.error('Error saving forecast:', error);
            const errorMsg = error.message || 'Gagal menyimpan forecast tahun ini';
            toast.error(errorMsg, { autoClose: 3000 });
        } finally {
            setSavingYear(null);
        }
    };

    const getViewMode = (year) => {
        return viewModes[year] || 'yearly'; // Default to yearly
    };

    const toggleViewMode = (year) => {
        setViewModes(prev => ({
            ...prev,
            [year]: prev[year] === 'monthly' ? 'yearly' : 'monthly'
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Memuat data tahun...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Forecast Tahunan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Analisis prediksi keuangan untuk seluruh tahun dengan agregasi data semua bulan
                    </p>
                </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pengaturan Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="method-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Metode Prediksi
                        </label>
                        <select
                            id="method-select"
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="auto">Auto (ARIMA)</option>
                            <option value="arima">ARIMA</option>
                            <option value="exponential_smoothing">Exponential Smoothing</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Durasi Forecast Tahunan
                        </label>
                        <select
                            id="duration-select"
                            value={forecastDuration}
                            onChange={(e) => setForecastDuration(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="36">3 Tahun (36 Bulan)</option>
                            <option value="60">5 Tahun (60 Bulan)</option>
                            <option value="120">10 Tahun (120 Bulan)</option>
                        </select>
                    </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Forecast tahunan mengagregasi data dari semua bulan dalam tahun tersebut
                </div>
            </div>

            {/* Years List */}
            {years.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400">Belum ada data tahun untuk forecast</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {years.map((year) => {
                        const isExpanded = expandedYear === year;
                        const forecast = yearForecasts[year];
                        const stats = getYearStats(year);

                        return (
                            <div key={year} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Year Header */}
                                <div
                                    onClick={() => setExpandedYear(isExpanded ? null : year)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer group"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            Tahun {year}
                                        </h3>
                                        {stats && (
                                            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                                                <span>💰 Pendapatan: Rp {stats.totalIncome.toLocaleString('id-ID')}</span>
                                                <span>📊 Laba: Rp {stats.totalProfit.toLocaleString('id-ID')}</span>
                                                <span>📈 Margin: {stats.avgMargin.toFixed(2)}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                        {!forecast && (
                                            <button
                                                onClick={() => handleGenerateYearForecast(year)}
                                                disabled={generatingYear === year}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                            >
                                                {generatingYear === year ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Generate...
                                                    </>
                                                ) : (
                                                    <>
                                                        <TrendingUp size={16} />
                                                        Generate Forecast
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {isExpanded ? (
                                            <ChevronUp size={24} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                        ) : (
                                            <ChevronDown size={24} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && forecast && forecast.results && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30 space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            ✓ Forecast Tahun {year} berhasil dibuat
                                        </h4>

                                        {/* View Toggle */}
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Pilih tampilan data:</p>
                                            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700">
                                                <button
                                                    onClick={() => setViewModes(prev => ({ ...prev, [year]: 'yearly' }))}
                                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${getViewMode(year) === 'yearly'
                                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                        }`}
                                                >
                                                    Per Tahun
                                                </button>
                                                <button
                                                    onClick={() => setViewModes(prev => ({ ...prev, [year]: 'monthly' }))}
                                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${getViewMode(year) === 'monthly'
                                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                        }`}
                                                >
                                                    Per Bulan
                                                </button>
                                            </div>
                                        </div>

                                        {/* Conditional View: Yearly or Monthly */}
                                        {getViewMode(year) === 'yearly' && forecast.yearly_summary?.length > 0 ? (
                                            /* Yearly View */
                                            <div className="space-y-4">
                                                {/* Yearly Summary Cards */}
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                    {forecast.yearly_summary.map((yearData, idx) => (
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

                                                {/* Yearly Comparison Chart */}
                                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Perbandingan Tahunan</h5>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart data={forecast.yearly_summary}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                                            <YAxis tick={{ fontSize: 12 }} />
                                                            <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                                            <Bar dataKey="total_income" fill="#10b981" name="Pendapatan" radius={[3, 3, 0, 0]} />
                                                            <Bar dataKey="total_expense" fill="#ef4444" name="Pengeluaran" radius={[3, 3, 0, 0]} />
                                                            <Bar dataKey="total_profit" fill="#3b82f6" name="Laba" radius={[3, 3, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Monthly View */
                                            <>
                                                {/* Charts Grid */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {/* Income Chart */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Pendapatan Tahun {year}</h5>
                                                        <ResponsiveContainer width="100%" height={200}>
                                                            <LineChart data={forecast.results}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                                <YAxis tick={{ fontSize: 12 }} />
                                                                <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                <Line type="monotone" dataKey="forecast_income" stroke="#10b981" dot={false} strokeWidth={2} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>

                                                    {/* Profit Chart */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Laba Tahun {year}</h5>
                                                        <ResponsiveContainer width="100%" height={200}>
                                                            <BarChart data={forecast.results}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                                <YAxis tick={{ fontSize: 12 }} />
                                                                <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                <Bar dataKey="forecast_profit" fill="#3b82f6" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Detail Table */}
                                                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                                                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Bulan</th>
                                                                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Pendapatan</th>
                                                                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Pengeluaran</th>
                                                                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Laba</th>
                                                                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Margin</th>
                                                                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Confidence</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                            {forecast.results?.map((result, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">Bln {result.month}</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Rp {parseFloat(result.forecast_income).toLocaleString('id-ID')}</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Rp {parseFloat(result.forecast_expense).toLocaleString('id-ID')}</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Rp {parseFloat(result.forecast_profit).toLocaleString('id-ID')}</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parseFloat(result.forecast_margin).toFixed(2)}%</td>
                                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parseFloat(result.confidence_level || 0).toFixed(0)}%</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => handleSaveYearForecast(year)}
                                                disabled={savingYear === year || savedYears.has(year)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                            >
                                                {savingYear === year ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Menyimpan...
                                                    </>
                                                ) : savedYears.has(year) ? (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        Tersimpan
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={16} />
                                                        Simpan ke Hasil & Insight
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => onBack()}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                                            >
                                                <ArrowLeft size={16} />
                                                Kembali ke Pilihan
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
            }
        </div>
    );
};

export default ForecastTahunan;
