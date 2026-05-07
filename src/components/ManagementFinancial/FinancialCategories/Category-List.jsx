import { Folder, Plus, Eye, Edit3, Trash2, Loader, RefreshCw, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const CategoryList = ({
    categories,
    onView,
    onEdit,
    onDelete,
    onCreateNew,
    isLoading,
    error,
    onRetry
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (categoryId, categoryName) => {
        setCategoryToDelete({ id: categoryId, name: categoryName });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(categoryToDelete.id);
            toast.success('Kategori berhasil dihapus!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error in CategoryList delete:', error);
            toast.error('Gagal menghapus kategori!', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    const getTypeIcon = (type) => {
        return type === 'income' ? 
            <TrendingUp size={16} className="text-green-600" /> : 
            <TrendingDown size={16} className="text-red-600" />;
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
                {labels[type]}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            actual: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
            plan: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
        };
        const labels = {
            actual: "Aktual",
            plan: "Rencana"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getSubtypeBadge = (subtype) => {
        if (!subtype || subtype === 'other') return null;
        
        const labels = {
            'operating_revenue': 'Operasional',
            'non_operating_revenue': 'Non-Operasional',
            'cogs': 'HPP',
            'operating_expense': 'Operasional',
            'interest_expense': 'Bunga',
            'tax_expense': 'Pajak'
        };
        
        return (
            <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900/20 dark:text-purple-300">
                {labels[subtype] || subtype}
            </span>
        );
    };

    // LOADING STATE
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Keuangan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola kategori pendapatan dan pengeluaran</p>
                    </div>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                        <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Keuangan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola kategori pendapatan dan pengeluaran</p>
                    </div>
                </div>
                <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Gagal Memuat Data</h3>
                    <p className="max-w-md mx-auto mb-4 text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-6 py-3 mx-auto text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw size={16} />
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Modal Konfirmasi Delete */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Konfirmasi Hapus
                            </h3>
                            <button
                                onClick={handleCancelDelete}
                                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6 text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full shadow-md dark:bg-red-900/20">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="mb-2 text-gray-600 dark:text-gray-400">
                                Apakah Anda yakin ingin menghapus kategori ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{categoryToDelete?.name}"</strong>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
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
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Keuangan</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola kategori pendapatan dan pengeluaran</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
                >
                    <Plus size={20} />
                    Tambah Kategori
                </button>
            </div>

            {/* STATS SUMMARY */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Kategori</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                        </div>
                        <Folder className="text-blue-600" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendapatan</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {categories.filter(cat => cat.type === 'income').length}
                            </p>
                        </div>
                        <TrendingUp className="text-green-600" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pengeluaran</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {categories.filter(cat => cat.type === 'expense').length}
                            </p>
                        </div>
                        <TrendingDown className="text-red-600" size={24} />
                    </div>
                </div>
            </div>

            {/* LIST KATEGORI */}
            {categories.length === 0 ? (
                <div className="py-12 text-center">
                    <Folder size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Belum ada kategori keuangan</h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">Mulai dengan menambahkan kategori pertama Anda</p>
                    <button
                        onClick={onCreateNew}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
                    >
                        Tambah Kategori Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <div key={category.id} className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="flex items-center justify-center w-12 h-12 border rounded-lg"
                                        style={{ 
                                            backgroundColor: `${category.color}20`,
                                            borderColor: category.color
                                        }}
                                    >
                                        {getTypeIcon(category.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{category.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {getTypeBadge(category.type)}
                                            {getStatusBadge(category.status)}
                                            {getSubtypeBadge(category.category_subtype)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {category.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                                    {category.description}
                                </p>
                            )}

                            {!category.description && (
                                <div className="min-h-[40px] mb-4"></div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onView(category)}
                                    className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => onEdit(category)}
                                    className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-white transition-colors bg-yellow-600 rounded hover:bg-yellow-700"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(category.id, category.name)}
                                    className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryList;