import { Package, Plus, Eye, Edit3, Trash2, Loader, RefreshCw, X, DollarSign, Star, TrendingUp, Building, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const ProductServiceList = ({
    products,
    onView,
    onEdit,
    onDelete,
    onCreateNew,
    isLoading,
    error,
    onRetry,
    statistics
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [failedImages, setFailedImages] = useState(new Set());
    const [selectedBusiness, setSelectedBusiness] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    const handleDeleteClick = (productId, productName) => {
        setProductToDelete({ id: productId, name: productName });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(productToDelete.id);
            // hapus toast di sini, karena sudah ada di ProductService.jsx
        } catch (error) {
            toast.error('Gagal menghapus data produk/layanan!');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    // Handle image error
    const handleImageError = (productId) => {
        setFailedImages(prev => new Set(prev).add(productId));
    };

    // Get unique businesses for filter
    const getUniqueBusinesses = () => {
        const businesses = products
            .filter(product => {
                return product.business_background &&
                    product.business_background.id &&
                    (product.business_background.business_name || product.business_background.name);
            })
            .map(product => ({
                id: product.business_background.id,
                name: product.business_background.business_name || product.business_background.name,
                category: product.business_background.category || 'Tidak ada kategori'
            }));

        // Remove duplicates
        return businesses.filter((business, index, self) =>
            index === self.findIndex(b => b.id === business.id)
        );
    };

    // Filter products berdasarkan criteria
    const filteredProducts = products.filter(product => {
        // Filter business
        if (selectedBusiness !== 'all' && product.business_background?.id !== selectedBusiness) {
            return false;
        }

        // Filter type
        if (selectedType !== 'all' && product.type !== selectedType) {
            return false;
        }

        return true;
    });

    const uniqueBusinesses = getUniqueBusinesses();

    // Helper function untuk mengakses business background
    const getBusinessInfo = (product) => {
        if (!product.business_background) {
            return {
                name: `Bisnis (ID: ${product.business_background_id})`,
                category: 'Tidak ada kategori'
            };
        }

        return {
            name: product.business_background.business_name || product.business_background.name || `Bisnis (ID: ${product.business_background_id})`,
            category: product.business_background.category || 'Tidak ada kategori'
        };
    };

    // Format currency
    const formatPrice = (price) => {
        if (!price) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Draft' },
            in_development: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Dalam Pengembangan' },
            launched: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Diluncurkan' }
        };
        return statusConfig[status] || statusConfig.draft;
    };

    // Get type badge color
    const getTypeBadge = (type) => {
        const typeConfig = {
            product: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', label: 'Produk' },
            service: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300', label: 'Layanan' }
        };
        return typeConfig[type] || typeConfig.product;
    };

    // Check if product has BMC alignment
    const hasBmcAlignment = (product) => {
        return product.bmc_alignment && Object.values(product.bmc_alignment).some(val => val && val.trim() !== '');
    };

    // Get image URL - Menggunakan image_url dari backend yang sudah diperbaiki
    const getImageUrl = (product) => {
        // Prioritaskan image_url dari backend yang sudah include full URL
        if (product.image_url) {
            return product.image_url;
        }

        // Fallback ke path langsung jika image_url tidak ada
        if (product.image_path) {
            return `/get-image/${product.image_path}`;
        }

        return null;
    };

    // Reset semua filter
    const resetFilters = () => {
        setSelectedBusiness('all');
        setSelectedType('all');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produk & Layanan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola produk dan layanan bisnis Anda</p>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produk & Layanan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola produk dan layanan bisnis Anda</p>
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
                                Apakah Anda yakin ingin menghapus produk/layanan ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{productToDelete?.name}"</strong>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produk & Layanan</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola produk dan layanan bisnis Anda dengan integrasi Business Model Canvas</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Tambah Produk/Layanan
                </button>
            </div>

            {/* STATISTICS CARD */}
            {statistics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Produk</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.products_count || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Layanan</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.services_count || 0}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Diluncurkan</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.launched_count || 0}</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* FILTER SECTION - TANPA FILTER STATUS */}
            {(products.length > 0 || uniqueBusinesses.length > 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={16} />
                            Filter Data:
                        </h3>
                        {(selectedBusiness !== 'all' || selectedType !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 w-full sm:w-auto text-left sm:text-center"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>

                    {/* Filter Bisnis - Button Style */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedBusiness('all')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedBusiness === 'all'
                                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Building size={14} />
                            <span>Semua Bisnis</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedBusiness === 'all'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {products.length}
                            </span>
                        </button>

                        {uniqueBusinesses.map(business => (
                            <button
                                key={business.id}
                                onClick={() => setSelectedBusiness(business.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedBusiness === business.id
                                        ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Building size={14} />
                                <div className="text-left">
                                    <div className="font-medium">{business.name}</div>
                                    <div className="text-xs opacity-80 hidden sm:block">{business.category}</div>
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedBusiness === business.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {products.filter(p => p.business_background?.id === business.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Filter Tipe - Button Style */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedType === 'all'
                                    ? 'bg-purple-500 border-purple-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Package size={14} />
                            <span>Semua Tipe</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedType === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {products.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedType('product')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedType === 'product'
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Package size={14} />
                            <span>Produk</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedType === 'product'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {products.filter(p => p.type === 'product').length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedType('service')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedType === 'service'
                                    ? 'bg-purple-500 border-purple-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <TrendingUp size={14} />
                            <span>Layanan</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedType === 'service'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {products.filter(p => p.type === 'service').length}
                            </span>
                        </button>
                    </div>

                    {/* Filter Info */}
                    {(selectedBusiness !== 'all' || selectedType !== 'all') && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                                    <Building size={16} />
                                    <span>
                                        Menampilkan {filteredProducts.length} dari {products.length} produk/layanan
                                        {selectedBusiness !== 'all' && (
                                            <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                        )}
                                        {selectedType !== 'all' && (
                                            <span> - Tipe: <strong>{selectedType === 'product' ? 'Produk' : 'Layanan'}</strong></span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LIST PRODUK/LAYANAN */}
            {products.length === 0 ? (
                <div className="text-center py-12">
                    <Package size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data produk/layanan</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan menambahkan produk/layanan pertama Anda dengan integrasi Business Model Canvas</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                        Tambah Produk/Layanan Pertama
                    </button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <Building size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada produk/layanan yang sesuai</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Tidak ditemukan produk/layanan untuk filter yang dipilih</p>
                    <button
                        onClick={resetFilters}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                        Reset Filter
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const statusBadge = getStatusBadge(product.status);
                            const typeBadge = getTypeBadge(product.type);
                            const imageUrl = getImageUrl(product);
                            const hasImageFailed = failedImages.has(product.id);
                            const businessInfo = getBusinessInfo(product);
                            const hasBmc = hasBmcAlignment(product);

                            return (
                                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    {/* Header dengan gambar */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800 overflow-hidden">
                                                {imageUrl && !hasImageFailed ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={() => handleImageError(product.id)}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <Package className="text-blue-600 dark:text-blue-400" size={24} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className={`text-xs px-2 py-1 rounded ${typeBadge.color}`}>
                                                        {typeBadge.label}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${statusBadge.color}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                    {/* BMC BADGE - DITAMBAHKAN DI SINI */}
                                                    {hasBmc && (
                                                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-1">
                                                            <BarChart3 size={10} />
                                                            BMC
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Bisnis */}
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Building size={12} />
                                            <span className="line-clamp-1">{businessInfo.name}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="hidden sm:inline">{businessInfo.category}</span>
                                        </div>
                                    </div>

                                    {/* Deskripsi */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                                        {product.description}
                                    </p>

                                    {/* Harga */}
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        <DollarSign size={16} className={`${product.price ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${!product.price && 'text-gray-500'}`}>
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>

                                    {/* Keunggulan */}
                                    {product.advantages && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <Star size={16} className="mt-0.5 flex-shrink-0 text-yellow-500" />
                                            <span className="line-clamp-2 flex-1">{product.advantages}</span>
                                        </div>
                                    )}

                                    {/* Strategi Pengembangan */}
                                    {product.development_strategy && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            <TrendingUp size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                                            <span className="line-clamp-2 flex-1">{product.development_strategy}</span>
                                        </div>
                                    )}

                                    {/* Informasi Tambahan */}
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                                        <div>Dibuat: {new Date(product.created_at).toLocaleDateString('id-ID')}</div>
                                        {product.updated_at !== product.created_at && (
                                            <div>Diperbarui: {new Date(product.updated_at).toLocaleDateString('id-ID')}</div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onView(product)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={14} />
                                            <span className="hidden xs:inline">Lihat</span>
                                        </button>
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="flex-1 bg-yellow-600 text-white py-2 px-2 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1"
                                            title="Edit"
                                        >
                                            <Edit3 size={14} />
                                            <span className="hidden xs:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(product.id, product.name)}
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
                        Menampilkan {filteredProducts.length} dari {products.length} produk/layanan
                        {(selectedBusiness !== 'all' || selectedType !== 'all') && (
                            <span>
                                {selectedBusiness !== 'all' && (
                                    <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                )}
                                {selectedType !== 'all' && (
                                    <span> - Tipe: <strong>{selectedType === 'product' ? 'Produk' : 'Layanan'}</strong></span>
                                )}
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductServiceList;