import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, DollarSign, TrendingUp, Calculator, Calendar, ArrowUpCircle, ArrowDownCircle, CreditCard } from 'lucide-react';
import { backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const FinancialPlanForm = ({
    title,
    subtitle,
    formData,
    businesses,
    isLoadingBusinesses,
    isLoading,
    onInputChange,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create'
}) => {
    const [errors, setErrors] = useState({});
    const [activeSection, setActiveSection] = useState('basic');
    const [periodType, setPeriodType] = useState('monthly'); // 'monthly' or 'yearly'

    // Capital source options
    const capitalSourcesOptions = ['Pribadi', 'Pinjaman Bank', 'Investor', 'Keluarga', 'Lainnya'];

    // Capex categories
    const capexCategories = [
        'Peralatan & Mesin',
        'Renovasi & Bangunan',
        'Kendaraan',
        'Teknologi & IT',
        'Furniture',
        'Lisensi & Perizinan',
        'Lainnya'
    ];

    // Opex categories
    const opexCategories = [
        'Gaji & Upah',
        'Sewa Tempat',
        'Listrik & Air',
        'Internet & Telepon',
        'Bahan Baku',
        'Marketing & Iklan',
        'Transportasi',
        'Pemeliharaan',
        'Asuransi',
        'Lainnya'
    ];

    // Payment methods
    const paymentMethods = ['Tunai', 'Transfer Bank', 'Kartu Kredit', 'Lainnya'];

    // Cash flow categories
    const cashFlowCategories = [
        'Penjualan Produk',
        'Penjualan Jasa',
        'Investasi',
        'Pinjaman',
        'Bahan Baku',
        'Gaji & Upah',
        'Sewa',
        'Utilities',
        'Marketing',
        'Transportasi',
        'Pemeliharaan',
        'Lainnya'
    ];

    // Period options
    const periodOptions = [
        { value: 'monthly', label: 'Bulanan', description: 'Data dihitung per bulan' },
        { value: 'yearly', label: 'Tahunan', description: 'Data dihitung per tahun' }
    ];

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        if (name === 'plan_name' && !value.trim()) {
            newErrors.plan_name = 'Nama rencana wajib diisi';
        } else if (name === 'plan_name') {
            delete newErrors.plan_name;
        }

        if (name === 'business_background_id' && !value) {
            newErrors.business_background_id = 'Pilih bisnis terlebih dahulu';
        } else if (name === 'business_background_id') {
            delete newErrors.business_background_id;
        }

        setErrors(newErrors);
    };

    const handleInputChangeWrapper = (name, value) => {
        onInputChange(name, value);
        validateField(name, value);
    };

    // Handle period type change
    const handlePeriodTypeChange = (newPeriodType) => {
        setPeriodType(newPeriodType);

        // Convert existing data if needed
        if (formData.monthly_opex && formData.monthly_opex.length > 0) {
            const convertedOpex = formData.monthly_opex.map(item => ({
                ...item,
                amount: newPeriodType === 'yearly' ? item.amount * 12 : item.amount / 12
            }));
            handleInputChangeWrapper('monthly_opex', convertedOpex);
        }

        if (formData.sales_projections && formData.sales_projections.length > 0) {
            const convertedSales = formData.sales_projections.map(item => ({
                ...item,
                volume: newPeriodType === 'yearly' ? item.volume * 12 : item.volume / 12,
                monthly_income: newPeriodType === 'yearly' ? item.monthly_income * 12 : item.monthly_income / 12
            }));
            handleInputChangeWrapper('sales_projections', convertedSales);
        }
    };

    // Capital Sources Methods
    const addCapitalSource = () => {
        const currentSources = formData.capital_sources || [];
        const newSources = [...currentSources, { source: '', amount: 0, percentage: 0 }];
        handleInputChangeWrapper('capital_sources', newSources);
    };

    const updateCapitalSource = (index, field, value) => {
        const currentSources = [...(formData.capital_sources || [])];
        currentSources[index][field] = value;

        // Recalculate percentages when amounts change
        if (field === 'amount') {
            const total = currentSources.reduce((sum, source) => sum + (parseFloat(source.amount) || 0), 0);
            currentSources.forEach((source, i) => {
                source.percentage = total > 0 ? ((parseFloat(source.amount) || 0) / total * 100).toFixed(1) : 0;
            });
        }

        handleInputChangeWrapper('capital_sources', currentSources);
    };

    const removeCapitalSource = (index) => {
        const currentSources = formData.capital_sources || [];
        const newSources = currentSources.filter((_, i) => i !== index);
        handleInputChangeWrapper('capital_sources', newSources);
    };

    // Capex Methods
    const addCapexItem = () => {
        const currentCapex = formData.initial_capex || [];
        const newCapex = [...currentCapex, { category: '', amount: 0 }];
        handleInputChangeWrapper('initial_capex', newCapex);
    };

    const updateCapexItem = (index, field, value) => {
        const currentCapex = [...(formData.initial_capex || [])];
        currentCapex[index][field] = value;
        handleInputChangeWrapper('initial_capex', currentCapex);
    };

    const removeCapexItem = (index) => {
        const currentCapex = formData.initial_capex || [];
        const newCapex = currentCapex.filter((_, i) => i !== index);
        handleInputChangeWrapper('initial_capex', newCapex);
    };

    // Opex Methods
    const addOpexItem = () => {
        const currentOpex = formData.monthly_opex || [];
        const newOpex = [...currentOpex, {
            category: '',
            amount: 0,
            period: periodType
        }];
        handleInputChangeWrapper('monthly_opex', newOpex);
    };

    const updateOpexItem = (index, field, value) => {
        const currentOpex = [...(formData.monthly_opex || [])];
        currentOpex[index][field] = value;
        handleInputChangeWrapper('monthly_opex', currentOpex);
    };

    const removeOpexItem = (index) => {
        const currentOpex = formData.monthly_opex || [];
        const newOpex = currentOpex.filter((_, i) => i !== index);
        handleInputChangeWrapper('monthly_opex', newOpex);
    };

    // Sales Projections Methods
    const addSalesItem = () => {
        const currentSales = formData.sales_projections || [];
        const newSales = [...currentSales, {
            product: '',
            price: 0,
            volume: 0,
            monthly_income: 0,
            period: periodType
        }];
        handleInputChangeWrapper('sales_projections', newSales);
    };

    const updateSalesItem = (index, field, value) => {
        const currentSales = [...(formData.sales_projections || [])];
        currentSales[index][field] = value;

        // Auto-calculate monthly income
        if (field === 'price' || field === 'volume') {
            const price = field === 'price' ? value : currentSales[index].price;
            const volume = field === 'volume' ? value : currentSales[index].volume;
            currentSales[index].monthly_income = price * volume;
        }

        handleInputChangeWrapper('sales_projections', currentSales);
    };

    const removeSalesItem = (index) => {
        const currentSales = formData.sales_projections || [];
        const newSales = currentSales.filter((_, i) => i !== index);
        handleInputChangeWrapper('sales_projections', newSales);
    };

    // Cash Flow Methods
    const addCashFlowItem = () => {
        const currentCashFlow = formData.cash_flow_simulation || [];
        const newCashFlow = [...currentCashFlow, {
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            category: '',
            description: '',
            amount: 0,
            payment_method: 'Transfer Bank',
            period: periodType
        }];
        handleInputChangeWrapper('cash_flow_simulation', newCashFlow);
    };

    const updateCashFlowItem = (index, field, value) => {
        const currentCashFlow = [...(formData.cash_flow_simulation || [])];
        currentCashFlow[index][field] = value;
        handleInputChangeWrapper('cash_flow_simulation', currentCashFlow);
    };

    const removeCashFlowItem = (index) => {
        const currentCashFlow = formData.cash_flow_simulation || [];
        const newCashFlow = currentCashFlow.filter((_, i) => i !== index);
        handleInputChangeWrapper('cash_flow_simulation', newCashFlow);
    };

    const getCashFlowTypeBadge = (type) => {
        const typeConfig = {
            income: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Pendapatan', icon: ArrowUpCircle },
            expense: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', label: 'Pengeluaran', icon: ArrowDownCircle }
        };

        const config = typeConfig[type] || typeConfig.income;
        const IconComponent = config.icon;

        return (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <IconComponent size={14} />
                {config.label}
            </span>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation - menggunakan formData dari props
        const finalErrors = {};
        if (!formData.plan_name?.trim()) finalErrors.plan_name = 'Nama rencana wajib diisi';
        if (!formData.business_background_id) finalErrors.business_background_id = 'Pilih bisnis terlebih dahulu';

        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            toast.error('Harap lengkapi semua field yang wajib diisi');
            return;
        }

        // Convert data to monthly basis before submitting to API
        const dataToSubmit = {
            ...formData, // Menggunakan formData dari props
            // Ensure all financial data is in monthly basis for API
            monthly_opex: convertToMonthlyBasis(formData.monthly_opex || [], periodType),
            sales_projections: convertSalesToMonthlyBasis(formData.sales_projections || [], periodType),
            cash_flow_simulation: convertCashFlowToMonthlyBasis(formData.cash_flow_simulation || [], periodType),
            period_type: periodType // Store period type for reference
        };

        // Call parent submit handler
        onSubmit(e, dataToSubmit);
    };

    // Convert data to monthly basis
    const convertToMonthlyBasis = (items, currentPeriod) => {
        if (currentPeriod === 'monthly') return items;

        return items.map(item => ({
            ...item,
            amount: item.amount / 12
        }));
    };

    const convertSalesToMonthlyBasis = (items, currentPeriod) => {
        if (currentPeriod === 'monthly') return items;

        return items.map(item => ({
            ...item,
            volume: item.volume / 12,
            monthly_income: item.monthly_income / 12
        }));
    };

    const convertCashFlowToMonthlyBasis = (items, currentPeriod) => {
        if (currentPeriod === 'monthly') return items;
        // Cash flow typically doesn't need conversion as it's transaction-based
        return items;
    };

    // Calculate totals for display
    const calculateTotal = (items, field = 'amount') => {
        return (items || []).reduce((total, item) => total + (parseFloat(item[field]) || 0), 0);
    };

    const totalCapital = calculateTotal(formData.capital_sources);
    const totalCapex = calculateTotal(formData.initial_capex);

    // Calculate totals based on period type
    const totalOpex = calculateTotal(formData.monthly_opex);
    const totalSales = calculateTotal(formData.sales_projections, 'monthly_income');
    const totalCashFlowIncome = calculateTotal(
        (formData.cash_flow_simulation || []).filter(item => item.type === 'income'),
        'amount'
    );
    const totalCashFlowExpense = calculateTotal(
        (formData.cash_flow_simulation || []).filter(item => item.type === 'expense'),
        'amount'
    );

    // Display values based on period type
    const displayOpex = periodType === 'yearly' ? totalOpex * 12 : totalOpex;
    const displaySales = periodType === 'yearly' ? totalSales * 12 : totalSales;
    const displayOpexLabel = periodType === 'yearly' ? 'Tahunan' : 'Bulanan';
    const displaySalesLabel = periodType === 'yearly' ? 'Tahunan' : 'Bulanan';

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const sections = [
        { id: 'basic', name: 'Informasi Dasar', icon: '📋' },
        { id: 'capital', name: 'Modal & Investasi', icon: '💰' },
        { id: 'operations', name: 'Operasional', icon: '🏢' },
        { id: 'sales', name: 'Penjualan', icon: '📈' },
        { id: 'cashflow', name: 'Arus Kas', icon: '💸' },
        { id: 'settings', name: 'Ringkasan', icon: '⚙️' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            {/* Period Type Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Periode Perhitungan
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pilih periode untuk perhitungan finansial
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {periodOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handlePeriodTypeChange(option.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${periodType === option.value
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Calendar size={16} />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Mode {periodType === 'monthly' ? 'Bulanan' : 'Tahunan'}:</strong>{' '}
                        {periodType === 'monthly'
                            ? 'Semua perhitungan akan menggunakan basis bulanan'
                            : 'Semua perhitungan akan dikonversi ke basis tahunan'
                        }
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex overflow-x-auto space-x-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSection === section.id
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <span>{section.icon}</span>
                            {section.name}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">

                    {/* Section: Basic Information */}
                    {activeSection === 'basic' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Informasi Dasar Rencana Keuangan
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Rencana Keuangan *
                                    </label>
                                    <input
                                        type="text"
                                        name="plan_name"
                                        value={formData.plan_name || ''}
                                        onChange={(e) => handleInputChangeWrapper('plan_name', e.target.value)}
                                        placeholder="Contoh: Rencana Keuangan Toko Roti 2024"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.plan_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    />
                                    {errors.plan_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.plan_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Pilih Bisnis *
                                    </label>
                                    {isLoadingBusinesses ? (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                            <span>Memuat data bisnis...</span>
                                        </div>
                                    ) : businesses.length === 0 ? (
                                        <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                Belum ada data bisnis. Silakan buat latar belakang bisnis terlebih dahulu.
                                            </p>
                                        </div>
                                    ) : (
                                        <select
                                            name="business_background_id"
                                            value={formData.business_background_id || ''}
                                            onChange={(e) => handleInputChangeWrapper('business_background_id', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.business_background_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            <option value="">Pilih Bisnis</option>
                                            {businesses.map((business) => (
                                                <option key={business.id} value={business.id}>
                                                    {business.name} - {business.category}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.business_background_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.business_background_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Durasi Rencana ({periodType === 'monthly' ? 'Bulan' : 'Tahun'})
                                    </label>
                                    <input
                                        type="number"
                                        name="plan_duration_months"
                                        value={
                                            periodType === 'monthly'
                                                ? (formData.plan_duration_months || 12)
                                                : Math.ceil((formData.plan_duration_months || 12) / 12)
                                        }
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || 1;
                                            const months = periodType === 'monthly' ? value : value * 12;
                                            handleInputChangeWrapper('plan_duration_months', months);
                                        }}
                                        min="1"
                                        max={periodType === 'monthly' ? "60" : "5"}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {periodType === 'monthly'
                                            ? `Durasi: ${formData.plan_duration_months || 12} bulan`
                                            : `Durasi: ${Math.ceil((formData.plan_duration_months || 12) / 12)} tahun`
                                        }
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status || 'draft'}
                                        onChange={(e) => handleInputChangeWrapper('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="draft">Draft (Dalam Pengerjaan)</option>
                                        <option value="active">Aktif (Sedang Berjalan)</option>
                                        <option value="completed">Selesai (Arsip)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Catatan
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={(e) => handleInputChangeWrapper('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Tambahkan catatan atau deskripsi tentang rencana keuangan ini..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Section: Capital & Investment */}
                    {activeSection === 'capital' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Sumber & Struktur Modal
                                </h3>
                                <button
                                    type="button"
                                    onClick={addCapitalSource}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    <Plus size={16} />
                                    Tambah Sumber
                                </button>
                            </div>

                            {/* Capital Sources Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Sumber Modal</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nominal (Rp)</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Persentase</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {(formData.capital_sources || []).map((source, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={source.source}
                                                        onChange={(e) => updateCapitalSource(index, 'source', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    >
                                                        <option value="">Pilih Sumber</option>
                                                        {capitalSourcesOptions.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={source.amount}
                                                        onChange={(e) => updateCapitalSource(index, 'amount', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={`${source.percentage || 0}%`}
                                                        disabled
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCapitalSource(index)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr className="border-t border-gray-200 dark:border-gray-600">
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                Total Modal
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                {formatCurrency(totalCapital)}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                100%
                                            </td>
                                            <td className="px-4 py-2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Estimasi Biaya Awal (CapEx) */}
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Estimasi Biaya Awal (CapEx)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addCapexItem}
                                        className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        <Plus size={16} />
                                        Tambah Item
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nominal (Rp)</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {(formData.initial_capex || []).map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => updateCapexItem(index, 'category', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        >
                                                            <option value="">Pilih Kategori</option>
                                                            {capexCategories.map(category => (
                                                                <option key={category} value={category}>{category}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.amount}
                                                            onChange={(e) => updateCapexItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCapexItem(index)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr className="border-t border-gray-200 dark:border-gray-600">
                                                <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                    Total CapEx
                                                </td>
                                                <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                    {formatCurrency(totalCapex)}
                                                </td>
                                                <td className="px-4 py-2"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Operations */}
                    {activeSection === 'operations' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Biaya Operasional ({periodType === 'monthly' ? 'Bulanan' : 'Tahunan'})
                                </h3>
                                <button
                                    type="button"
                                    onClick={addOpexItem}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    <Plus size={16} />
                                    Tambah Biaya
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Kategori Biaya</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nominal ({periodType === 'monthly' ? 'Bulan' : 'Tahun'}) (Rp)
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {(formData.monthly_opex || []).map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.category}
                                                        onChange={(e) => updateOpexItem(index, 'category', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    >
                                                        <option value="">Pilih Kategori</option>
                                                        {opexCategories.map(category => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(e) => updateOpexItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOpexItem(index)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr className="border-t border-gray-200 dark:border-gray-600">
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                Total Biaya Operasional/{displayOpexLabel}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                {formatCurrency(displayOpex)}
                                            </td>
                                            <td className="px-4 py-2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Tax and Interest Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tarif Pajak (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="tax_rate"
                                        value={formData.tax_rate || 0}
                                        onChange={(e) => handleInputChangeWrapper('tax_rate', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Biaya Bunga/{periodType === 'monthly' ? 'Bulan' : 'Tahun'} (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        name="interest_expense"
                                        value={formData.interest_expense || 0}
                                        onChange={(e) => handleInputChangeWrapper('interest_expense', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Sales */}
                    {activeSection === 'sales' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Proyeksi Penjualan & Pendapatan ({periodType === 'monthly' ? 'Bulanan' : 'Tahunan'})
                                </h3>
                                <button
                                    type="button"
                                    onClick={addSalesItem}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    <Plus size={16} />
                                    Tambah Produk
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Produk/Layanan</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Harga Jual (Rp)</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Volume/{periodType === 'monthly' ? 'Bulan' : 'Tahun'}
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Pendapatan/{periodType === 'monthly' ? 'Bulan' : 'Tahun'} (Rp)
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {(formData.sales_projections || []).map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={item.product}
                                                        onChange={(e) => updateSalesItem(index, 'product', e.target.value)}
                                                        placeholder="Nama produk/jasa"
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateSalesItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.volume}
                                                        onChange={(e) => updateSalesItem(index, 'volume', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={formatCurrency(
                                                            periodType === 'yearly' ? (item.monthly_income || 0) * 12 : (item.monthly_income || 0)
                                                        )}
                                                        disabled
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSalesItem(index)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr className="border-t border-gray-200 dark:border-gray-600">
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100" colSpan="3">
                                                Total Pendapatan/{displaySalesLabel}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                {formatCurrency(displaySales)}
                                            </td>
                                            <td className="px-4 py-2"></td>
                                        </tr>
                                        {periodType === 'monthly' && (
                                            <tr className="border-t border-gray-200 dark:border-gray-600">
                                                <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100" colSpan="3">
                                                    Total Pendapatan/Tahun
                                                </td>
                                                <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
                                                    {formatCurrency(totalSales * 12)}
                                                </td>
                                                <td className="px-4 py-2"></td>
                                            </tr>
                                        )}
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Section: Cash Flow */}
                    {activeSection === 'cashflow' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Simulasi Arus Kas
                                </h3>
                                <button
                                    type="button"
                                    onClick={addCashFlowItem}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    <Plus size={16} />
                                    Tambah Transaksi
                                </button>
                            </div>

                            {/* Cash Flow Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                    <ArrowUpCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(totalCashFlowIncome)}
                                    </p>
                                    <p className="text-sm text-green-600/80 dark:text-green-400/80">Total Pendapatan</p>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                                    <ArrowDownCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(totalCashFlowExpense)}
                                    </p>
                                    <p className="text-sm text-red-600/80 dark:text-red-400/80">Total Pengeluaran</p>
                                </div>

                                <div className={`rounded-lg p-4 text-center ${(totalCashFlowIncome - totalCashFlowExpense) >= 0
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'bg-orange-50 dark:bg-orange-900/20'
                                    }`}>
                                    <DollarSign className={`w-8 h-8 mx-auto mb-2 ${(totalCashFlowIncome - totalCashFlowExpense) >= 0
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-orange-600 dark:text-orange-400'
                                        }`} />
                                    <p className={`text-2xl font-bold ${(totalCashFlowIncome - totalCashFlowExpense) >= 0
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-orange-600 dark:text-orange-400'
                                        }`}>
                                        {formatCurrency(totalCashFlowIncome - totalCashFlowExpense)}
                                    </p>
                                    <p className={`text-sm ${(totalCashFlowIncome - totalCashFlowExpense) >= 0
                                        ? 'text-blue-600/80 dark:text-blue-400/80'
                                        : 'text-orange-600/80 dark:text-orange-400/80'
                                        }`}>
                                        Arus Kas Bersih
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Jenis</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nominal (Rp)</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Metode</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {(formData.cash_flow_simulation || []).map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={item.date}
                                                        onChange={(e) => updateCashFlowItem(index, 'date', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.type}
                                                        onChange={(e) => updateCashFlowItem(index, 'type', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    >
                                                        <option value="income">Pendapatan</option>
                                                        <option value="expense">Pengeluaran</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.category}
                                                        onChange={(e) => updateCashFlowItem(index, 'category', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    >
                                                        <option value="">Pilih Kategori</option>
                                                        {cashFlowCategories.map(category => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateCashFlowItem(index, 'description', e.target.value)}
                                                        placeholder="Deskripsi transaksi"
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(e) => updateCashFlowItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.payment_method}
                                                        onChange={(e) => updateCashFlowItem(index, 'payment_method', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                                    >
                                                        {paymentMethods.map(method => (
                                                            <option key={method} value={method}>{method}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCashFlowItem(index)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {(formData.cash_flow_simulation || []).length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                    <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Belum Ada Data Arus Kas
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Tambahkan transaksi arus kas untuk melihat simulasi lengkap.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section: Settings & Summary */}
                    {activeSection === 'settings' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Ringkasan ({periodType === 'monthly' ? 'Bulanan' : 'Tahunan'})
                            </h3>

                            {/* Financial Summary Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Modal & Investasi</h4>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(totalCapital)}
                                    </p>
                                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Modal Awal</p>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Pendapatan</h4>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(displaySales)}
                                    </p>
                                    <p className="text-sm text-green-600/80 dark:text-green-400/80">Per {periodType === 'monthly' ? 'Bulan' : 'Tahun'}</p>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Pengeluaran</h4>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(displayOpex)}
                                    </p>
                                    <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Operasional/{periodType === 'monthly' ? 'Bulan' : 'Tahun'}</p>
                                </div>
                            </div>

                            {/* Quick Calculations */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Perhitungan Cepat
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {/* Laba Kotor */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Laba Kotor/{periodType === 'monthly' ? 'Bulan' : 'Tahun'}:
                                        </span>
                                        <span className={`font-medium ${displaySales - displayOpex >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                            }`}>
                                            {formatCurrency(displaySales - displayOpex)}
                                        </span>
                                    </div>

                                    {/* Margin Profit */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">Margin Profit:</span>
                                        <span className={`font-medium ${((displaySales - displayOpex) / displaySales) * 100 >= 20
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-yellow-600 dark:text-yellow-400"
                                            }`}>
                                            {displaySales > 0
                                                ? (((displaySales - displayOpex) / displaySales) * 100).toFixed(1)
                                                : 0}%
                                        </span>
                                    </div>

                                    {/* ROI */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">ROI (Estimasi):</span>
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                            {totalCapital > 0
                                                ? (((displaySales - displayOpex) / totalCapital) * 100).toFixed(1)
                                                : 0}%
                                        </span>
                                    </div>

                                    {/* Payback Period */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">Payback Period:</span>
                                        <span className="font-medium text-purple-600 dark:text-purple-400">
                                            {displaySales - displayOpex > 0
                                                ? (totalCapital / (displaySales - displayOpex)).toFixed(1)
                                                : "∞"} {periodType === 'monthly' ? 'bulan' : 'tahun'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Settings */}
                            <div className="border-t pt-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Pengaturan Final</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status Rencana
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status || 'draft'}
                                            onChange={(e) => handleInputChangeWrapper('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="draft">Draft (Dalam Pengerjaan)</option>
                                            <option value="active">Aktif (Sedang Berjalan)</option>
                                            <option value="completed">Selesai (Arsip)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-4">
                            {sections.map((section, index) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onBack} // Ini akan memanggil handleCancel dari parent
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isLoadingBusinesses || businesses.length === 0}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        {submitButtonIcon}
                                        {submitButtonText}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FinancialPlanForm;