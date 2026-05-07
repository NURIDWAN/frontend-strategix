import { Edit3, Building, MapPin, Calendar, Users, Target } from 'lucide-react';

const BackgroundView = ({ business, onBack, onEdit }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    if (!business) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section dengan tombol back di atas */}
            <div className="mb-2"> {/* Kurangi margin bottom */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4" /* Tambah margin bottom */
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Bisnis</h1>
                        <p className="text-gray-600 dark:text-gray-400">Lihat detail lengkap bisnis</p>
                    </div>
                    <button
                        onClick={() => onEdit(business)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">

                {/* Background Image Section */}
                {business.background_image && (
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Background Bisnis</h3>
                        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                            <img
                                src={`${API_URL}/get-image/${business.background_image}`}
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Header dengan Logo */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                            {business.logo ? (
                                <img
                                    src={`${API_URL}/get-image/${business.logo}`}
                                    alt={business.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                            ) : (
                                <Building className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{business.name}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full">
                                {business.category}
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                                {business.business_type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Informasi Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={20} />
                            Informasi Dasar
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Lokasi
                                </label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <MapPin size={16} />
                                    {business.location}
                                </div>
                            </div>
                            {business.start_date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Calendar size={16} />
                                        {new Date(business.start_date).toLocaleDateString('id-ID')}
                                    </div>
                                </div>
                            )}
                            {business.contact && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Kontak
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{business.contact}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target size={20} />
                            Tujuan Bisnis
                        </h3>
                        <div>
                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                {business.purpose || 'Belum diisi'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deskripsi Bisnis</h3>
                    <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                        {business.description}
                    </p>
                </div>

                {/* Gambaran Umum Usaha */}
                {business.business_overview && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gambaran Umum Usaha</h3>
                        <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                            {business.business_overview}
                        </p>
                    </div>
                )}

                {/* Legalitas Usaha */}
                {business.business_legality && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Legalitas Usaha</h3>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                {business.business_legality}
                            </p>
                        </div>
                    </div>
                )}

                {/* Maksud & Tujuan Pendirian Usaha */}
                {business.business_objectives && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maksud & Tujuan Pendirian Usaha</h3>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                {business.business_objectives}
                            </p>
                        </div>
                    </div>
                )}

                {/* Visi & Misi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visi</h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line italic">
                                {business.vision || 'Belum diisi'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Misi</h3>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                {business.mission || 'Belum diisi'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nilai-nilai */}
                {business.values && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users size={20} />
                            Nilai-Nilai Perusahaan
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                {business.values}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons di bagian bawah */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(business)}
                        className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit Bisnis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackgroundView;