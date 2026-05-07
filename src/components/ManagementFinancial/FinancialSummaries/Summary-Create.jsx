import { useState, useEffect } from 'react';
import { Save, Building, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import SummaryForm from './Summary-Form';
import { managementFinancialApi } from '../../../services/managementFinancial';
import { backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const SummaryCreate = ({ onBack, onSuccess, selectedYear }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [financialCategories, setFinancialCategories] = useState([]);

    const [formData, setFormData] = useState({
        month: '',
        year: selectedYear,
        total_income: '',
        total_expense: '',
        gross_profit: '',
        net_profit: '',
        cash_position: '',
        income_breakdown: {},
        expense_breakdown: {},
        notes: ''
    });

    // Load businesses dan financial categories
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingBusinesses(true);
                const user = JSON.parse(localStorage.getItem('user'));

                if (!user?.id) {
                    throw new Error('User not found');
                }

                // Load businesses dari BusinessController
                console.log('Loading businesses...');
                const businessResponse = await backgroundApi.getAll();
                console.log('Business response:', businessResponse);

                if (businessResponse.data?.status === 'success') {
                    const userBusinesses = businessResponse.data.data || [];
                    setBusinesses(userBusinesses);

                    if (userBusinesses.length > 0) {
                        setSelectedBusiness(userBusinesses[0].id);
                    }
                }

                // Load financial categories dari ManagementFinancialController
                console.log('Loading financial categories...');
                const categoriesResponse = await managementFinancialApi.categories.getAll();
                console.log('Categories response:', categoriesResponse);

                if (categoriesResponse.data?.status === 'success') {
                    setFinancialCategories(categoriesResponse.data.data || []);
                }

            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Gagal memuat data bisnis dan kategori');
            } finally {
                setIsLoadingBusinesses(false);
            }
        };

        loadData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBusinessChange = (e) => {
        setSelectedBusiness(e.target.value);
    };

    const handleCategoryBreakdownChange = (type, categoryId, value) => {
        setFormData(prev => ({
            ...prev,
            [`${type}_breakdown`]: {
                ...prev[`${type}_breakdown`],
                [categoryId]: parseFloat(value) || 0
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBusiness) {
            toast.error('Pilih bisnis terlebih dahulu');
            return;
        }

        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user || !user.id) {
                throw new Error('User data not found. Please login again.');
            }

            // Calculate profits automatically
            const totalIncome = parseFloat(formData.total_income) || 0;
            const totalExpense = parseFloat(formData.total_expense) || 0;
            const grossProfit = totalIncome - totalExpense;
            const netProfit = grossProfit; // Same as gross for simplicity
            const cashPosition = parseFloat(formData.cash_position) || 0;

            // Prepare breakdown data
            const incomeBreakdown = Object.keys(formData.income_breakdown).length > 0
                ? formData.income_breakdown
                : null;

            const expenseBreakdown = Object.keys(formData.expense_breakdown).length > 0
                ? formData.expense_breakdown
                : null;

            const submitData = {
                user_id: user.id,
                business_background_id: parseInt(selectedBusiness),
                month: parseInt(formData.month),
                year: parseInt(formData.year),
                total_income: totalIncome,
                total_expense: totalExpense,
                gross_profit: grossProfit,
                net_profit: netProfit,
                cash_position: cashPosition,
                income_breakdown: incomeBreakdown,
                expense_breakdown: expenseBreakdown,
                notes: formData.notes
            };

            console.log('Submitting financial summary:', submitData);
            const response = await managementFinancialApi.summaries.create(submitData);

            if (response.data.status === 'success') {
                toast.success('Ringkasan keuangan berhasil dibuat!', {
                    position: "top-right",
                    autoClose: 3000,
                });
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error creating financial summary:', error);

            let errorMessage = 'Terjadi kesalahan saat membuat ringkasan keuangan';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Format validation errors
                const errors = error.response.data.errors;
                if (typeof errors === 'object') {
                    const errorList = Object.values(errors).flat();
                    errorMessage = errorList.join(', ');
                } else {
                    errorMessage = errors;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Filter categories by type
    const incomeCategories = financialCategories.filter(cat => cat.type === 'income');
    const expenseCategories = financialCategories.filter(cat => cat.type === 'expense');

    if (isLoadingBusinesses) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Memuat data bisnis dan kategori...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header Section */}
                <div className="mb-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Dashboard
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Ringkasan Keuangan</h1>
                        <p className="text-gray-600 dark:text-gray-400">Buat ringkasan keuangan bulanan baru</p>
                    </div>
                </div>

                {/* Business Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Pilih Bisnis
                    </h3>

                    {businesses.length === 0 ? (
                        <div className="text-center py-8">
                            <Building size={48} className="mx-auto text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Belum ada bisnis
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Anda perlu membuat bisnis terlebih dahulu sebelum membuat ringkasan keuangan
                            </p>
                            <button
                                onClick={() => window.location.href = (import.meta.env.BASE_URL || '/') + 'dashboard'}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Buat Bisnis
                            </button>
                        </div>
                    ) : (
                        <>
                            <select
                                value={selectedBusiness}
                                onChange={handleBusinessChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Bisnis</option>
                                {businesses.map(business => (
                                    <option key={business.id} value={business.id}>
                                        {business.name} - {business.category}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Pilih bisnis yang akan dibuatkan ringkasan keuangan
                            </p>
                        </>
                    )}
                </div>

                {/* Main Form */}
                {businesses.length > 0 && selectedBusiness && (
                    <SummaryForm
                        title="Tambah Ringkasan Keuangan"
                        subtitle="Buat ringkasan keuangan bulanan baru"
                        formData={formData}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                        onNumberChange={handleNumberChange}
                        onSubmit={handleSubmit}
                        onBack={onBack}
                        submitButtonText="Simpan Ringkasan"
                        submitButtonIcon={<Save size={16} />}
                        mode="create"
                        incomeCategories={incomeCategories}
                        expenseCategories={expenseCategories}
                        onCategoryBreakdownChange={handleCategoryBreakdownChange}
                    />
                )}
            </div>
        </div>
    );
};

export default SummaryCreate;