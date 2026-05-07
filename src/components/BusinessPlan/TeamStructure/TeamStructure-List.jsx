import { Users, Building, Calendar, Plus, Eye, Edit3, Trash2, Loader, RefreshCw, X, User, Briefcase, GraduationCap, Target, CheckCircle, Clock, Image, DollarSign, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import GenerateSalaryModal from './GenerateSalaryModal';
import { teamStructureApi } from '../../../services/businessPlan';

const TeamStructureList = ({
    teams,
    onView,
    onEdit,
    onDelete,
    onCreateNew,
    isLoading,
    error,
    onRetry,
    statistics,
    onBusinessFilterChange,
    onShowOrgChart
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [isUploadingOrgChart, setIsUploadingOrgChart] = useState(false);
    const [orgChartPreview, setOrgChartPreview] = useState(null);
    const [showOrgChartModal, setShowOrgChartModal] = useState(false);

    const handleDeleteClick = (teamId, teamName) => {
        setTeamToDelete({ id: teamId, name: teamName });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!teamToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(teamToDelete.id);
            toast.success('Anggota tim berhasil dihapus!');
        } catch (error) {
            toast.error('Gagal menghapus anggota tim!');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setTeamToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setTeamToDelete(null);
    };

    const handleOrgChartUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Format file harus PNG, JPG, atau JPEG');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB');
            return;
        }

        if (selectedBusiness === 'all') {
            toast.error('Pilih bisnis terlebih dahulu untuk upload org chart');
            return;
        }

        setIsUploadingOrgChart(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await teamStructureApi.uploadOrgChart(
                selectedBusiness,
                file,
                user?.id
            );

            if (response.data.status === 'success') {
                toast.success('Org chart berhasil diupload');
                setOrgChartPreview(response.data.data.org_chart_url);
                // Trigger refresh jika ada callback
                if (onRetry) onRetry();
            }
        } catch (error) {
            console.error('Error uploading org chart:', error);
            toast.error(error.response?.data?.message || 'Gagal upload org chart');
        } finally {
            setIsUploadingOrgChart(false);
        }
    };

    const handleDeleteOrgChart = async () => {
        if (selectedBusiness === 'all') return;

        const confirmed = window.confirm('Hapus gambar struktur organisasi?');
        if (!confirmed) return;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await teamStructureApi.deleteOrgChart(selectedBusiness, user?.id);
            toast.success('Org chart berhasil dihapus');
            setOrgChartPreview(null);
            if (onRetry) onRetry();
        } catch (error) {
            console.error('Error deleting org chart:', error);
            toast.error('Gagal menghapus org chart');
        }
    };

    const handleBusinessFilterSelect = (businessId) => {
        setSelectedBusiness(businessId);
        if (onBusinessFilterChange) {
            onBusinessFilterChange(businessId);
        }
        // Jika user pilih bisnis tertentu (bukan 'all'), tampilkan tombol chart
        if (businessId !== 'all' && onShowOrgChart) {
            onShowOrgChart(businessId);
        }

        // Load org chart preview untuk bisnis yang dipilih
        if (businessId !== 'all') {
            loadOrgChartForBusiness(businessId);
        } else {
            setOrgChartPreview(null);
        }
    };

    // Load org chart untuk bisnis tertentu
    const loadOrgChartForBusiness = (businessId) => {
        const teamsForBusiness = teams.filter(team => team.business_background?.id === businessId);
        if (teamsForBusiness.length > 0) {
            const businessBg = teamsForBusiness[0].business_background;

            // Prioritas: org_chart_image_url (full URL), lalu org_chart_image (path)
            if (businessBg?.org_chart_image_url) {
                setOrgChartPreview(businessBg.org_chart_image_url);
            } else if (businessBg?.org_chart_image) {
                // Fallback jika tidak ada URL, construct dari path
                const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const orgChartPath = businessBg.org_chart_image;
                const fullURL = orgChartPath.startsWith('http') ? orgChartPath : `${baseURL}/get-image/${orgChartPath}`;
                setOrgChartPreview(fullURL);
            } else {
                setOrgChartPreview(null);
            }
        } else {
            setOrgChartPreview(null);
        }
    };

    // useEffect untuk load org chart saat component mount dan teams berubah
    useEffect(() => {
        if (selectedBusiness !== 'all') {
            loadOrgChartForBusiness(selectedBusiness);
        }
    }, [teams, selectedBusiness]);

    // Get unique businesses for filter
    const getUniqueBusinesses = () => {
        const businesses = teams
            .filter(team => {
                return team.business_background &&
                    team.business_background.id &&
                    team.business_background.name;
            })
            .map(team => ({
                id: team.business_background.id,
                name: team.business_background.name,
                category: team.business_background.category || 'Tidak ada kategori'
            }));

        // Remove duplicates
        return businesses.filter((business, index, self) =>
            index === self.findIndex(b => b.id === business.id)
        );
    };

    // Filter teams berdasarkan criteria
    const filteredTeams = teams.filter(team => {
        // Filter business
        if (selectedBusiness !== 'all' && team.business_background?.id !== selectedBusiness) {
            return false;
        }

        // Filter status
        if (selectedStatus !== 'all' && team.status !== selectedStatus) {
            return false;
        }

        return true;
    });

    const uniqueBusinesses = getUniqueBusinesses();

    // Helper function untuk mengakses business background
    const getBusinessInfo = (team) => {
        if (!team.business_background) {
            return {
                name: `Bisnis (ID: ${team.business_background_id})`,
                category: 'Tidak ada kategori'
            };
        }

        return {
            name: team.business_background.name || `Bisnis (ID: ${team.business_background_id})`,
            category: team.business_background.category || 'Tidak ada kategori'
        };
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Draft' },
            active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Aktif' }
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getTeamCategoryBadge = (category) => {
        const categoryConfig = {
            'tim backend': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
            'tim frontend': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
            'tim produksi': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
            'tim marketing': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
            'tim operasional': { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300' },
            'tim management': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300' },
        };

        const config = categoryConfig[category?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {category || 'Tidak ada kategori'}
            </span>
        );
    };

    // Reset semua filter
    const resetFilters = () => {
        setSelectedBusiness('all');
        setSelectedStatus('all');
        if (onBusinessFilterChange) {
            onBusinessFilterChange('all');
        }
    };

    // Calculate statistics jika tidak disediakan dari props
    const calculatedStatistics = statistics || {
        total: teams.length,
        active_count: teams.filter(team => team.status === 'active').length,
        draft_count: teams.filter(team => team.status === 'draft').length,
        with_photo_count: teams.filter(team => team.photo_url).length,
        total_salary: teams
            .filter(team => team.status === 'active')
            .reduce((sum, team) => {
                const salary = parseFloat(team.salary) || 0;
                return sum + salary;
            }, 0),
        management_count: teams.filter(team => team.team_category?.toLowerCase().includes('management')).length,
        operational_count: teams.filter(team => team.team_category?.toLowerCase().includes('operasional')).length,
        recent_count: teams.filter(team => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(team.created_at) > oneWeekAgo;
        }).length
    };

    const formatCurrency = (value) => {
        if (!value || value === 0) return '0';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '0';
        return Math.round(numValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Struktur Tim</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola struktur organisasi dan anggota tim</p>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Struktur Tim</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola struktur organisasi dan anggota tim</p>
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
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
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
                                Apakah Anda yakin ingin menghapus anggota tim ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{teamToDelete?.name}"</strong>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Struktur Tim</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola struktur organisasi dan anggota tim</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Tambah Anggota
                </button>
            </div>

            {/* STATISTICS CARDS - Konsisten dengan yang lain */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Anggota Tim
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Anggota</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedStatistics.total || 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Semua anggota tim
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div> */}

                {/* Anggota Aktif */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedStatistics.active_count || 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {calculatedStatistics.total > 0 ?
                                    Math.round((calculatedStatistics.active_count / calculatedStatistics.total) * 100) : 0
                                }% dari total
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Status Draft */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedStatistics.draft_count || 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Perlu diselesaikan
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Total Gaji Bulanan */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Gaji</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                Rp {formatCurrency(calculatedStatistics.total_salary || 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Per bulan (aktif)
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Terbaru (7 Hari) */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Terbaru</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedStatistics.recent_count || 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                7 hari terakhir
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ORG CHART & GENERATE SALARY SECTION */}
            {selectedBusiness !== 'all' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Org Chart Upload */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Image size={18} />
                            Struktur Organisasi (Gambar)
                        </h3>
                        <div className="space-y-3">
                            {orgChartPreview ? (
                                <div className="space-y-2">
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => setShowOrgChartModal(true)}
                                    >
                                        <img
                                            src={orgChartPreview}
                                            alt="Organization Chart"
                                            className="w-full h-40 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                            <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowOrgChartModal(true)}
                                            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16} />
                                            Lihat Penuh
                                        </button>
                                        <button
                                            onClick={handleDeleteOrgChart}
                                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Belum ada gambar struktur organisasi
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Upload gambar untuk ditampilkan di laporan
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                id="orgChartUpload"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleOrgChartUpload}
                                className="hidden"
                                disabled={isUploadingOrgChart}
                            />
                            <label
                                htmlFor="orgChartUpload"
                                className={`block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center cursor-pointer ${isUploadingOrgChart ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUploadingOrgChart ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Uploading...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Upload size={18} />
                                        {orgChartPreview ? 'Ganti Gambar' : 'Upload Gambar'}
                                    </span>
                                )}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Format: PNG, JPG (Max 5MB)
                            </p>
                        </div>
                    </div>

                    {/* Generate Salary */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
                        <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                            <DollarSign size={18} />
                            Generate Gaji ke Keuangan
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                            Generate data pengeluaran gaji karyawan untuk bulan ini ke manajemen keuangan.
                        </p>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Gaji Aktif:</span>
                                <span className="font-bold text-green-700 dark:text-green-300">
                                    Rp {formatCurrency(calculatedStatistics.total_salary || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-gray-600 dark:text-gray-400">Karyawan Aktif:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {calculatedStatistics.active_count || 0} orang
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSalaryModal(true)}
                            disabled={calculatedStatistics.active_count === 0}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <DollarSign size={18} />
                            Generate Gaji
                        </button>
                    </div>
                </div>
            )}

            {/* Generate Salary Modal */}
            {showSalaryModal && (
                <GenerateSalaryModal
                    isOpen={showSalaryModal}
                    onClose={() => setShowSalaryModal(false)}
                    businessBackgroundId={selectedBusiness !== 'all' ? selectedBusiness : null}
                    userId={JSON.parse(localStorage.getItem('user'))?.id}
                    onSuccess={() => {
                        setShowSalaryModal(false);
                        if (onRetry) onRetry();
                    }}
                />
            )}

            {/* FILTER SECTION - Horizontal konsisten */}
            {(teams.length > 0 || uniqueBusinesses.length > 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={16} />
                            Filter Berdasarkan Bisnis:
                        </h3>
                        {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 w-full sm:w-auto text-left sm:text-center"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* Tombol Semua Bisnis */}
                        <button
                            onClick={() => handleBusinessFilterSelect('all')}
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
                                {teams.length}
                            </span>
                        </button>

                        {/* Tombol untuk setiap bisnis */}
                        {uniqueBusinesses.map(business => (
                            <button
                                key={business.id}
                                onClick={() => handleBusinessFilterSelect(business.id)}
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
                                    {teams.filter(t => t.business_background?.id === business.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedStatus === 'all'
                                    ? 'bg-purple-500 border-purple-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <User size={14} />
                            <span>Semua Status</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedStatus === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {teams.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus('draft')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedStatus === 'draft'
                                    ? 'bg-yellow-500 border-yellow-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <User size={14} />
                            <span>Draft</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedStatus === 'draft'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {teams.filter(t => t.status === 'draft').length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus('active')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${selectedStatus === 'active'
                                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <User size={14} />
                            <span>Aktif</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedStatus === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                {teams.filter(t => t.status === 'active').length}
                            </span>
                        </button>
                    </div>

                    {/* Filter Info */}
                    {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                                    <Building size={16} />
                                    <span>
                                        Menampilkan {filteredTeams.length} dari {teams.length} anggota tim
                                        {selectedBusiness !== 'all' && (
                                            <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                        )}
                                        {selectedStatus !== 'all' && (
                                            <span> - Status: <strong>
                                                {selectedStatus === 'draft' ? 'Draft' : 'Aktif'}
                                            </strong></span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CARD VIEW */}
            {teams.length === 0 ? (
                <div className="text-center py-12">
                    <Users size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada struktur tim</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan menambahkan anggota tim pertama Anda</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                        Tambah Anggota Pertama
                    </button>
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="text-center py-12">
                    <Building size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada anggota tim yang sesuai</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Tidak ditemukan anggota tim untuk filter yang dipilih</p>
                    <button
                        onClick={resetFilters}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                    >
                        Reset Filter
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => {
                            const businessInfo = getBusinessInfo(team);

                            return (
                                <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {team.photo_url ? (
                                                <img
                                                    src={team.photo_url}
                                                    alt={team.member_name}
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                                    <User className="text-indigo-600 dark:text-indigo-400" size={24} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {team.member_name}
                                                </h3>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                                        {businessInfo.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(team.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        <div className="flex items-start gap-2">
                                            <Briefcase size={16} className="mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{team.position}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Users size={16} className="mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{team.team_category}</span>
                                        </div>
                                        {team.experience && (
                                            <div className="flex items-start gap-2">
                                                <GraduationCap size={16} className="mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{team.experience.substring(0, 80)}...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {businessInfo.name}
                                        </div>
                                        {getStatusBadge(team.status)}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onView(team)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={14} />
                                            <span className="hidden xs:inline">Lihat</span>
                                        </button>
                                        <button
                                            onClick={() => onEdit(team)}
                                            className="flex-1 bg-yellow-600 text-white py-2 px-2 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1"
                                            title="Edit"
                                        >
                                            <Edit3 size={14} />
                                            <span className="hidden xs:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(team.id, team.member_name)}
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
                        Menampilkan {filteredTeams.length} dari {teams.length} anggota tim
                        {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                            <span>
                                {selectedBusiness !== 'all' && (
                                    <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                )}
                                {selectedStatus !== 'all' && (
                                    <span> - Status: <strong>
                                        {selectedStatus === 'draft' ? 'Draft' : 'Aktif'}
                                    </strong></span>
                                )}
                            </span>
                        )}
                    </div>
                </>
            )}

            {/* ORG CHART VIEW MODAL */}
            {showOrgChartModal && orgChartPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowOrgChartModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Image size={20} />
                                Struktur Organisasi
                            </h3>
                            <button
                                onClick={() => setShowOrgChartModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Image Content */}
                        <div className="p-6">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                                <img
                                    src={orgChartPreview}
                                    alt="Organization Chart Full View"
                                    className="max-w-full h-auto rounded-lg"
                                    style={{ maxHeight: 'calc(90vh - 200px)' }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                            <a
                                href={orgChartPreview}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Upload size={16} className="rotate-180" />
                                Download
                            </a>
                            <button
                                onClick={() => setShowOrgChartModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamStructureList;