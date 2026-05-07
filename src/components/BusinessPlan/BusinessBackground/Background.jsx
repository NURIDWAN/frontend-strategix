import { useState, useEffect } from 'react';
import BackgroundList from './Background-List';
import BackgroundCreate from './Background-Create';
import BackgroundEdit from './Background-Edit';
import BackgroundView from './Background-View';
import { backgroundApi } from '../../../services/businessPlan';

const Background = () => {
    const [businesses, setBusinesses] = useState([]);
    const [currentBusiness, setCurrentBusiness] = useState(null);
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch semua business backgrounds
    const fetchBusinesses = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('Fetching businesses using API...');
            const response = await backgroundApi.getAll(); // ← Pakai backgroundApi

            console.log('API Response:', response.data);

            if (response.data.status === 'success') {
                setBusinesses(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch businesses');
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);

            let errorMessage = 'Gagal memuat data bisnis';
            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            } else {
                // Something else happened
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    // Handler functions
    const handleCreateNew = () => {
        setCurrentBusiness(null);
        setView('create');
    };

    const handleView = (business) => {
        setCurrentBusiness(business);
        setView('view');
    };

    const handleEdit = (business) => {
        setCurrentBusiness(business);
        setView('edit');
    };

    const handleDelete = async (businessId) => {
        try {
            setError(null);
            const response = await backgroundApi.delete(businessId);

            if (response.data.status === 'success') {
                fetchBusinesses();
                setView('list');
            } else {
                throw new Error(response.data.message || 'Failed to delete business');
            }
        } catch (error) {
            console.error('Error deleting business:', error);
            let errorMessage = 'Terjadi kesalahan saat menghapus data bisnis';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            alert(errorMessage); 
        }
    };

    const handleBackToList = () => {
        setView('list');
        setCurrentBusiness(null);
        setError(null);
    };

    const handleCreateSuccess = () => {
        fetchBusinesses();
        setView('list');
    };

    const handleUpdateSuccess = () => {
        fetchBusinesses();
        setView('list');
    };

    const handleRetry = () => {
        fetchBusinesses();
    };

    // Render loading state
    if (isLoading && view === 'list') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Memuat data bisnis...</p>
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
                    <BackgroundList
                        businesses={businesses}
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
                    <BackgroundCreate
                        onBack={handleBackToList}
                        onSuccess={handleCreateSuccess}
                    />
                );
            case 'edit':
                return (
                    <BackgroundEdit
                        business={currentBusiness}
                        onBack={handleBackToList}
                        onSuccess={handleUpdateSuccess}
                    />
                );
            case 'view':
                return (
                    <BackgroundView
                        business={currentBusiness}
                        onBack={handleBackToList}
                        onEdit={handleEdit}
                    />
                );
            default:
                return (
                    <BackgroundList
                        businesses={businesses}
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderView()}
            </div>
        </div>
    );
};

export default Background;