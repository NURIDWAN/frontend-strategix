// frontend/src/components/ManagementFinancial/FinancialSimulation/Simulation-View.jsx

import { Edit3, Calendar, DollarSign, CreditCard, FileText, Repeat, Tag, User } from 'lucide-react';

const SimulationView = ({ simulation, onBack, onEdit }) => {
    if (!simulation) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTypeIcon = (type) => {
        return type === 'income' ? 
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg> : 
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>;
    };

    const getTypeBadge = (type) => {
        const styles = {
            income: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
            expense: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
        };
        const labels = {
            income: "Pendapatan",
            expense: "Pengeluaran"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type]}`}>
                {labels[type]}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
            planned: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
            cancelled: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
        };
        const labels = {
            completed: "Selesai",
            planned: "Rencana",
            cancelled: "Dibatalkan"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getPaymentMethodText = (method) => {
        const methods = {
            cash: "Tunai",
            bank_transfer: "Transfer Bank",
            credit_card: "Kartu Kredit",
            digital_wallet: "Dompet Digital",
            other: "Lainnya"
        };
        return methods[method] || method;
    };

    const getRecurringFrequencyText = (frequency) => {
        const frequencies = {
            daily: "Harian",
            weekly: "Mingguan",
            monthly: "Bulanan",
            yearly: "Tahunan"
        };
        return frequencies[frequency] || frequency;
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
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Simulasi Keuangan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Lihat informasi lengkap simulasi</p>
                    </div>
                    <button
                        onClick={() => onEdit(simulation)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
                
                {/* Header dengan Icon dan Badges */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        <div 
                            className="w-24 h-24 border-2 rounded-lg flex items-center justify-center"
                            style={{ 
                                backgroundColor: `${simulation.category?.color || '#6B7280'}20`,
                                borderColor: simulation.category?.color || '#6B7280'
                            }}
                        >
                            {getTypeIcon(simulation.type)}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {simulation.description || simulation.category?.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Kode: {simulation.simulation_code}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {getTypeBadge(simulation.type)}
                            {getStatusBadge(simulation.status)}
                            {simulation.category && (
                                <span 
                                    className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                                    style={{ 
                                        backgroundColor: `${simulation.category.color}20`,
                                        color: simulation.category.color
                                    }}
                                >
                                    <Tag size={14} />
                                    {simulation.category.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-3xl font-bold ${
                            simulation.type === 'income' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                            {simulation.type === 'income' ? '+' : '-'} {formatCurrency(simulation.amount)}
                        </p>
                    </div>
                </div>

                {/* Informasi Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText size={20} />
                            Informasi Simulasi
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Deskripsi
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {simulation.description || '-'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Jenis
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(simulation.type)}
                                        <span className="text-gray-900 dark:text-white">
                                            {simulation.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            simulation.status === 'completed' 
                                                ? 'bg-green-500' 
                                                : simulation.status === 'planned'
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                        }`}></div>
                                        <span className="text-gray-900 dark:text-white">
                                            {simulation.status === 'completed' ? 'Selesai' : 
                                             simulation.status === 'planned' ? 'Rencana' : 'Dibatalkan'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kategori
                                </label>
                                <div className="flex items-center gap-3">
                                    {simulation.category && (
                                        <>
                                            <div 
                                                className="w-6 h-6 rounded border-2"
                                                style={{ 
                                                    backgroundColor: simulation.category.color,
                                                    borderColor: simulation.category.color
                                                }}
                                            ></div>
                                            <span className="text-gray-900 dark:text-white">
                                                {simulation.category.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar size={20} />
                            Informasi Tanggal & Pembayaran
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tanggal Simulasi
                                </label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Calendar size={16} />
                                    {formatDate(simulation.simulation_date)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Metode Pembayaran
                                </label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CreditCard size={16} />
                                    {getPaymentMethodText(simulation.payment_method)}
                                </div>
                            </div>

                            {simulation.is_recurring && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Frekuensi Berulang
                                        </label>
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Repeat size={16} />
                                            {getRecurringFrequencyText(simulation.recurring_frequency)}
                                        </div>
                                    </div>
                                    {simulation.recurring_end_date && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Berakhir Pada
                                            </label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Calendar size={16} />
                                                {formatDate(simulation.recurring_end_date)}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Catatan */}
                {simulation.notes && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Catatan</h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                                {simulation.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Informasi Sistem */}
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informasi Sistem</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Dibuat Pada
                            </label>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Calendar size={16} />
                                {formatDate(simulation.created_at)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Diperbarui Pada
                            </label>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Calendar size={16} />
                                {formatDate(simulation.updated_at)}
                            </div>
                        </div>

                        {simulation.user && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Dibuat Oleh
                                </label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <User size={16} />
                                    {simulation.user.name || 'User'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Kembali ke Daftar
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(simulation)}
                        className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit Simulasi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimulationView;