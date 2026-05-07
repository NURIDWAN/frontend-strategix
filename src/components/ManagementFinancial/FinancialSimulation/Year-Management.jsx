import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, X } from 'lucide-react';
import { toast } from 'react-toastify';

const YearManagement = ({ 
    availableYears, 
    selectedYear, 
    onYearChange, 
    onAddYear, 
    onDeleteYear,
    simulations 
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newYear, setNewYear] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [yearToDelete, setYearToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        // Auto-fill dengan tahun berikutnya ketika modal dibuka
        if (showAddModal && !newYear) {
            const nextYear = Math.max(...availableYears, currentYear) + 1;
            setNewYear(nextYear.toString());
        }
    }, [showAddModal, availableYears, currentYear]);

    const handleAddYear = async () => {
        const year = parseInt(newYear);
        
        if (!year) {
            toast.error('Masukkan tahun yang valid');
            return;
        }

        if (availableYears.includes(year)) {
            toast.error(`Tahun ${year} sudah tersedia`);
            return;
        }

        setIsLoading(true);
        try {
            await onAddYear(year);
            setNewYear('');
            setShowAddModal(false);
            toast.success(`Tahun ${year} berhasil ditambahkan`);
        } catch (error) {
            toast.error('Gagal menambahkan tahun');
        } finally {
            setIsLoading(false);
        }
    };

    const promptDeleteYear = (year) => {
        if (year === currentYear) {
            toast.error('Tidak dapat menghapus tahun berjalan');
            return;
        }

        setYearToDelete(year);
        setShowDeleteModal(true);
    };

    const confirmDeleteYear = async () => {
        if (!yearToDelete) return;
        const simulationsInYear = simulations.filter(s => s.year === yearToDelete);

        setIsDeleting(true);
        try {
            await onDeleteYear(yearToDelete);
            toast.success(`Tahun ${yearToDelete} berhasil dihapus`);
            setShowDeleteModal(false);
            setYearToDelete(null);
        } catch (error) {
            console.error('Error deleting year:', error);
            const msg = error?.response?.data?.message || error?.message || 'Gagal menghapus tahun';
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const canDeleteYear = (year) => {
        return year !== currentYear && availableYears.length > 1;
    };

    const getSimulationCount = (year) => {
        return simulations.filter(s => s.year === year).length;
    };


    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Year Info */}
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Tahun {selectedYear}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getSimulationCount(selectedYear)} simulasi keuangan
                        </p>
                    </div>
                </div>
            </div>

            {/* Year Controls */}
            <div className="flex items-center gap-2">
                {/* Year Selector */}
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white text-sm"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>
                            {year} 
                        </option>
                    ))}
                </select>

                {/* Add Year Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    title="Tambah Tahun Baru"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline text-sm">Tambah</span>
                </button>

                {/* Delete Year Button */}
                {canDeleteYear(selectedYear) && (
                    <button
                        onClick={() => promptDeleteYear(selectedYear)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        title="Hapus Tahun"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline text-sm">Hapus</span>
                    </button>
                )}
            </div>

            {/* Add Year Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                    <Plus className="text-green-600 dark:text-green-400" size={16} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Tambah Tahun Baru
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    value={newYear}
                                    onChange={(e) => setNewYear(e.target.value)}
                                    placeholder="2024"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                                <div className="flex justify-end text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Tahun terakhir: {Math.max(...availableYears)}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                                    <Calendar size={16} />
                                    <span className="font-medium">Info Tahun Baru</span>
                                </div>
                                <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                                    Tahun baru akan dibuat tanpa data simulasi. Anda bisa menambahkan simulasi keuangan secara manual.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAddYear}
                                    disabled={isLoading || !newYear}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Menambah...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Tambah Tahun
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Konfirmasi Hapus Tahun</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Apakah Anda yakin ingin menghapus tahun <strong>{yearToDelete}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Terdapat {simulations.filter(s => s.year === yearToDelete).length} simulasi yang akan dihapus.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setYearToDelete(null); }}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDeleteYear}
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
        </div>
    );
};

export default YearManagement;