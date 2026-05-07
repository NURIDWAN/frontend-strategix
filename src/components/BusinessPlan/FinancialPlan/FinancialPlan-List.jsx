import { DollarSign, Building, Calendar, Plus, Eye, Edit3, Trash2, Loader, TrendingUp, TrendingDown, BarChart3, RefreshCw, X, Target, PieChart, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FinancialPlanDashboardCharts from './FinancialPlan-DashboardCharts';

const FinancialPlanList = ({
    plans,
    onView,
    onEdit,
    onDelete,
    onCreateNew,
    isLoading,
    error,
    onRetry
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [safePlans, setSafePlans] = useState([]);

    // Ensure plans is always an array
    useEffect(() => {
        if (Array.isArray(plans)) {
            setSafePlans(plans);
        } else if (plans && plans.data && Array.isArray(plans.data)) {
            setSafePlans(plans.data);
        } else if (plans && Array.isArray(plans.data?.data)) {
            setSafePlans(plans.data.data);
        } else {
            setSafePlans([]);
        }
    }, [plans]);

    const handleDeleteClick = (planId, planName) => {
        setPlanToDelete({ id: planId, name: planName });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(planToDelete.id);
            toast.success('Rencana keuangan berhasil dihapus!');
        } catch (error) {
            toast.error('Gagal menghapus rencana keuangan!');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setPlanToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setPlanToDelete(null);
    };

    // Get unique businesses for filter
    const getUniqueBusinesses = () => {
        const businesses = safePlans
            .filter(plan => {
                return plan.business_background && 
                       plan.business_background.id && 
                       plan.business_background.name;
            })
            .map(plan => ({
                id: plan.business_background.id,
                name: plan.business_background.name,
                category: plan.business_background.category || 'Tidak ada kategori'
            }));
        
        return businesses.filter((business, index, self) => 
            index === self.findIndex(b => b.id === business.id)
        );
    };

    const filteredPlans = safePlans.filter(plan => {
        const businessMatch = selectedBusiness === 'all' || 
            plan.business_background?.id === selectedBusiness;
        const statusMatch = selectedStatus === 'all' || 
            plan.status === selectedStatus;
        
        return businessMatch && statusMatch;
    });

    const uniqueBusinesses = getUniqueBusinesses();

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Draft' },
            active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Aktif' },
            completed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', label: 'Selesai' }
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getFeasibilityBadge = (status) => {
        const feasibilityConfig = {
            'Layak': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
            'Cukup Layak': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
            'Tidak Layak': { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
        };

        const config = feasibilityConfig[status] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {status}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'Rp 0';
        
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculate safe averages and totals
    const calculateAverageRoi = () => {
        if (safePlans.length === 0) return 0;
        const totalRoi = safePlans.reduce((acc, plan) => acc + (plan.roi_percentage || 0), 0);
        return Math.round(totalRoi / safePlans.length);
    };

    const countLayakPlans = () => {
        return safePlans.filter(p => p.feasibility_status === 'Layak').length;
    };

    const countTidakLayakPlans = () => {
        return safePlans.filter(p => p.feasibility_status === 'Tidak Layak').length;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rencana Keuangan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola rencana dan analisis keuangan usaha</p>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rencana Keuangan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola rencana dan analisis keuangan usaha</p>
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
            {/* Delete Confirmation Modal */}
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
                                Apakah Anda yakin ingin menghapus rencana keuangan ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{planToDelete?.name}"</strong>
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

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rencana Keuangan</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola rencana dan analisis keuangan usaha</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Buat Rencana Baru
                </button>
            </div>

            {/* Quick Stats */}
            {safePlans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rencana</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{safePlans.length}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata ROI</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {calculateAverageRoi()}%
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Layak</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {countLayakPlans()}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tidak Layak</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {countTidakLayakPlans()}
                                </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Charts */}
            {safePlans.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <FinancialPlanDashboardCharts plans={safePlans} />
                </div>
            )}

            {/* FILTER BUTTONS */}
            {safePlans.length > 0 && uniqueBusinesses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={16} />
                            Filter Berdasarkan Bisnis:
                        </h3>
                        {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSelectedBusiness('all');
                                    setSelectedStatus('all');
                                }}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 w-full sm:w-auto text-left sm:text-center"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
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
                                {safePlans.length}
                            </span>
                        </button>

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
                                    {safePlans.filter(p => p.business_background?.id === business.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                selectedStatus === 'all'
                                    ? 'bg-purple-500 border-purple-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span>Semua Status</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'all' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {safePlans.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus('draft')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                selectedStatus === 'draft'
                                    ? 'bg-yellow-500 border-yellow-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span>Draft</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'draft' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {safePlans.filter(p => p.status === 'draft').length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus('active')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                selectedStatus === 'active'
                                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span>Aktif</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'active' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {safePlans.filter(p => p.status === 'active').length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus('completed')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                selectedStatus === 'completed'
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span>Selesai</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'completed' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {safePlans.filter(p => p.status === 'completed').length}
                            </span>
                        </button>
                    </div>

                    {/* Filter Info */}
                    {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                                    <Building size={16} />
                                    <span>
                                        Menampilkan {filteredPlans.length} dari {safePlans.length} rencana keuangan
                                        {selectedBusiness !== 'all' && (
                                            <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                        )}
                                        {selectedStatus !== 'all' && (
                                            <span> dengan status <strong>
                                                {selectedStatus === 'draft' ? 'Draft' : 
                                                 selectedStatus === 'active' ? 'Aktif' : 'Selesai'}
                                            </strong></span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Plans Grid - Card Layout dengan tombol seperti BackgroundList */}
            {safePlans.length === 0 ? (
                <div className="text-center py-12">
                    <DollarSign size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada rencana keuangan</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan membuat rencana keuangan pertama Anda</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                        Buat Rencana Pertama
                    </button>
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="text-center py-12">
                    <Building size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada rencana keuangan yang sesuai filter</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Tidak ditemukan rencana keuangan untuk filter yang dipilih</p>
                    <button
                        onClick={() => {
                            setSelectedBusiness('all');
                            setSelectedStatus('all');
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Lihat Semua Rencana
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => (
                        <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                            {/* Header dengan judul dan badges */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {plan.plan_name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getStatusBadge(plan.status)}
                                        {getFeasibilityBadge(plan.feasibility_status)}
                                    </div>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <Building size={14} />
                                <span className="font-medium">{plan.business_background?.name || 'N/A'}</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {plan.business_background?.category || 'Tidak ada kategori'}
                                </span>
                            </div>

                            {/* Financial Metrics Grid - TETAP SAMA */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                                    <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Modal Awal</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(plan.total_initial_capital)}
                                    </p>
                                </div>
                                
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                                    <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Pendapatan/Bln</p>
                                    <p className="text-sm font-bold text-green-600">
                                        {formatCurrency(plan.total_monthly_income)}
                                    </p>
                                </div>
                                
                                <div className={`rounded-lg p-3 text-center ${
                                    (plan.net_profit || 0) >= 0 
                                        ? 'bg-green-50 dark:bg-green-900/20' 
                                        : 'bg-red-50 dark:bg-red-900/20'
                                }`}>
                                    <Target className={`w-6 h-6 mx-auto mb-1 ${
                                        (plan.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`} />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Laba Bersih</p>
                                    <p className={`text-sm font-bold ${
                                        (plan.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(plan.net_profit)}
                                    </p>
                                </div>
                                
                                <div className={`rounded-lg p-3 text-center ${
                                    (plan.roi_percentage || 0) >= 15 
                                        ? 'bg-green-50 dark:bg-green-900/20' 
                                        : (plan.roi_percentage || 0) >= 5 
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                                        : 'bg-red-50 dark:bg-red-900/20'
                                }`}>
                                    <PieChart className={`w-6 h-6 mx-auto mb-1 ${
                                        (plan.roi_percentage || 0) >= 15 
                                            ? 'text-green-600' 
                                            : (plan.roi_percentage || 0) >= 5 
                                            ? 'text-yellow-600' 
                                            : 'text-red-600'
                                    }`} />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">ROI</p>
                                    <p className={`text-sm font-bold ${
                                        (plan.roi_percentage || 0) >= 15 
                                            ? 'text-green-600' 
                                            : (plan.roi_percentage || 0) >= 5 
                                            ? 'text-yellow-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {plan.roi_percentage || 0}%
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>Dibuat: {formatDate(plan.created_at)}</span>
                                </div>
                                {plan.updated_at && (
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>Diupdate: {formatDate(plan.updated_at)}</span>
                                    </div>
                                )}
                            </div>

                            {/* TOMBOL AKSI - SEPERTI BACKGROUNDLIST */}
                            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    onClick={() => onView(plan)}
                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Eye size={16} />
                                    Lihat
                                </button>
                                <button
                                    onClick={() => onEdit(plan)}
                                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Edit3 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(plan.id, plan.plan_name)}
                                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={16} />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results Info */}
            {filteredPlans.length > 0 && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan {filteredPlans.length} dari {safePlans.length} rencana keuangan
                    {selectedBusiness !== 'all' && (
                        <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                    )}
                    {selectedStatus !== 'all' && (
                        <span> dengan status <strong>
                            {selectedStatus === 'draft' ? 'Draft' : 
                             selectedStatus === 'active' ? 'Aktif' : 'Selesai'}
                        </strong></span>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinancialPlanList;