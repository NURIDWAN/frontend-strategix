import { Edit3, User, Briefcase, GraduationCap, Building, Calendar, Users, MapPin } from 'lucide-react';

const TeamStructureView = ({ team, onBack, onEdit }) => {
    if (!team) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Helper function untuk mengakses business background
    const getBusinessInfo = () => {
        if (!team.business_background) {
            return { name: 'Bisnis Tidak Ditemukan', category: 'Tidak ada kategori' };
        }
        return {
            name: team.business_background.name || 'Bisnis Tidak Ditemukan',
            category: team.business_background.category || 'Tidak ada kategori'
        };
    };

    const businessInfo = getBusinessInfo();

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Draft' },
            active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Aktif' }
        };
        
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getTeamCategoryBadge = (category) => {
        const categoryConfig = {
            'tim backend': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', label: 'Tim Backend' },
            'tim frontend': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300', label: 'Tim Frontend' },
            'tim produksi': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Tim Produksi' },
            'tim marketing': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', label: 'Tim Marketing' },
            'tim operasional': { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300', label: 'Tim Operasional' },
            'tim management': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300', label: 'Tim Management' },
        };

        const config = categoryConfig[category?.toLowerCase()] || { 
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300', 
            label: category || 'Tidak ada kategori' 
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

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
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Anggota Tim</h1>
                        <p className="text-gray-600 dark:text-gray-400">Lihat detail lengkap anggota tim</p>
                    </div>
                    <button
                        onClick={() => onEdit(team)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
                
                {/* Header */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        {team.photo_url ? (
                            <img 
                                src={team.photo_url} 
                                alt={team.member_name}
                                className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                        ) : (
                            <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                                <User className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {team.member_name}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Users size={14} />
                                Anggota Tim
                            </span>
                            <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Building size={14} />
                                {businessInfo.name}
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Calendar size={14} />
                                Dibuat: {new Date(team.created_at).toLocaleDateString('id-ID')}
                            </span>
                            <span>
                                {getStatusBadge(team.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Informasi Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informasi Pribadi */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <User size={20} />
                            Informasi Pribadi
                        </h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Nama Lengkap</h4>
                                    <p className="text-gray-900 dark:text-white">{team.member_name}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Posisi/Jabatan</h4>
                                    <p className="text-gray-900 dark:text-white">{team.position}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Kategori Tim</h4>
                                    {getTeamCategoryBadge(team.team_category)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Bisnis */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={20} />
                            Informasi Bisnis
                        </h3>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Bisnis</h4>
                                    <p className="text-gray-900 dark:text-white">{businessInfo.name}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Kategori Bisnis</h4>
                                    <p className="text-gray-900 dark:text-white">{businessInfo.category}</p>
                                </div>
                                {team.operational_plan && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Rencana Operasional</h4>
                                        <p className="text-gray-900 dark:text-white">{team.operational_plan.business_location}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pengalaman & Latar Belakang */}
                {team.experience && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <GraduationCap size={20} />
                            Pengalaman & Latar Belakang
                        </h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                                {team.experience}
                            </p>
                        </div>
                    </div>
                )}

                {/* Status & Urutan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Status Anggota
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span>{getStatusBadge(team.status)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Urutan Tampil:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">#{team.sort_order}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Informasi Sistem
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dibuat:</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Date(team.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Diperbarui:</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Date(team.updated_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons di bagian bawah */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Kembali
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(team)}
                        className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit Anggota
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamStructureView;