import { useState, useEffect } from 'react';
import TeamStructureList from './TeamStructure-List';
import TeamStructureCreate from './TeamStructure-Create';
import TeamStructureEdit from './TeamStructure-Edit';
import TeamStructureView from './TeamStructure-View';
import OrgChart from './OrgChart';
import { teamStructureApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';
import { BarChart3, List } from 'lucide-react';

const TeamStructure = ({ selectedBusiness = null }) => {
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [view, setView] = useState('list');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBusinessFilter, setSelectedBusinessFilter] = useState('all');
    const [showOrgChartBtn, setShowOrgChartBtn] = useState(false);

    // Fetch semua team structures
    const fetchTeams = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const user = JSON.parse(localStorage.getItem('user'));
            
            const response = await teamStructureApi.getAll({ 
                user_id: user?.id
            });

            if (response.data.status === 'success') {
                setTeams(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch team structures');
            }
        } catch (error) {
            let errorMessage = 'Gagal memuat data struktur tim';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            } else {
                errorMessage = error.message;
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler untuk business filter change
    const handleBusinessFilterChange = (businessId) => {
        setSelectedBusinessFilter(businessId);
        // Reset viewMode ke 'list' dan hide chart button jika user pilih 'all'
        if (businessId === 'all') {
            setViewMode('list');
            setShowOrgChartBtn(false);
        }
    };

    // Handler untuk show org chart
    const handleShowOrgChart = (businessId) => {
        setShowOrgChartBtn(true);
        setSelectedBusinessFilter(businessId);
    };

    // Filter teams berdasarkan selectedBusiness
    useEffect(() => {
        if (selectedBusiness?.id) {
            const filtered = teams.filter(team => 
                team.business_background_id === selectedBusiness.id
            );
            setFilteredTeams(filtered);
        } else {
            setFilteredTeams(teams);
        }
    }, [teams, selectedBusiness]);

    useEffect(() => {
        fetchTeams();
    }, []);

    // Handler functions
    const handleCreateNew = () => {
        setCurrentTeam(null);
        setView('create');
    };

    const handleView = (team) => {
        setCurrentTeam(team);
        setView('view');
    };

    const handleEdit = (team) => {
        setCurrentTeam(team);
        setView('edit');
    };

    const handleDelete = async (teamId) => {
        try {
            setError(null);
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await teamStructureApi.delete(teamId, user?.id);

            if (response.data.status === 'success') {
                toast.success('Struktur tim berhasil dihapus!');
                fetchTeams();
                setView('list');
            } else {
                throw new Error(response.data.message || 'Failed to delete team structure');
            }
        } catch (error) {
            let errorMessage = 'Terjadi kesalahan saat menghapus data struktur tim';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };

    const handleBackToList = () => {
        setView('list');
        setCurrentTeam(null);
        setError(null);
    };

    const handleCreateSuccess = () => {
        fetchTeams();
        setView('list');
    };

    const handleUpdateSuccess = () => {
        fetchTeams();
        setView('list');
    };

    const handleRetry = () => {
        fetchTeams();
    };

    // Render loading state
    if (isLoading && view === 'list') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Memuat data struktur tim...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error && view === 'list') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRetry}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Refresh Halaman
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render different views
    const renderView = () => {
        switch (view) {
            case 'list':
                return (
                    <>
                        {/* View toggle buttons */}
                        <div className="mb-6 flex gap-2">
                            <button
                                onClick={() => {
                                    console.log('Switching to list view');
                                    setViewMode('list');
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'list'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                <List size={18} />
                                List View
                            </button>
                            {/* Tombol Organization Chart hanya muncul ketika bisnis dipilih */}
                            {showOrgChartBtn && selectedBusinessFilter !== 'all' && (
                                <button
                                    onClick={() => {
                                        console.log('Switching to chart view');
                                        setViewMode('chart');
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                        viewMode === 'chart'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <BarChart3 size={18} />
                                    Organization Chart
                                </button>
                            )}
                        </div>

                        {/* Render based on view mode */}
                        {viewMode === 'list' ? (
                            <TeamStructureList
                                teams={filteredTeams}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onCreateNew={handleCreateNew}
                                isLoading={isLoading}
                                error={error}
                                onRetry={handleRetry}
                                onBusinessFilterChange={handleBusinessFilterChange}
                                onShowOrgChart={handleShowOrgChart}
                            />
                        ) : (
                            <div className="relative">
                                {/* Back Button di Chart View */}
                                <div className="mb-6 relative z-20">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                        ← Kembali ke List View
                                    </button>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative z-10">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Organization Structure
                                    </h3>
                                    <OrgChart teamMembers={filteredTeams} />
                                </div>
                            </div>
                        )}
                    </>
                );
            case 'create':
                return (
                    <TeamStructureCreate
                        onBack={handleBackToList}
                        onSuccess={handleCreateSuccess}
                    />
                );
            case 'edit':
                return (
                    <TeamStructureEdit
                        team={currentTeam}
                        onBack={handleBackToList}
                        onSuccess={handleUpdateSuccess}
                    />
                );
            case 'view':
                return (
                    <TeamStructureView
                        team={currentTeam}
                        onBack={handleBackToList}
                        onEdit={handleEdit}
                    />
                );
            default:
                return (
                    <TeamStructureList
                        teams={filteredTeams}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreateNew={handleCreateNew}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
                        onBusinessFilterChange={handleBusinessFilterChange}
                        onShowOrgChart={handleShowOrgChart}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderView()}
            </div>
        </div>
    );
};

export default TeamStructure;