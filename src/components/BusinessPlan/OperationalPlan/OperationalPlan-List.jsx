import { Workflow, Building, Calendar, Plus, Eye, Edit3, Trash2, Loader, RefreshCw, X, MapPin, Clock, Users, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const OperationalPlanList = ({
    plans,
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
    const [planToDelete, setPlanToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const handleDeleteClick = (planId, planTitle) => {
        setPlanToDelete({ id: planId, title: planTitle });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(planToDelete.id);
            toast.success('Rencana operasional berhasil dihapus!');
        } catch (error) {
            toast.error('Gagal menghapus rencana operasional!');
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
        const businesses = plans
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

        // Remove duplicates
        return businesses.filter((business, index, self) =>
            index === self.findIndex(b => b.id === business.id)
        );
    };

    // Filter plans berdasarkan criteria
    const filteredPlans = plans.filter(plan => {
        // Filter business
        if (selectedBusiness !== 'all' && plan.business_background?.id !== selectedBusiness) {
            return false;
        }
        
        // Filter status
        if (selectedStatus !== 'all' && plan.status !== selectedStatus) {
            return false;
        }
        
        return true;
    });

    const uniqueBusinesses = getUniqueBusinesses();

    // Helper function untuk mengakses business background
    const getBusinessInfo = (plan) => {
        if (!plan.business_background) {
            return {
                name: `Bisnis (ID: ${plan.business_background_id})`,
                category: 'Tidak ada kategori'
            };
        }

        return {
            name: plan.business_background.name || `Bisnis (ID: ${plan.business_background_id})`,
            category: plan.business_background.category || 'Tidak ada kategori'
        };
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Draft' },
            completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Selesai' }
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Reset semua filter
    const resetFilters = () => {
        setSelectedBusiness('all');
        setSelectedStatus('all');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rencana Operasional</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola rencana operasional bisnis Anda</p>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rencana Operasional</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola rencana operasional bisnis Anda</p>
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
                                Apakah Anda yakin ingin menghapus rencana operasional ini?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <strong>"{planToDelete?.title}"</strong>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rencana Operasional</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola rencana operasional bisnis Anda dengan workflow diagram</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Tambah Rencana
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
                            <Workflow className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.completed_count || 0}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.draft_count || 0}</p>
                            </div>
                            <Users className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Dengan Diagram</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.with_diagram_count || 0}</p>
                            </div>
                            <Workflow className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* FILTER SECTION - Horizontal seperti MarketAnalysisList */}
            {(plans.length > 0 || uniqueBusinesses.length > 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={16} />
                            Filter Berdasarkan Bisnis:
                        </h3>
                        {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 w-full sm:w-auto text-left sm:text-center"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
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
                                {plans.length}
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
                                    {plans.filter(p => p.business_background?.id === business.id).length}
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
                            <Calendar size={14} />
                            <span>Semua Status</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'all' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {plans.length}
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
                            <Calendar size={14} />
                            <span>Draft</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'draft' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {plans.filter(p => p.status === 'draft').length}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus('completed')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                selectedStatus === 'completed'
                                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Calendar size={14} />
                            <span>Selesai</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedStatus === 'completed' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                                {plans.filter(p => p.status === 'completed').length}
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
                                        Menampilkan {filteredPlans.length} dari {plans.length} rencana
                                        {selectedBusiness !== 'all' && (
                                            <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                        )}
                                        {selectedStatus !== 'all' && (
                                            <span> - Status: <strong>
                                                {selectedStatus === 'draft' ? 'Draft' : 'Selesai'}
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
            {plans.length === 0 ? (
                <div className="text-center py-12">
                    <Workflow size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada rencana operasional</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan menambahkan rencana operasional pertama Anda dengan fitur workflow diagram</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                        Tambah Rencana Pertama
                    </button>
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="text-center py-12">
                    <Building size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada rencana yang sesuai</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Tidak ditemukan rencana operasional untuk filter yang dipilih</p>
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
                        {filteredPlans.map((plan) => {
                            const businessInfo = getBusinessInfo(plan);
                            const totalEmployees = plan.employees ? plan.employees.reduce((sum, emp) => sum + (emp.quantity || 0), 0) : 0;
                            const operationalDays = plan.operational_hours ? plan.operational_hours.length : 0;
                            const totalSuppliers = plan.suppliers ? plan.suppliers.length : 0;

                            return (
                                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center border border-green-200 dark:border-green-800">
                                                <Workflow className="text-green-600 dark:text-green-400" size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {businessInfo.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                                        {businessInfo.category}
                                                    </span>
                                                    {/* WORKFLOW DIAGRAM BADGE */}
                                                    {plan.workflow_diagram && (
                                                        <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 flex items-center gap-1">
                                                            <Workflow size={10} />
                                                            Diagram
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(plan.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{plan.business_location}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Users size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>{totalEmployees} karyawan • {plan.employees ? plan.employees.length : 0} posisi</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>Operasional {operationalDays} hari</span>
                                        </div>
                                        {totalSuppliers > 0 && (
                                            <div className="flex items-start gap-2">
                                                <Truck size={16} className="mt-0.5 flex-shrink-0" />
                                                <span>{totalSuppliers} supplier</span>
                                            </div>
                                        )}
                                    </div>

                                    {plan.daily_workflow && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                                            <strong>Alur Kerja:</strong> {plan.daily_workflow.substring(0, 100)}...
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            Tipe: {plan.location_type}
                                        </div>
                                        {getStatusBadge(plan.status)}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onView(plan)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={14} />
                                            <span className="hidden xs:inline">Lihat</span>
                                        </button>
                                        <button
                                            onClick={() => onEdit(plan)}
                                            className="flex-1 bg-yellow-600 text-white py-2 px-2 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1"
                                            title="Edit"
                                        >
                                            <Edit3 size={14} />
                                            <span className="hidden xs:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(plan.id, businessInfo.name)}
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
                        Menampilkan {filteredPlans.length} dari {plans.length} rencana operasional
                        {(selectedBusiness !== 'all' || selectedStatus !== 'all') && (
                            <span>
                                {selectedBusiness !== 'all' && (
                                    <span> untuk <strong>{uniqueBusinesses.find(b => b.id === selectedBusiness)?.name}</strong></span>
                                )}
                                {selectedStatus !== 'all' && (
                                    <span> - Status: <strong>
                                        {selectedStatus === 'draft' ? 'Draft' : 'Selesai'}
                                    </strong></span>
                                )}
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default OperationalPlanList;