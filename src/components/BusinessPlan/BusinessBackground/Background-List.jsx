import { Building, MapPin, Calendar, Plus, Eye, Edit3, Trash2, Loader, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const BackgroundList = ({
    businesses,
    onView,
    onEdit,
    onDelete,
    onCreateNew,
    isLoading,
    error,
    onRetry
}) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (businessId, businessName) => {
        setBusinessToDelete({ id: businessId, name: businessName });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!businessToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(businessToDelete.id);
            // Tampilkan notifikasi sukses dengan react-toastify
            toast.success('Data bisnis berhasil dihapus!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error in BackgroundList delete:', error);
            // Tampilkan notifikasi error
            toast.error('Gagal menghapus data bisnis!', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setBusinessToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setBusinessToDelete(null);
    };

    // LOADING STATE
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latar Belakang Bisnis</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola informasi dasar bisnis Anda</p>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader className="animate-spin h-8 w-8 text-green-600 mx-auto mb-4" />
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latar Belakang Bisnis</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola informasi dasar bisnis Anda</p>
                    </div>
                </div>
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                        {error}
                    </p>
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mx-auto"
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
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Konfirmasi Hapus
                            </h3>
                            <button
                                onClick={handleCancelDelete}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6 text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Apakah Anda yakin ingin menghapus bisnis ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{businessToDelete?.name}"</strong>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latar Belakang Bisnis</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola informasi dasar bisnis Anda</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Tambah Bisnis
                </button>
            </div>

            {/* LIST BISNIS */}
            {businesses.length === 0 ? (
                <div className="text-center py-12">
                    <Building size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data bisnis</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan menambahkan data bisnis pertama Anda</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Tambah Bisnis Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                        <div key={business.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {business.logo ? (
                                        <img
                                            src={`${API_URL}/get-image/${business.logo}`}
                                            alt={business.name}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center border border-green-200 dark:border-green-800 ${business.logo ? 'hidden' : ''}`}>
                                        <Building className="text-green-600 dark:text-green-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{business.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{business.category}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span className="line-clamp-1">{business.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building size={16} />
                                    <span>{business.business_type}</span>
                                </div>
                                {business.start_date && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>{new Date(business.start_date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                                {business.description}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onView(business)}
                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Eye size={16} />

                                </button>
                                <button
                                    onClick={() => onEdit(business)}
                                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Edit3 size={16} />

                                </button>
                                <button
                                    onClick={() => handleDeleteClick(business.id, business.name)}
                                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
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

export default BackgroundList;