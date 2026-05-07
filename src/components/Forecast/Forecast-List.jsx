import React, { useState, useEffect } from 'react';
import { Loader, Plus, TrendingUp, ChevronDown, ChevronUp, Save, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { financialSimulationApi } from '../../services/managementFinancial/financialSimulationApi';
import { forecastResultsApi } from '../../services/forecast/forecastApi';

const ForecastList = ({ onCreateNew, onViewGeneratedForecast }) => {
    const [simulationsData, setSimulationsData] = useState([]);
    const [yearGroups, setYearGroups] = useState({}); // { 2024: [monthGroups], 2025: [monthGroups] }
    const [loading, setLoading] = useState(true);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [filters, setFilters] = useState({
        year: '',
    });
    const [expandedYearKey, setExpandedYearKey] = useState(null);
    const [expandedMonthKey, setExpandedMonthKey] = useState(null);
    const [generatedResults, setGeneratedResults] = useState({});
    const [generatingForecastId, setGeneratingForecastId] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('auto');
    const [forecastDuration, setForecastDuration] = useState(36); // Default 3 tahun (36 bulan)
    const [savingForecastId, setSavingForecastId] = useState(null);
    const [savedForecasts, setSavedForecasts] = useState(new Set());
    const [viewModes, setViewModes] = useState({}); // Track view mode per year (yearly/monthly)

    useEffect(() => {
        loadSimulations();
    }, []);

    const loadSimulations = async () => {
        try {
            setLoading(true);
            const params = {};

            const response = await financialSimulationApi.getList(params);

            // Handle response format: { status: 'success', data: [...] }
            const simulationList = Array.isArray(response.data) ? response.data : [];

            // Group by year and month
            const grouped = {};
            const monthsSet = new Set();
            const yearsSet = new Set();

            simulationList.forEach((sim) => {
                const year = sim.year;
                const month = sim.simulation_date ? new Date(sim.simulation_date).getMonth() + 1 : 1;
                const monthKey = `${year}-${month}`;

                if (!grouped[monthKey]) {
                    grouped[monthKey] = {
                        year,
                        month,
                        monthName: getMonthName(month),
                        simulations: [],
                    };
                }
                grouped[monthKey].simulations.push(sim);
                monthsSet.add(month);
                yearsSet.add(year);
            });

            // No month filtering needed
            let filteredGrouped = grouped;

            // Reorganize by year
            const yearGrouped = {};
            Object.values(filteredGrouped).forEach((monthGroup) => {
                if (!yearGrouped[monthGroup.year]) {
                    yearGrouped[monthGroup.year] = [];
                }
                yearGrouped[monthGroup.year].push(monthGroup);
            });

            // Sort months within each year
            Object.keys(yearGrouped).forEach((year) => {
                yearGrouped[year].sort((a, b) => a.month - b.month);
            });

            setYearGroups(yearGrouped);
            setSimulationsData(Object.values(filteredGrouped).sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return a.month - b.month;
            }));

            const years = Array.from(yearsSet).sort((a, b) => b - a);
            const months = Array.from(monthsSet).sort((a, b) => a - b);

            setAvailableYears(years);
            setAvailableMonths(months);
        } catch (error) {
            console.error('Error loading simulations:', error);
            setSimulationsData([]);
            setYearGroups({});
            setAvailableYears([]);
            setAvailableMonths([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateForecast = async (monthGroup) => {
        try {
            const key = `${monthGroup.year}-${monthGroup.month}`;
            setGeneratingForecastId(key);

            // Get first simulation ID for this month
            const firstSimId = monthGroup.simulations[0].id;

            // Generate forecast with selected method and duration
            const response = await forecastResultsApi.generateFromSimulation(firstSimId, {
                forecast_months: forecastDuration,
                method: selectedMethod,
                year: monthGroup.year,
                month: monthGroup.month,
            });

            setGeneratedResults((prev) => ({
                ...prev,
                [key]: response.data?.data || response.data || response,
            }));
            setExpandedMonthKey(key);
        } catch (error) {
            console.error('Error generating forecast:', error);
            alert('Gagal membuat forecast. Silakan coba lagi.');
        } finally {
            setGeneratingForecastId(null);
        }
    };

    const handleGenerateYearForecast = async (year) => {
        try {
            const key = `year-${year}`;
            setGeneratingForecastId(key);

            // Get all simulations for this year
            const monthGroupsInYear = yearGroups[year] || [];
            if (monthGroupsInYear.length === 0) {
                alert('Tidak ada data untuk tahun ini');
                return;
            }

            // Use first simulation's ID from first month of year
            const firstSimId = monthGroupsInYear[0].simulations[0].id;

            // Generate forecast without specifying month (will aggregate entire year)
            const response = await forecastResultsApi.generateFromSimulation(firstSimId, {
                forecast_months: forecastDuration,
                method: selectedMethod,
                year: year,
                month: null, // No specific month - aggregate entire year
            });

            setGeneratedResults((prev) => ({
                ...prev,
                [key]: response.data?.data || response.data || response,
            }));
            setExpandedYearKey(year);
        } catch (error) {
            console.error('Error generating year forecast:', error);
            alert('Gagal membuat forecast untuk tahun ini. Silakan coba lagi.');
        } finally {
            setGeneratingForecastId(null);
        }
    };

    const handleSaveForecast = async (monthGroup, forecastData) => {
        try {
            const key = monthGroup.month ? `${monthGroup.year}-${monthGroup.month}` : `year-${monthGroup.year}`;
            setSavingForecastId(key);

            // Data sudah otomatis tersimpan dari generateFromSimulation
            // Cek di backend apakah sudah ada forecast_data_id
            if (forecastData.forecast_data_id) {
                // Tandai sebagai sudah disimpan
                setSavedForecasts((prev) => new Set([...prev, key]));
                alert('Forecast berhasil disimpan ke database!');
            }
        } catch (error) {
            console.error('Error saving forecast:', error);
            alert('Gagal menyimpan forecast.');
        } finally {
            setSavingForecastId(null);
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

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const getMonthName = (monthNumber) => {
        const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[monthNumber] || '-';
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            planned: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            cancelled: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
        };

        const statusLabels = {
            completed: 'Selesai',
            planned: 'Rencana',
            cancelled: 'Batal',
        };

        return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[status] || statusStyles.planned}`}>
                {statusLabels[status] || status}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const typeStyles = {
            income: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            expense: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };

        const typeLabels = {
            income: 'Pendapatan',
            expense: 'Pengeluaran',
        };

        return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeStyles[type] || typeStyles.expense}`}>
                {typeLabels[type] || type}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Data Simulasi Keuangan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola semua data simulasi keuangan bisnis Anda
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Forecast Settings */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pengaturan Forecast</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                Durasi Forecast
                            </label>
                            <select
                                id="duration-select"
                                value={forecastDuration}
                                onChange={(e) => setForecastDuration(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="36">3 Tahun</option>
                                <option value="60">5 Tahun</option>
                                <option value="120">10 Tahun</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Metode: <span className="font-medium">{selectedMethod === 'auto' ? 'ARIMA Otomatis' : selectedMethod === 'arima' ? 'ARIMA' : 'Exponential Smoothing'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">Memuat data simulasi keuangan...</p>
                    </div>
                ) : simulationsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Belum ada data simulasi keuangan</p>
                        <button
                            onClick={onCreateNew}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                            <Plus size={18} />
                            Buat Simulasi Pertama
                        </button>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {Object.keys(yearGroups).sort((a, b) => b - a).map((year) => {
                            const yearKey = `year-${year}`;
                            const isYearExpanded = expandedYearKey === parseInt(year);
                            const yearMonths = yearGroups[year] || [];
                            const yearYearForecast = generatedResults[yearKey];

                            // Jika filter tahun dipilih (dan bulan kosong), tampilkan hanya bulan tanpa tahun header
                            const shouldShowYearHeader = !filters.year;
                            const shouldShowYearForecast = !filters.year && !filters.month;

                            return (
                                <div key={year} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    {/* Year Header Row - Tampil hanya jika tidak ada filter tahun */}
                                    {shouldShowYearHeader && (
                                        <div className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent">
                                            <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                                onClick={() => setExpandedYearKey(isYearExpanded ? null : parseInt(year))}>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                            Tahun {year}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {yearMonths.length} bulan • {yearMonths.reduce((sum, m) => sum + m.simulations.length, 0)} transaksi
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleGenerateYearForecast(parseInt(year));
                                                        }}
                                                        disabled={generatingForecastId === yearKey}
                                                        className="inline-flex items-center gap-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                                        title="Generate Forecast untuk seluruh tahun"
                                                    >
                                                        {generatingForecastId === yearKey ? (
                                                            <>
                                                                <Loader size={16} className="animate-spin" />
                                                                Generating Year...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TrendingUp size={16} />
                                                                Generate Tahun
                                                            </>
                                                        )}
                                                    </button>
                                                    {isYearExpanded ? (
                                                        <ChevronUp size={24} className="text-gray-500" />
                                                    ) : (
                                                        <ChevronDown size={24} className="text-gray-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Year Expanded Content - Show Forecast Results - Tampil hanya jika tidak ada filter tahun */}
                                    {shouldShowYearForecast && isYearExpanded && yearYearForecast && (
                                        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded">FORECAST TAHUN</span>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Hasil Forecast {year}</h4>
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                                    ℹ️ Forecast untuk tahun {year} didasarkan pada agregasi data dari semua bulan
                                                </div>
                                                {savedForecasts.has(yearKey) ? (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 text-xs font-medium w-fit">
                                                        <CheckCircle size={14} />
                                                        Tersimpan
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSaveForecast({ year, month: null }, yearYearForecast)}
                                                        disabled={savingForecastId === yearKey}
                                                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                                                    >
                                                        {savingForecastId === yearKey ? (
                                                            <>
                                                                <Loader size={14} className="animate-spin" />
                                                                Menyimpan...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save size={14} />
                                                                Simpan
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

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
                                            {getViewMode(year) === 'yearly' && yearYearForecast.yearly_summary?.length > 0 ? (
                                                /* Yearly View */
                                                <div className="space-y-4">
                                                    {/* Yearly Trends Charts */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        {/* Yearly Income Chart */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Tren Pendapatan Tahunan</h5>
                                                            <ResponsiveContainer width="100%" height={200}>
                                                                <LineChart data={yearYearForecast.yearly_summary}>
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
                                                                <LineChart data={yearYearForecast.yearly_summary}>
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
                                                                <BarChart data={yearYearForecast.yearly_summary}>
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
                                                                <LineChart data={yearYearForecast.yearly_summary}>
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
                                                        {yearYearForecast.yearly_summary.map((yearData, idx) => (
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
                                                /* Monthly View */
                                                <>
                                                    {yearYearForecast.results && yearYearForecast.results.length > 0 ? (
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            {/* Income Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Pendapatan Tahun {year}</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <LineChart data={yearYearForecast.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Line type="monotone" dataKey="forecast_income" stroke="#10b981" dot={false} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Expense Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Pengeluaran Tahun {year}</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <LineChart data={yearYearForecast.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Line type="monotone" dataKey="forecast_expense" stroke="#ef4444" dot={false} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Profit Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Prediksi Laba Tahun {year}</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <BarChart data={yearYearForecast.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `Rp ${parseFloat(value).toLocaleString('id-ID')}`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Bar dataKey="forecast_profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {/* Margin Chart */}
                                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Margin Profit Tahun {year} (%)</h5>
                                                                <ResponsiveContainer width="100%" height={200}>
                                                                    <LineChart data={yearYearForecast.results}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}%`} contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                                                                        <Line type="monotone" dataKey="forecast_margin" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-600 dark:text-gray-400">Belum ada hasil forecast</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Months Under Year - Tampil otomatis jika filter tahun ada, atau jika tahun di-expand */}
                                    {(shouldShowYearHeader ? isYearExpanded : true) && (
                                        <div className="bg-gray-50 dark:bg-gray-700/20 space-y-0">
                                            {yearMonths.map((monthGroup) => {
                                                const monthKey = `${monthGroup.year}-${monthGroup.month}`;
                                                const isMonthExpanded = expandedMonthKey === monthKey;
                                                const hasResults = generatedResults[monthKey];

                                                return (
                                                    <div key={monthKey} className="border-t border-gray-200 dark:border-gray-700">
                                                        {/* Month Header */}
                                                        <div className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent">
                                                            <div className={`${shouldShowYearHeader ? 'px-8' : 'px-6'} py-3 flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors`}
                                                                onClick={() => setExpandedMonthKey(isMonthExpanded ? null : monthKey)}>
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                            {monthGroup.monthName}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            {monthGroup.simulations.length} transaksi
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {isMonthExpanded ? (
                                                                        <ChevronUp size={18} className="text-gray-500" />
                                                                    ) : (
                                                                        <ChevronDown size={18} className="text-gray-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Month Expanded Content */}
                                                        {isMonthExpanded && (
                                                            <div className={`bg-white dark:bg-gray-800 ${shouldShowYearHeader ? 'px-8' : 'px-6'} py-3 space-y-3 border-t border-gray-200 dark:border-gray-700`}
                                                                style={{ marginLeft: '0px' }}>
                                                                {/* Transactions Table - Simpler */}
                                                                <div>
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Transaksi {monthGroup.monthName}</h5>
                                                                        <div className="flex gap-2 text-xs">
                                                                            <span className="text-green-600 dark:text-green-400">
                                                                                In: Rp {monthGroup.simulations
                                                                                    .filter(s => s.type === 'income')
                                                                                    .reduce((sum, s) => sum + parseFloat(s.amount), 0)
                                                                                    .toLocaleString('id-ID')}
                                                                            </span>
                                                                            <span className="text-red-600 dark:text-red-400">
                                                                                Out: Rp {monthGroup.simulations
                                                                                    .filter(s => s.type === 'expense')
                                                                                    .reduce((sum, s) => sum + parseFloat(s.amount), 0)
                                                                                    .toLocaleString('id-ID')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="overflow-x-auto">
                                                                        <table className="w-full text-xs">
                                                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                                                <tr>
                                                                                    <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300">Tanggal</th>
                                                                                    <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300">Tipe</th>
                                                                                    <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300">Kategori</th>
                                                                                    <th className="px-2 py-1 text-right text-gray-700 dark:text-gray-300">Nominal</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                                                {monthGroup.simulations.map((sim) => (
                                                                                    <tr key={sim.id} className="hover:bg-gray-100 dark:hover:bg-gray-600/50">
                                                                                        <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                                                                                            {sim.simulation_date ? new Date(sim.simulation_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : '-'}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">{getTypeBadge(sim.type)}</td>
                                                                                        <td className="px-2 py-1 text-gray-600 dark:text-gray-300 text-xs">{sim.category?.name || '-'}</td>
                                                                                        <td className="px-2 py-1 text-right font-medium text-gray-900 dark:text-white text-xs">
                                                                                            Rp {parseFloat(sim.amount).toLocaleString('id-ID')}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                {/* Month Forecast Results */}
                                                                {hasResults && (
                                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Forecast {monthGroup.monthName}</h5>
                                                                            {savedForecasts.has(monthKey) ? (
                                                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-400 text-xs font-medium">
                                                                                    <CheckCircle size={12} />
                                                                                    Tersimpan
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleSaveForecast(monthGroup, hasResults)}
                                                                                    disabled={savingForecastId === monthKey}
                                                                                    className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 disabled:opacity-50 text-xs font-medium"
                                                                                >
                                                                                    {savingForecastId === monthKey ? (
                                                                                        <>
                                                                                            <Loader size={12} className="animate-spin" />
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Save size={12} />
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        {hasResults.results && hasResults.results.length > 0 ? (
                                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                                                {/* Simplified Charts - Mini versions */}
                                                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2">
                                                                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pendapatan</h6>
                                                                                    <ResponsiveContainer width="100%" height={80}>
                                                                                        <LineChart data={hasResults.results}>
                                                                                            <Line type="monotone" dataKey="forecast_income" stroke="#10b981" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                                                                                        </LineChart>
                                                                                    </ResponsiveContainer>
                                                                                </div>

                                                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2">
                                                                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pengeluaran</h6>
                                                                                    <ResponsiveContainer width="100%" height={80}>
                                                                                        <LineChart data={hasResults.results}>
                                                                                            <Line type="monotone" dataKey="forecast_expense" stroke="#ef4444" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                                                                                        </LineChart>
                                                                                    </ResponsiveContainer>
                                                                                </div>

                                                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2">
                                                                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Laba</h6>
                                                                                    <ResponsiveContainer width="100%" height={80}>
                                                                                        <BarChart data={hasResults.results}>
                                                                                            <Bar dataKey="forecast_profit" fill="#3b82f6" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                                                                                        </BarChart>
                                                                                    </ResponsiveContainer>
                                                                                </div>

                                                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2">
                                                                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Margin (%)</h6>
                                                                                    <ResponsiveContainer width="100%" height={80}>
                                                                                        <LineChart data={hasResults.results}>
                                                                                            <Line type="monotone" dataKey="forecast_margin" stroke="#8b5cf6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                                                                                        </LineChart>
                                                                                    </ResponsiveContainer>
                                                                                </div>
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Card */}
            {Object.keys(yearGroups).length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        Menampilkan <span className="font-semibold">{Object.keys(yearGroups).length}</span> tahun dengan <span className="font-semibold">{simulationsData.length}</span> bulan ({simulationsData.reduce((sum, m) => sum + m.simulations.length, 0)} transaksi)
                    </p>
                </div>
            )}
        </div>
    );
};

export default ForecastList;
