import { BarChart3, Target, Users, TrendingUp, Plus, Eye, Edit3, Trash2, Loader, RefreshCw, X, Building } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const MarketAnalysisList = ({ 
    analyses, 
    onView, 
    onEdit, 
    onDelete, 
    onCreateNew,
    isLoading,
    error,
    onRetry
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [analysisToDelete, setAnalysisToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState('all');

    const handleDeleteClick = (analysisId, analysisTitle) => {
        setAnalysisToDelete({ id: analysisId, title: analysisTitle });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!analysisToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(analysisToDelete.id);
            toast.success('Data analisis pasar berhasil dihapus!');
        } catch (error) {
            toast.error('Gagal menghapus data analisis pasar!');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setAnalysisToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setAnalysisToDelete(null);
    };

    // Get unique businesses for filter
    const getUniqueBusinesses = () => {
        const businesses = analyses
            .filter(analysis => {
                return analysis.business_background && 
                       analysis.business_background.id && 
                       analysis.business_background.name;
            })
            .map(analysis => ({
                id: analysis.business_background.id,
                name: analysis.business_background.name,
                category: analysis.business_background.category || 'Tidak ada kategori'
            }));
        
        // Remove duplicates
        return businesses.filter((business, index, self) => 
            index === self.findIndex(b => b.id === business.id)
        );
    };

    const filteredAnalyses = selectedBusiness === 'all' 
        ? analyses 
        : analyses.filter(analysis => 
            analysis.business_background?.id === selectedBusiness
        );

    const uniqueBusinesses = getUniqueBusinesses();

    // Helper function untuk mengakses business background
    const getBusinessInfo = (analysis) => {
        if (!analysis.business_background) {
            return { 
                name: `Bisnis (ID: ${analysis.business_background_id})`, 
                category: 'Tidak ada kategori' 
            };
        }
        
        return {
            name: analysis.business_background.name || `Bisnis (ID: ${analysis.business_background_id})`,
            category: analysis.business_background.category || 'Tidak ada kategori'
        };
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analisis Pasar</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola analisis pasar dan kompetitor bisnis Anda</p>
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

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analisis Pasar</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola analisis pasar dan kompetitor bisnis Anda</p>
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
                                Apakah Anda yakin ingin menghapus analisis pasar ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{analysisToDelete?.title}"</strong>
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
                                        Hapus
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analisis Pasar</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola analisis pasar dan kompetitor bisnis Anda</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Tambah Analisis
                </button>
            </div>

            {/* FILTER BUTTONS - Horizontal */}
            {analyses.length > 0 && uniqueBusinesses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={16} />
                            Filter Berdasarkan Bisnis:
                        </h3>
                        {selectedBusiness !== 'all' && (
                            <button
                                onClick={() => setSelectedBusiness('all')}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 w-full sm:w-auto text-left sm:text-center"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {/* Tombol Semua Bisnis */}
                        <button
                            onClick={() => setSelectedBusiness('all')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                selectedBusiness === 'all'
                                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Building size={14} />
                            <span>Semua Bisnis</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedBusiness === 'all' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {analyses.length}
                            </span>
                        </button>

                        {/* Tombol untuk setiap bisnis */}
                        {uniqueBusinesses.map(business => (
                            <button
                                key={business.id}
                                onClick={() => setSelectedBusiness(business.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                    selectedBusiness === business.id
                                        ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Building size={14} />
                                <div className="text-left">
                                    <div className="font-medium">{business.name}</div>
                                    <div className="text-xs opacity-80 hidden sm:block">{business.category}</div>
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    selectedBusiness === business.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                    {analyses.filter(a => a.business_background?.id === business.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Filter Info */}
                    {selectedBusiness !== 'all' && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                                    <Building size={16} />
                                    <span>
                                        Menampilkan {filteredAnalyses.length} dari {analyses.length} analisis untuk{' '}
                                        <strong>
                                            {uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LIST ANALISIS */}
            {analyses.length === 0 ? (
                <div className="text-center py-12">
                    <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data analisis pasar</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan menambahkan analisis pasar pertama Anda</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                        Tambah Analisis Pertama
                    </button>
                </div>
            ) : filteredAnalyses.length === 0 ? (
                <div className="text-center py-12">
                    <Building size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada analisis untuk bisnis ini</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Tidak ditemukan analisis pasar untuk bisnis yang dipilih</p>
                    <button
                        onClick={() => setSelectedBusiness('all')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                        Lihat Semua Analisis
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAnalyses.map((analysis) => {
                            const businessInfo = getBusinessInfo(analysis);
                            
                            return (
                                <div key={analysis.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-800">
                                                <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {businessInfo.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                                        {businessInfo.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(analysis.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {analysis.target_market && (
                                            <div className="flex items-start gap-2">
                                                <Target size={16} className="mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{analysis.target_market}</span>
                                            </div>
                                        )}
                                        {analysis.market_size && (
                                            <div className="flex items-start gap-2">
                                                <TrendingUp size={16} className="mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{analysis.market_size}</span>
                                            </div>
                                        )}
                                        {analysis.main_competitors && (
                                            <div className="flex items-start gap-2">
                                                <Users size={16} className="mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{analysis.main_competitors}</span>
                                            </div>
                                        )}
                                    </div>

                                    {analysis.competitive_advantage && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                                            <strong>Keunggulan:</strong> {analysis.competitive_advantage}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onView(analysis)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={14} />
                                            <span className="hidden xs:inline">Lihat</span>
                                        </button>
                                        <button
                                            onClick={() => onEdit(analysis)}
                                            className="flex-1 bg-yellow-600 text-white py-2 px-2 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1"
                                            title="Edit"
                                        >
                                            <Edit3 size={14} />
                                            <span className="hidden xs:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(analysis.id, businessInfo.name)}
                                            className="flex-1 bg-red-600 text-white py-2 px-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                                            title="Hapus"
                                        >
                                            <Trash2 size={14} />
                                            <span className="hidden xs:inline">Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Jumlah Data */}
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan {filteredAnalyses.length} dari {analyses.length} analisis pasar
                        {selectedBusiness !== 'all' && (
                            <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketAnalysisList;