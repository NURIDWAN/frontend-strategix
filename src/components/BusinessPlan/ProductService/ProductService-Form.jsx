import { Upload, X, Building, Loader, Package, DollarSign, Star, TrendingUp, Image, Target, Users, BarChart3, Shield, Handshake, CreditCard, Activity, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProductServiceForm = ({
    title,
    subtitle,
    formData,
    businesses,
    isLoadingBusinesses,
    isLoading,
    previewImage,
    existingImageUrl,
    onInputChange,
    onFileChange,
    onRemoveImage,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create',
    existingProduct
}) => {
    const [localPreviewImage, setLocalPreviewImage] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [showBmcSection, setShowBmcSection] = useState(false);

    // BMC Alignment fields
    const [bmcAlignment, setBmcAlignment] = useState({
        customer_segment: '',
        value_proposition: '',
        channels: '',
        customer_relationships: '',
        revenue_streams: '',
        key_resources: '',
        key_activities: '',
        key_partnerships: '',
        cost_structure: ''
    });

    // Effect untuk handle preview image dari parent component
    useEffect(() => {
        if (previewImage) {
            setLocalPreviewImage(previewImage);
        }
    }, [previewImage]);

    // Effect untuk handle existing image dan BMC data saat mode edit
    useEffect(() => {
        if (mode === 'edit' && existingProduct) {
            if (existingImageUrl && !localPreviewImage) {
                setLocalPreviewImage(existingImageUrl);
            }
            
            // Set BMC alignment data jika ada
            if (existingProduct.bmc_alignment) {
                setBmcAlignment(existingProduct.bmc_alignment);
            }
        }
    }, [mode, existingProduct, existingImageUrl, localPreviewImage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (maks 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 2MB');
                e.target.value = '';
                return;
            }

            // Validasi tipe file
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Format file harus JPEG, PNG, GIF, atau WebP');
                e.target.value = '';
                return;
            }

            // Buat preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLocalPreviewImage(e.target.result);
                setImageError(false);
            };
            reader.readAsDataURL(file);

            // Kirim ke parent, tapi beri flag "silent"
            onFileChange(e, { silent: true });

            toast.success('Gambar berhasil dipilih');
        }
    };

    const handleRemoveImage = () => {
        setLocalPreviewImage(null);
        setImageError(false);

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }

        // Panggil parent remove image handler
        if (onRemoveImage) {
            onRemoveImage();
        } else {
            // Fallback: trigger file change dengan event kosong
            const event = {
                target: {
                    files: [null]
                }
            };
            onFileChange(event);
        }

        toast.info('Gambar dihapus');
    };

    const handleExistingImageError = () => {
        console.error('Failed to load existing image:', localPreviewImage);
        setImageError(true);
        setLocalPreviewImage(null);
    };

    const handleBmcChange = (field, value) => {
        setBmcAlignment(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateBmcAlignment = () => {
        const generatedBmc = {
            customer_segment: `Target pasar untuk ${formData.name} berdasarkan deskripsi: ${formData.description.substring(0, 100)}...`,
            value_proposition: formData.advantages ? `Keunggulan: ${formData.advantages}` : `Nilai utama: ${formData.description.substring(0, 150)}...`,
            channels: localPreviewImage ? "Platform digital, Pemasaran langsung, Visual marketing melalui gambar produk" : "Platform digital, Pemasaran langsung",
            customer_relationships: formData.development_strategy ? "Dukungan pelanggan, Pengembangan berkelanjutan berdasarkan strategi" : "Dukungan pelanggan",
            revenue_streams: formData.price ? `Pendapatan dari penjualan ${formData.type} dengan harga Rp ${parseInt(formData.price).toLocaleString('id-ID')}` : `Model pendapatan dari penjualan ${formData.type}`,
            key_resources: localPreviewImage ? `Aset intelektual, Brand ${formData.name}, Aset visual/gambar produk` : `Aset intelektual, Brand ${formData.name}`,
            key_activities: formData.development_strategy ? `Produksi/pengembangan ${formData.type}, Implementasi strategi pengembangan` : `Produksi/pengembangan ${formData.type}`,
            key_partnerships: "Supplier, mitra distribusi, partner teknologi",
            cost_structure: formData.development_strategy ? `Biaya produksi/pengembangan ${formData.type}, Biaya riset dan pengembangan${localPreviewImage ? ', Biaya branding dan visual assets' : ''}` : `Biaya produksi/pengembangan ${formData.type}${localPreviewImage ? ', Biaya branding dan visual assets' : ''}`
        };

        setBmcAlignment(generatedBmc);
        toast.success('BMC Alignment berhasil digenerate otomatis!');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Sertakan BMC alignment data dalam formData
        const formDataWithBmc = {
            ...formData,
            bmc_alignment: bmcAlignment
        };

        // Panggil onSubmit dari parent dengan data lengkap
        onSubmit(e, formDataWithBmc);
    };

    // Tipe options
    const typeOptions = [
        {
            value: 'product',
            label: 'Produk',
            description: 'Barang fisik yang dijual'
        },
        {
            value: 'service',
            label: 'Layanan',
            description: 'Jasa yang ditawarkan'
        }
    ];

    // Status options
    const statusOptions = [
        {
            value: 'draft',
            label: 'Draft',
            color: 'bg-gray-500',
            description: 'Masih dalam perencanaan'
        },
        {
            value: 'in_development',
            label: 'Dalam Pengembangan',
            color: 'bg-yellow-500',
            description: 'Sedang dikembangkan'
        },
        {
            value: 'launched',
            label: 'Diluncurkan',
            color: 'bg-green-500',
            description: 'Sudah diluncurkan'
        }
    ];

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

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">

                    {/* Gambar Produk */}
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 relative overflow-hidden">
                                {localPreviewImage && !imageError ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={localPreviewImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={handleExistingImageError}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Image size={24} />
                                        <span className="text-xs mt-1">Upload</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gambar {formData.type === 'product' ? 'Produk' : 'Layanan'} (Opsional)
                            </label>
                            <div>
                                <input
                                    type="file"
                                    id="image_path"
                                    name="image_path"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-300"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Format: JPG, PNG, GIF, WebP (Maks. 2MB)
                                </p>
                                {localPreviewImage && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        ✓ Gambar berhasil dipilih
                                    </p>
                                )}
                                {mode === 'edit' && existingProduct?.image_path && !localPreviewImage && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        ℹ Gambar saat ini akan dipertahankan
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pilih Bisnis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih Bisnis *
                        </label>
                        {isLoadingBusinesses ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Loader className="animate-spin h-4 w-4" />
                                <span>Memuat data bisnis...</span>
                            </div>
                        ) : businesses.length === 0 ? (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Belum ada data bisnis. Silakan buat latar belakang bisnis terlebih dahulu.
                                </p>
                            </div>
                        ) : (
                            <select
                                name="business_background_id"
                                value={formData.business_background_id}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Bisnis</option>
                                {businesses.map((business) => (
                                    <option key={business.id} value={business.id}>
                                        {business.business_name || business.name} - {business.category || 'Umum'}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pilih bisnis yang terkait dengan produk/layanan ini
                        </p>
                    </div>

                    {/* Tipe Produk/Layanan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Tipe Produk/Layanan *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {typeOptions.map((option) => {
                                const isSelected = formData.type === option.value;

                                return (
                                    <label
                                        key={option.value}
                                        className={`relative cursor-pointer group ${isSelected ? 'ring-2 ring-green-500 rounded-lg' : ''
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={onInputChange}
                                            className="sr-only"
                                        />
                                        <div className={`border rounded-lg p-4 transition-all duration-200 h-full ${isSelected
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                                            }`}>
                                            <div className="text-center">
                                                <div className="mb-2">
                                                    <span className={`text-base font-semibold ${isSelected 
                                                        ? 'text-green-700 dark:text-green-300' 
                                                        : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {option.label}
                                                    </span>
                                                </div>
                                                <p className={`text-xs ${isSelected 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Status Produk/Layanan
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {statusOptions.map((status) => (
                                <label
                                    key={status.value}
                                    className={`relative cursor-pointer group ${formData.status === status.value ? 'ring-2 ring-blue-500 rounded-lg' : ''
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status.value}
                                        checked={formData.status === status.value}
                                        onChange={onInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`border rounded-lg p-3 transition-all duration-200 ${formData.status === status.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${status.color} ${formData.status === status.value ? 'ring-2 ring-blue-300' : ''
                                                }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm font-medium ${formData.status === status.value
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {status.label}
                                                </span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {status.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Nama Produk/Layanan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nama {formData.type === 'product' ? 'Produk' : 'Layanan'} *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder={`Masukkan nama ${formData.type === 'product' ? 'produk' : 'layanan'}`}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                            maxLength={255}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formData.name.length}/255 karakter
                        </p>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsi *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onInputChange}
                            rows={4}
                            placeholder={`Jelaskan detail ${formData.type === 'product' ? 'produk' : 'layanan'} Anda`}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* Harga */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Harga (Opsional)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={onInputChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Kosongkan jika gratis atau belum ditentukan
                        </p>
                    </div>

                    {/* Keunggulan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Keunggulan (Opsional)
                        </label>
                        <div className="relative">
                            <Star className="absolute left-3 top-3 text-gray-400" size={16} />
                            <textarea
                                name="advantages"
                                value={formData.advantages}
                                onChange={onInputChange}
                                rows={3}
                                placeholder="Apa keunggulan produk/layanan Anda dibandingkan kompetitor?"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Strategi Pengembangan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Strategi Pengembangan (Opsional)
                        </label>
                        <div className="relative">
                            <TrendingUp className="absolute left-3 top-3 text-gray-400" size={16} />
                            <textarea
                                name="development_strategy"
                                value={formData.development_strategy}
                                onChange={onInputChange}
                                rows={3}
                                placeholder="Bagaimana rencana pengembangan produk/layanan ke depan?"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* BMC Alignment Section */}
                    <div className="border-t pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Business Model Canvas Alignment
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Keterkaitan dengan komponen Business Model Canvas
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={generateBmcAlignment}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                                >
                                    <TrendingUp size={16} />
                                    Generate Otomatis
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBmcSection(!showBmcSection)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    {showBmcSection ? 'Sembunyikan' : 'Tampilkan'}
                                </button>
                            </div>
                        </div>

                        {showBmcSection && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {bmcFields.map((field) => {
                                        const IconComponent = field.icon;
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <IconComponent size={16} className={field.color} />
                                                    {field.label}
                                                </label>
                                                <textarea
                                                    value={bmcAlignment[field.key] || ''}
                                                    onChange={(e) => handleBmcChange(field.key, e.target.value)}
                                                    placeholder={field.description}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <Info size={16} />
                                        Informasi BMC Alignment
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        Bagian ini menunjukkan bagaimana produk/layanan Anda terkait dengan 9 blok Business Model Canvas. 
                                        Gunakan "Generate Otomatis" untuk membuat analisis berdasarkan data yang sudah diinput.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isLoadingBusinesses || businesses.length === 0}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
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

export default ProductServiceForm;