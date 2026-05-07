import { useState, useEffect } from 'react';
import MarketAnalysisList from './MarketAnalysis-List';
import MarketAnalysisCreate from './MarketAnalysis-Create';
import MarketAnalysisEdit from './MarketAnalysis-Edit';
import MarketAnalysisView from './MarketAnalysis-View';
import { marketAnalysisApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const MarketAnalysis = () => {
    const [analyses, setAnalyses] = useState([]);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch semua market analyses
    const fetchAnalyses = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const user = JSON.parse(localStorage.getItem('user'));
            
            const response = await marketAnalysisApi.getAll({ 
                user_id: user?.id
            });

            if (response.data.status === 'success') {
                setAnalyses(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch market analyses');
            }
        } catch (error) {
            let errorMessage = 'Gagal memuat data analisis pasar';
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

    useEffect(() => {
        fetchAnalyses();
    }, []);

    // Handler functions
    const handleCreateNew = () => {
        setCurrentAnalysis(null);
        setView('create');
    };

    const handleView = (analysis) => {
        setCurrentAnalysis(analysis);
        setView('view');
    };

    const handleEdit = (analysis) => {
        setCurrentAnalysis(analysis);
        setView('edit');
    };

    const handleDelete = async (analysisId) => {
        try {
            setError(null);
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await marketAnalysisApi.delete(analysisId, user?.id);

            if (response.data.status === 'success') {
                toast.success('Analisis pasar berhasil dihapus!');
                fetchAnalyses();
                setView('list');
            } else {
                throw new Error(response.data.message || 'Failed to delete market analysis');
            }
        } catch (error) {
            let errorMessage = 'Terjadi kesalahan saat menghapus data analisis pasar';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };

    const handleBackToList = () => {
        setView('list');
        setCurrentAnalysis(null);
        setError(null);
    };

    const handleCreateSuccess = () => {
        fetchAnalyses();
        setView('list');
    };

    const handleUpdateSuccess = () => {
        fetchAnalyses();
        setView('list');
    };

    const handleRetry = () => {
        fetchAnalyses();
    };

    // Render loading state
    if (isLoading && view === 'list') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Memuat data analisis pasar...</p>
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
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
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
                    <MarketAnalysisList
                        analyses={analyses}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreateNew={handleCreateNew}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
                    />
                );
            case 'create':
                return (
                    <MarketAnalysisCreate
                        onBack={handleBackToList}
                        onSuccess={handleCreateSuccess}
                    />
                );
            case 'edit':
                return (
                    <MarketAnalysisEdit
                        analysis={currentAnalysis}
                        onBack={handleBackToList}
                        onSuccess={handleUpdateSuccess}
                    />
                );
            case 'view':
                return (
                    <MarketAnalysisView
                        analysis={currentAnalysis}
                        onBack={handleBackToList}
                        onEdit={handleEdit}
                    />
                );
            default:
                return (
                    <MarketAnalysisList
                        analyses={analyses}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreateNew={handleCreateNew}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
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

export default MarketAnalysis;