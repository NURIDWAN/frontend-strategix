// frontend/src/components/ManagementFinancial/FinancialSimulation/Simulation-Form.jsx

import { Save, Calendar, DollarSign, FileText, CreditCard, Repeat, TrendingUp } from 'lucide-react';

const SimulationForm = ({
    title,
    subtitle,
    formData,
    isLoading,
    categories,
    onInputChange,
    onSelectChange,
    onCheckboxChange,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create'
}) => {
    const paymentMethods = [
        { value: 'cash', label: 'Tunai' },
        { value: 'bank_transfer', label: 'Transfer Bank' },
        { value: 'credit_card', label: 'Kartu Kredit' },
        { value: 'digital_wallet', label: 'Dompet Digital' },
        { value: 'other', label: 'Lainnya' }
    ];

    const recurringFrequencies = [
        { value: 'daily', label: 'Harian' },
        { value: 'weekly', label: 'Mingguan' },
        { value: 'monthly', label: 'Bulanan' },
        { value: 'yearly', label: 'Tahunan' }
    ];

    const filteredCategories = categories.filter(cat => 
        !formData.type || cat.type === formData.type
    );

    const formatCurrency = (value) => {
        if (!value) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const parseCurrency = (value) => {
        return value.replace(/\D/g, '');
    };

    const handleAmountChange = (e) => {
        const value = parseCurrency(e.target.value);
        onInputChange({
            target: {
                name: 'amount',
                value: value ? parseInt(value) : ''
            }
        });
    };

    const handleDateChange = (e) => {
        onInputChange(e);
        // Auto-update year ketika tanggal berubah
        const selectedDate = new Date(e.target.value);
        const selectedYear = selectedDate.getFullYear();
        onInputChange({
            target: {
                name: 'year',
                value: selectedYear
            }
        });
        // Jika recurring diaktifkan, set recurring_end_date default ke 1 tahun
        if (formData.is_recurring && !formData.recurring_end_date) {
            const date = new Date(e.target.value);
            date.setFullYear(date.getFullYear() + 1);
            onInputChange({
                target: {
                    name: 'recurring_end_date',
                    value: date.toISOString().split('T')[0]
                }
            });
        }
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
                    Kembali
                </button>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    
                    {/* Tipe dan Kategori */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Jenis Simulasi *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={onSelectChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Jenis</option>
                                <option value="income">Pendapatan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="financial_category_id"
                                value={formData.financial_category_id}
                                onChange={onSelectChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                                disabled={!formData.type}
                            >
                                <option value="">Pilih Kategori</option>
                                {filteredCategories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.type === 'income' ? 'Pendapatan' : 'Pengeluaran'})
                                    </option>
                                ))}
                            </select>
                            {!formData.type && (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                    Pilih jenis simulasi terlebih dahulu
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Nominal dan Tanggal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nominal *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formatCurrency(formData.amount)}
                                    onChange={handleAmountChange}
                                    placeholder="0"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tanggal Simulasi *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="simulation_date"
                                    value={formData.simulation_date}
                                    onChange={handleDateChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tahun Fiskal *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TrendingUp className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year || new Date().getFullYear()}
                                    onChange={onInputChange}
                                    min="2020"
                                    max="2100"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Auto-update saat tanggal berubah
                            </p>
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsi
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={onInputChange}
                                placeholder="Deskripsi singkat simulasi..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Metode Pembayaran dan Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Metode Pembayaran *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={onSelectChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={onSelectChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="planned">Rencana</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                    </div>

                    {/* Recurring Settings */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                name="is_recurring"
                                checked={formData.is_recurring}
                                onChange={onCheckboxChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                id="is_recurring"
                            />
                            <label htmlFor="is_recurring" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Repeat size={16} />
                                Transaksi Berulang
                            </label>
                        </div>

                        {formData.is_recurring && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Frekuensi *
                                    </label>
                                    <select
                                        name="recurring_frequency"
                                        value={formData.recurring_frequency}
                                        onChange={onSelectChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Pilih Frekuensi</option>
                                        {recurringFrequencies.map(freq => (
                                            <option key={freq.value} value={freq.value}>
                                                {freq.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tanggal Berakhir
                                    </label>
                                    <input
                                        type="date"
                                        name="recurring_end_date"
                                        value={formData.recurring_end_date}
                                        onChange={onInputChange}
                                        min={formData.simulation_date}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catatan
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Catatan tambahan..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview Simulasi</h4>
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center border"
                                style={{ 
                                    backgroundColor: `${formData.category_color || '#6B7280'}20`,
                                    borderColor: formData.category_color || '#6B7280'
                                }}
                            >
                                {formData.type === 'income' ? (
                                    <svg className="w-6 h-6" style={{ color: formData.category_color || '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                ) : formData.type === 'expense' ? (
                                    <svg className="w-6 h-6" style={{ color: formData.category_color || '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                ) : (
                                    <DollarSign size={20} style={{ color: formData.category_color || '#6B7280' }} />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formData.description || 'Deskripsi simulasi...'}
                                    </span>
                                    {formData.type && (
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-medium
                                            ${formData.type === 'income' 
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                            }
                                        `}>
                                            {formData.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                        </span>
                                    )}
                                    {formData.status && (
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-medium
                                            ${formData.status === 'completed' 
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                : formData.status === 'planned'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                            }
                                        `}>
                                            {formData.status === 'completed' ? 'Selesai' : 
                                             formData.status === 'planned' ? 'Rencana' : 'Dibatalkan'}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p>
                                        {formData.amount ? `Rp ${formatCurrency(formData.amount)}` : 'Rp 0'} • 
                                        {formData.simulation_date ? ` ${new Date(formData.simulation_date).toLocaleDateString('id-ID')}` : ' Tanggal'}
                                    </p>
                                    <p>
                                        Kategori: {formData.financial_category_id ? 
                                            categories.find(c => c.id == formData.financial_category_id)?.name || 'Kategori' 
                                            : 'Pilih kategori'}
                                    </p>
                                </div>
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
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

export default SimulationForm;