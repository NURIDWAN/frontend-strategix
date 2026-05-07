import { Save, Calculator, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

const SummaryForm = ({
    title,
    subtitle,
    formData,
    isLoading,
    onInputChange,
    onNumberChange,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create'
}) => {
    const [calculatedProfit, setCalculatedProfit] = useState(0);
    const [calculatedNetProfit, setCalculatedNetProfit] = useState(0);

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        // Calculate gross profit automatically
        const income = parseFloat(formData.total_income) || 0;
        const expense = parseFloat(formData.total_expense) || 0;
        const grossProfit = income - expense;
        setCalculatedProfit(grossProfit);

        // For simplicity, net profit = gross profit (you can add tax calculations later)
        setCalculatedNetProfit(grossProfit);
    }, [formData.total_income, formData.total_expense]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateProfitMargin = () => {
        const income = parseFloat(formData.total_income) || 0;
        if (income === 0) return 0;
        return ((calculatedProfit / income) * 100).toFixed(1);
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        // Remove non-numeric characters except decimal point
        const numericValue = value.replace(/[^\d.]/g, '');
        onNumberChange(name, numericValue);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="mb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    
                    {/* Periode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bulan *
                            </label>
                            <select
                                name="month"
                                value={formData.month}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Bulan</option>
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tahun *
                            </label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Tahun</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Financial Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Total Pendapatan *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                                <input
                                    type="text"
                                    name="total_income"
                                    value={formData.total_income}
                                    onChange={handleNumberChange}
                                    placeholder="0"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            {formData.total_income && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    {formatCurrency(formData.total_income)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Total Pengeluaran *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                </div>
                                <input
                                    type="text"
                                    name="total_expense"
                                    value={formData.total_expense}
                                    onChange={handleNumberChange}
                                    placeholder="0"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            {formData.total_expense && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {formatCurrency(formData.total_expense)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Auto-calculated Fields */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Calculator size={16} />
                            Hasil Perhitungan Otomatis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Laba Kotor
                                </label>
                                <div className={`text-lg font-bold ${
                                    calculatedProfit >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {formatCurrency(calculatedProfit)}
                                </div>
                                <input type="hidden" name="gross_profit" value={calculatedProfit} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Laba Bersih
                                </label>
                                <div className={`text-lg font-bold ${
                                    calculatedNetProfit >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {formatCurrency(calculatedNetProfit)}
                                </div>
                                <input type="hidden" name="net_profit" value={calculatedNetProfit} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Profit Margin
                                </label>
                                <div className={`text-lg font-bold ${
                                    calculateProfitMargin() >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {calculateProfitMargin()}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cash Position */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Posisi Kas *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Wallet className="h-5 w-5 text-blue-500" />
                            </div>
                            <input
                                type="text"
                                name="cash_position"
                                value={formData.cash_position}
                                onChange={handleNumberChange}
                                placeholder="0"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        {formData.cash_position && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                {formatCurrency(formData.cash_position)}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catatan
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Tambahkan catatan atau penjelasan tentang ringkasan keuangan ini..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Preview Summary */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3">
                            Preview Ringkasan
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-green-600 dark:text-green-400 font-medium">Periode:</span>
                                <p className="text-green-800 dark:text-green-200">
                                    {formData.month && formData.year 
                                        ? `${months.find(m => m.value == formData.month)?.label} ${formData.year}`
                                        : '-'
                                    }
                                </p>
                            </div>
                            <div>
                                <span className="text-green-600 dark:text-green-400 font-medium">Pendapatan:</span>
                                <p className="text-green-800 dark:text-green-200">
                                    {formData.total_income ? formatCurrency(formData.total_income) : '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-green-600 dark:text-green-400 font-medium">Pengeluaran:</span>
                                <p className="text-green-800 dark:text-green-200">
                                    {formData.total_expense ? formatCurrency(formData.total_expense) : '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-green-600 dark:text-green-400 font-medium">Laba:</span>
                                <p className="text-green-800 dark:text-green-200">
                                    {formatCurrency(calculatedProfit)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            </form>
        </div>
    );
};

export default SummaryForm;