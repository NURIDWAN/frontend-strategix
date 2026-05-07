import { useState, useEffect } from 'react';
import ProductServiceList from './ProductService-List';
import ProductServiceCreate from './ProductService-Create';
import ProductServiceEdit from './ProductService-Edit';
import ProductServiceView from './ProductService-View';
import { productServiceApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const ProductService = () => {
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState(null);

    // Fetch semua produk/layanan
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const user = JSON.parse(localStorage.getItem('user'));

            const response = await productServiceApi.getAll({
                user_id: user?.id
            });

            if (response.data.status === 'success') {
                setProducts(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch products/services');
            }
        } catch (error) {
            let errorMessage = 'Gagal memuat data produk/layanan';
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

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user?.id) {
                console.warn('User ID not found for statistics');
                return;
            }

            const response = await productServiceApi.getStatistics({
                user_id: user.id
            });
            
            if (response.data.status === 'success') {
                setStatistics(response.data.data);
            } else {
                console.warn('Failed to fetch statistics:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            // Jangan tampilkan toast untuk error statistics, karena tidak critical
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchStatistics();
    }, []);

    // Handler functions
    const handleCreateNew = () => {
        setCurrentProduct(null);
        setView('create');
    };

    const handleView = (product) => {
        setCurrentProduct(product);
        setView('view');
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setView('edit');
    };

    const handleDelete = async (productId) => {
        try {
            setError(null);
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await productServiceApi.delete(productId, user?.id);

            if (response.data.status === 'success') {
                // ✅ Notif cukup sekali di sini
                toast.success('Produk/layanan berhasil dihapus!');
                await fetchProducts();
                await fetchStatistics(); // Refresh statistics setelah delete
                setView('list');
            } else {
                throw new Error(response.data.message || 'Gagal menghapus produk/layanan');
            }
        } catch (error) {
            let errorMessage = 'Terjadi kesalahan saat menghapus data produk/layanan';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        }
    };

    const handleBackToList = () => {
        setView('list');
        setCurrentProduct(null);
        setError(null);
    };

    const handleCreateSuccess = () => {
        fetchProducts();
        fetchStatistics(); // Refresh statistics setelah create
        setView('list');
    };

    const handleUpdateSuccess = () => {
        fetchProducts();
        fetchStatistics(); // Refresh statistics setelah update
        setView('list');
    };

    const handleRetry = () => {
        fetchProducts();
        fetchStatistics();
    };

    // Render loading state
    if (isLoading && view === 'list') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Memuat data produk/layanan...</p>
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <ProductServiceList
                        products={products}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreateNew={handleCreateNew}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
                        statistics={statistics}
                    />
                );
            case 'create':
                return (
                    <ProductServiceCreate
                        onBack={handleBackToList}
                        onSuccess={handleCreateSuccess}
                    />
                );
            case 'edit':
                return (
                    <ProductServiceEdit
                        product={currentProduct}
                        onBack={handleBackToList}
                        onSuccess={handleUpdateSuccess}
                    />
                );
            case 'view':
                return (
                    <ProductServiceView
                        product={currentProduct}
                        onBack={handleBackToList}
                        onEdit={handleEdit}
                    />
                );
            default:
                return (
                    <ProductServiceList
                        products={products}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreateNew={handleCreateNew}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
                        statistics={statistics}
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

export default ProductService;