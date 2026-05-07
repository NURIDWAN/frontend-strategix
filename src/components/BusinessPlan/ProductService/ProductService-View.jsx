import { Edit3, Package, DollarSign, Star, TrendingUp, Building, Calendar, Tag, Image, Target, Users, BarChart3, Shield, Handshake, CreditCard, Activity } from 'lucide-react';
import { useState } from 'react';

const ProductServiceView = ({ product, onBack, onEdit }) => {
    const [imageError, setImageError] = useState(false);
    const [showBmcDetails, setShowBmcDetails] = useState(false);

    // Early return jika product undefined
    if (!product) {
        return (
            <div className="space-y-6">
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
                </div>
                <div className="text-center py-12">
                    <Package size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Data tidak ditemukan</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Produk/layanan yang Anda cari tidak ditemukan</p>
                    <button
                        onClick={onBack}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Kembali ke Daftar
                    </button>
                </div>
            </div>
        );
    }

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

    // Get image URL - Prioritaskan image_url dari backend
    const getImageUrl = () => {
        if (product.image_url) {
            return product.image_url;
        }

        if (product.image_path) {
            return `/get-image/${product.image_path}`;
        }

        return null;
    };

    // Helper function untuk mengakses business background
    const getBusinessInfo = () => {
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

    // BMC Fields configuration
    const bmcFields = [
        {
            key: 'customer_segment',
            icon: Target,
            label: 'Customer Segment',
            description: 'Target pasar untuk produk/layanan ini',
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
        },
        {
            key: 'value_proposition',
            icon: Shield,
            label: 'Value Proposition',
            description: 'Nilai unik yang ditawarkan kepada customer',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        },
        {
            key: 'channels',
            icon: BarChart3,
            label: 'Channels',
            description: 'Saluran distribusi dan pemasaran',
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
        },
        {
            key: 'customer_relationships',
            icon: Users,
            label: 'Customer Relationships',
            description: 'Strategi menjaga hubungan dengan customer',
            color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300'
        },
        {
            key: 'revenue_streams',
            icon: CreditCard,
            label: 'Revenue Streams',
            description: 'Sumber pendapatan dari produk/layanan',
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        },
        {
            key: 'key_resources',
            icon: Package,
            label: 'Key Resources',
            description: 'Sumber daya utama yang dibutuhkan',
            color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
        },
        {
            key: 'key_activities',
            icon: Activity,
            label: 'Key Activities',
            description: 'Aktivitas utama dalam bisnis',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        },
        {
            key: 'key_partnerships',
            icon: Handshake,
            label: 'Key Partnerships',
            description: 'Kemitraan strategis yang dibutuhkan',
            color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300'
        },
        {
            key: 'cost_structure',
            icon: DollarSign,
            label: 'Cost Structure',
            description: 'Struktur biaya operasional',
            color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
        }
    ];

    const imageUrl = getImageUrl();
    const statusBadge = getStatusBadge(product.status || 'draft');
    const typeBadge = getTypeBadge(product.type || 'product');
    const businessInfo = getBusinessInfo();

    const handleImageError = () => {
        console.error('Failed to load image:', imageUrl);
        setImageError(true);
    };

    const hasBmcData = product.bmc_alignment && Object.values(product.bmc_alignment).some(value => value && value.trim() !== '');

    return (
        <div className="space-y-6">
            {/* Header Section dengan tombol back di atas */}
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Produk/Layanan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Lihat detail lengkap produk/layanan dengan integrasi Business Model Canvas</p>
                    </div>
                    <button
                        onClick={() => onEdit(product)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Edit3 size={16} />
                        Edit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        {imageUrl && !imageError ? (
                            <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={imageUrl}
                                    alt={product.name || 'Produk/Layanan'}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                                <Package className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                            {product.name || 'Nama tidak tersedia'}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full flex items-center gap-1 ${typeBadge.color}`}>
                                <Tag size={14} />
                                {typeBadge.label}
                            </span>
                            <span className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                                <Building size={14} />
                                {statusBadge.label}
                            </span>
                            {hasBmcData && (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-1">
                                    <BarChart3 size={14} />
                                    BMC Integrated
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Calendar size={14} />
                                Diperbarui: {product.updated_at ? new Date(product.updated_at).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Informasi Bisnis */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building size={20} />
                        Bisnis Terkait
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Nama Bisnis</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {businessInfo.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Kategori</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {businessInfo.category}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gambar Produk */}
                {imageUrl && !imageError && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Image size={20} />
                            Gambar {product.type === 'product' ? 'Produk' : 'Layanan'}
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex justify-center">
                            <div className="max-w-md w-full">
                                <img
                                    src={imageUrl}
                                    alt={product.name || 'Produk/Layanan'}
                                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-sm"
                                    onError={handleImageError}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Deskripsi */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package size={20} />
                        Deskripsi
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                            {product.description || 'Tidak ada deskripsi'}
                        </p>
                    </div>
                </div>

                {/* Harga */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign size={20} />
                        Harga
                    </h3>
                    <div className={`rounded-lg p-4 ${product.price ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                        <p className={`text-2xl font-bold ${product.price ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatPrice(product.price)}
                        </p>
                        {!product.price && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Produk/layanan ini gratis atau harga belum ditentukan
                            </p>
                        )}
                    </div>
                </div>

                {/* Keunggulan */}
                {product.advantages ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Star size={20} />
                            Keunggulan
                        </h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                                {product.advantages}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Star size={20} />
                            Keunggulan
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Tidak ada informasi keunggulan
                            </p>
                        </div>
                    </div>
                )}

                {/* Strategi Pengembangan */}
                {product.development_strategy ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} />
                            Strategi Pengembangan
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                                {product.development_strategy}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} />
                            Strategi Pengembangan
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Tidak ada informasi strategi pengembangan
                            </p>
                        </div>
                    </div>
                )}

                {/* BMC Alignment Section */}
                {hasBmcData && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 size={20} />
                                Business Model Canvas Alignment
                            </h3>
                            <button
                                onClick={() => setShowBmcDetails(!showBmcDetails)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                {showBmcDetails ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
                            </button>
                        </div>

                        {showBmcDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bmcFields.map((field) => {
                                    const IconComponent = field.icon;
                                    const value = product.bmc_alignment?.[field.key];

                                    if (!value || value.trim() === '') return null;

                                    return (
                                        <div key={field.key} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <IconComponent size={16} className={field.color} />
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {field.label}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                                {value}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        BMC Integration Active
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Produk/layanan ini telah terintegrasi dengan Business Model Canvas.
                                        Klik "Tampilkan Detail" untuk melihat analisis lengkap.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Informasi Metadata */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informasi Lainnya</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Dibuat Pada</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {product.created_at ?
                                        `${new Date(product.created_at).toLocaleDateString('id-ID')} ${new Date(product.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                        : 'Tidak tersedia'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Diperbarui Pada</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {product.updated_at ?
                                        `${new Date(product.updated_at).toLocaleDateString('id-ID')} ${new Date(product.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                        : 'Tidak tersedia'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Tipe</p>
                                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {product.type || 'Tidak tersedia'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Status</p>
                                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {statusBadge.label}
                                </p>
                            </div>
                            {hasBmcData && (
                                <div className="md:col-span-2">
                                    <p className="text-gray-600 dark:text-gray-400">BMC Integration</p>
                                    <p className="font-semibold text-green-600 dark:text-green-400">
                                        ✓ Terintegrasi dengan Business Model Canvas
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons di bagian bawah */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium"
                    >
                        Kembali ke Daftar
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Edit3 size={16} />
                        Edit Produk/Layanan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductServiceView;