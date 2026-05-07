import { Upload, X } from 'lucide-react';

const BackgroundForm = ({
    title,
    subtitle,
    formData,
    logoPreview,
    backgroundPreview,
    isLoading,
    onInputChange,
    onFileChange,
    onRemoveLogo,
    onRemoveBackground,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create'
}) => {
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
                    Back
                </button>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>
            <form onSubmit={onSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    
                    {/* Logo Upload */}
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 relative">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img 
                                            src={logoPreview} 
                                            alt="Logo preview" 
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={onRemoveLogo}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <Upload className="text-gray-400" size={24} />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo Bisnis
                            </label>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onFileChange(e, 'logo')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-300"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Format: JPG, PNG, GIF (Maks. 2MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Background Image Upload */}
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 relative overflow-hidden">
                                {backgroundPreview ? (
                                    <div className="relative w-full h-full">
                                        <img 
                                            src={backgroundPreview} 
                                            alt="Background preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={onRemoveBackground}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <Upload className="text-gray-400" size={24} />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Background/Foto Bisnis
                            </label>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onFileChange(e, 'background')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Format: JPG, PNG, GIF (Maks. 5MB) - Akan ditampilkan di halaman landing
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nama Bisnis *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onInputChange}
                                placeholder="Nama perusahaan/usaha"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kategori Bisnis *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="Retail">Retail</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Services">Services</option>
                                <option value="Technology">Technology</option>
                                <option value="Food & Beverage">Food & Beverage</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Other">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsi Bisnis *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onInputChange}
                            rows={4}
                            placeholder="Jelaskan secara detail tentang bisnis Anda, produk/layanan yang ditawarkan, dll."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* New Fields - Gambaran Umum, Legalitas, Maksud & Tujuan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gambaran Umum Usaha
                        </label>
                        <textarea
                            name="business_overview"
                            value={formData.business_overview || ''}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Gambarkan kondisi umum usaha Anda, sejarah singkat, pencapaian, dan perkembangan usaha saat ini"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Informasi tentang latar belakang, pengalaman, dan perkembangan usaha
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Legalitas Usaha
                        </label>
                        <textarea
                            name="business_legality"
                            value={formData.business_legality || ''}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Masukkan informasi legalitas seperti NIB, nomor izin usaha, sertifikasi, NPWP, akta pendirian, dll"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Perizinan, NIB, sertifikasi, dan dokumen legal lainnya
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Maksud & Tujuan Pendirian Usaha
                        </label>
                        <textarea
                            name="business_objectives"
                            value={formData.business_objectives || ''}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Sebutkan maksud dan tujuan utama mendirikan usaha ini, apa yang ingin dicapai dalam jangka pendek dan jangka panjang"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Target pasar, kesempatan bisnis, dan tujuan pertumbuhan
                        </p>
                    </div>

                    {/* Location & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Lokasi *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={onInputChange}
                                placeholder="Alamat lengkap bisnis"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipe Bisnis *
                            </label>
                            <select
                                name="business_type"
                                value={formData.business_type}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Tipe Bisnis</option>
                                <option value="PT">PT (Perseroan Terbatas)</option>
                                <option value="CV">CV (Commanditaire Vennootschap)</option>
                                <option value="UD">UD (Usaha Dagang)</option>
                                <option value="Firma">Firma</option>
                                <option value="UMKM">UMKM</option>
                                <option value="Startup">Startup</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Other">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kontak
                            </label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={onInputChange}
                                placeholder="Email/Telepon/Media Sosial"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tujuan Bisnis
                        </label>
                        <textarea
                            name="purpose"
                            value={formData.purpose}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Apa tujuan utama dari bisnis Anda?"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Vision & Mission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Visi
                            </label>
                            <textarea
                                name="vision"
                                value={formData.vision}
                                onChange={onInputChange}
                                rows={4}
                                placeholder="Visi jangka panjang bisnis Anda"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Misi
                            </label>
                            <textarea
                                name="mission"
                                value={formData.mission}
                                onChange={onInputChange}
                                rows={4}
                                placeholder="Misi dan langkah-langkah untuk mencapai visi"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Values */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nilai-Nilai Perusahaan
                        </label>
                        <textarea
                            name="values"
                            value={formData.values}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Nilai-nilai dan prinsip yang dianut perusahaan"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
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
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

export default BackgroundForm;