// frontend/src/components/ManagementFinancial/FinancialSimulation/Simulation-List.jsx

import { useState } from 'react';
import { 
    Eye, 
    Edit3, 
    Trash2, 
    Plus, 
    Filter,
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

const SimulationList = ({
    simulations,
    categories,
    filters,
    onFilterChange,
    onView,
    onEdit,
    onDelete,
    onCreateNew,
    onBackToDashboard,
    isLoading,
    error,
    onRetry,
    availableYears = []
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [simulationToDelete, setSimulationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const handleDeleteClick = (simulationId, simulationDescription) => {
        setSimulationToDelete({ id: simulationId, description: simulationDescription });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!simulationToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(simulationToDelete.id);
            toast.success('Simulasi berhasil dihapus!');
        } catch (error) {
            console.error('Error in SimulationList delete:', error);
            toast.error('Gagal menghapus simulasi!');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSimulationToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSimulationToDelete(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getMonthFromDate = (dateString) => {
        return new Date(dateString).getMonth() + 1;
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const methods = {
            cash: "Tunai",
            bank_transfer: "Transfer Bank",
            credit_card: "Kartu Kredit",
            digital_wallet: "Dompet Digital",
            other: "Lainnya"
        };
        return (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                {methods[method] || method}
            </span>
        );
    };

    // Filter simulations based on current filters
    const filteredSimulations = simulations.filter(simulation => {
        if (filters.type && simulation.type !== filters.type) return false;
        if (filters.status && simulation.status !== filters.status) return false;
        if (filters.category_id && simulation.financial_category_id != filters.category_id) return false;
        if (filters.year && simulation.year != filters.year) return false;
        // Extract month from simulation_date for filtering
        if (filters.month && getMonthFromDate(simulation.simulation_date) != filters.month) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Konfirmasi Hapus
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Apakah Anda yakin ingin menghapus simulasi ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                "{simulationToDelete?.description}"
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Hapus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBackToDashboard}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Semua Simulasi
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola semua simulasi keuangan Anda
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <Filter size={16} />
                        Filter
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Tambah Simulasi
                    </button>
                </div>
            </div>

            {/* Filters - Always Visible (Sticky) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tahun
                        </label>
                        <select
                            value={filters.year || ''}
                            onChange={(e) => onFilterChange({ ...filters, year: e.target.value ? parseInt(e.target.value) : '' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Semua Tahun</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bulan
                        </label>
                        <select
                            value={filters.month || ''}
                            onChange={(e) => onFilterChange({ ...filters, month: e.target.value ? parseInt(e.target.value) : '' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Semua Bulan</option>
                            {[
                                { val: 1, label: 'Januari' },
                                { val: 2, label: 'Februari' },
                                { val: 3, label: 'Maret' },
                                { val: 4, label: 'April' },
                                { val: 5, label: 'Mei' },
                                { val: 6, label: 'Juni' },
                                { val: 7, label: 'Juli' },
                                { val: 8, label: 'Agustus' },
                                { val: 9, label: 'September' },
                                { val: 10, label: 'Oktober' },
                                { val: 11, label: 'November' },
                                { val: 12, label: 'Desember' }
                            ].map(month => (
                                <option key={month.val} value={month.val}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Jenis
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="income">Pendapatan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="planned">Rencana</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kategori
                            </label>
                            <select
                                value={filters.category_id}
                                onChange={(e) => onFilterChange({ ...filters, category_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => onFilterChange({
                                    type: '',
                                    status: '',
                                    category_id: '',
                                    year: '',
                                    month: ''
                                })}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Helper Text */}
                {(filters.type || filters.status || filters.category_id || filters.year || filters.month) && (
                    <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Filter aktif:</span> 
                            {filters.year && ` Tahun ${filters.year}`}
                            {filters.month && ` • Bulan ${['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][filters.month]}`}
                            {filters.type && ` • ${filters.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}`}
                            {filters.status && ` • Status: ${filters.status === 'planned' ? 'Rencana' : filters.status === 'completed' ? 'Selesai' : 'Dibatalkan'}`}
                            {filters.category_id && ` • Kategori: ${categories.find(c => c.id == filters.category_id)?.name || 'N/A'}`}
                        </p>
                    </div>
                )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSimulations.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {filteredSimulations.filter(s => s.type === 'income').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pendapatan</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {filteredSimulations.filter(s => s.type === 'expense').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pengeluaran</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {filteredSimulations.filter(s => s.status === 'planned').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rencana</p>
                </div>
            </div>

            {/* Bulan Tercatat Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Bulan Tercatat</p>
                <div className="flex flex-wrap gap-2">
                    {filteredSimulations.length > 0 ? (
                        Array.from(new Set(filteredSimulations.map(s => getMonthFromDate(s.simulation_date))))
                            .sort((a, b) => a - b)
                            .map(month => {
                                const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                                return (
                                    <span key={month} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium">
                                        {monthNames[month - 1]}
                                    </span>
                                );
                            })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada data simulasi</p>
                    )}
                </div>
            </div>

            {/* Simulations List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Daftar Simulasi ({filteredSimulations.length})
                        </h3>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Download size={20} />
                        </button>
                    </div>
                    {filteredSimulations.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Menampilkan {filteredSimulations.length} dari {simulations.length} simulasi
                        </p>
                    )}
                </div>

                {filteredSimulations.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Tidak ada simulasi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {simulations.length === 0 
                                ? 'Mulai dengan menambahkan simulasi pertama Anda' 
                                : 'Tidak ada simulasi yang sesuai dengan filter yang dipilih'
                            }
                        </p>
                        <button
                            onClick={onCreateNew}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Tambah Simulasi
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tahun</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Metode</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="text-right p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Nominal</th>
                                    <th className="text-center p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSimulations.map((simulation) => (
                                    <tr key={simulation.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-8 h-8 rounded flex items-center justify-center"
                                                    style={{ 
                                                        backgroundColor: `${simulation.category?.color || '#6B7280'}20`,
                                                        border: `2px solid ${simulation.category?.color || '#6B7280'}`
                                                    }}
                                                >
                                                    {simulation.type === 'income' ? (
                                                        <TrendingUp size={14} style={{ color: simulation.category?.color || '#6B7280' }} />
                                                    ) : (
                                                        <TrendingDown size={14} style={{ color: simulation.category?.color || '#6B7280' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {simulation.description || simulation.category?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {simulation.simulation_code}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                                <div 
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: simulation.category?.color || '#6B7280' }}
                                                ></div>
                                                {simulation.category?.name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                                {simulation.year}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">
                                            {formatDate(simulation.simulation_date)}
                                        </td>
                                        <td className="p-4">
                                            {getPaymentMethodBadge(simulation.payment_method)}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(simulation.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className={`font-semibold ${
                                                simulation.type === 'income' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {simulation.type === 'income' ? '+' : '-'} {formatCurrency(simulation.amount)}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => onView(simulation)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(simulation)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(simulation.id, simulation.description || simulation.category?.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimulationList;