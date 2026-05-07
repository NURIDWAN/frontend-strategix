import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FinancialPlanForm from './FinancialPlan-Form';
import { financialPlanApi } from '../../../services/businessPlan';
import { useAuth } from '../../../contexts/AuthContext';

const FinancialPlanCreate = ({ onBack, onSuccess }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [formData, setFormData] = useState({
        plan_name: '',
        business_background_id: '',
        capital_sources: [],
        initial_capex: [],
        monthly_opex: [],
        sales_projections: [],
        cash_flow_simulation: [],
        tax_rate: 10,
        interest_expense: 0,
        plan_duration_months: 12,
        notes: '',
        status: 'draft'
    });

    // Load businesses
    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            setIsLoadingBusinesses(true);
            const response = await financialPlanApi.getBusinesses({ user_id: user?.id });
            
            if (response.data && response.data.status === 'success') {
                setBusinesses(response.data.data || []);
            } else {
                setBusinesses([]);
            }
        } catch (error) {
            console.error('Error loading businesses:', error);
            
            if (error.response?.status === 401) {
                toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
            } else {
                toast.error('Gagal memuat data bisnis');
            }
            setBusinesses([]);
        } finally {
            setIsLoadingBusinesses(false);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e, submitData) => {
        e.preventDefault();
        
        // Validasi dasar
        if (!submitData.plan_name?.trim()) {
            toast.error('Nama rencana wajib diisi');
            return;
        }

        if (!submitData.business_background_id) {
            toast.error('Pilih bisnis terlebih dahulu');
            return;
        }

        if (!user?.id) {
            toast.error('User tidak ditemukan. Silakan login ulang.');
            return;
        }

        setIsLoading(true);

        try {
            // Format data
            const finalData = {
                user_id: user.id,
                business_background_id: submitData.business_background_id,
                plan_name: submitData.plan_name.trim(),
                capital_sources: Array.isArray(submitData.capital_sources) ? 
                    submitData.capital_sources.filter(source => source.source && source.amount > 0) : [],
                initial_capex: Array.isArray(submitData.initial_capex) ? 
                    submitData.initial_capex.filter(item => item.category && item.amount > 0) : [],
                monthly_opex: Array.isArray(submitData.monthly_opex) ? 
                    submitData.monthly_opex.filter(item => item.category && item.amount > 0) : [],
                sales_projections: Array.isArray(submitData.sales_projections) ? 
                    submitData.sales_projections.filter(item => item.product && item.price > 0 && item.volume > 0) : [],
                cash_flow_simulation: Array.isArray(submitData.cash_flow_simulation) ? 
                    submitData.cash_flow_simulation.filter(item => 
                        item.date && item.category && item.description && item.amount > 0
                    ) : [],
                tax_rate: submitData.tax_rate || 10,
                interest_expense: submitData.interest_expense || 0,
                plan_duration_months: submitData.plan_duration_months || 12,
                notes: submitData.notes || '',
                status: submitData.status || 'draft'
            };

            const response = await financialPlanApi.create(finalData);
            
            if (response.data.status === 'success') {
                toast.success('Rencana keuangan berhasil dibuat!');
                // FIX: Panggil onSuccess untuk kembali ke list dan refresh data
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Gagal membuat rencana keuangan');
            }
        } catch (error) {
            console.error('Error creating financial plan:', error);
            
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach(errorMessages => {
                    errorMessages.forEach(message => {
                        toast.error(message);
                    });
                });
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.request) {
                toast.error('Tidak ada respon dari server. Periksa koneksi internet.');
            } else {
                toast.error('Terjadi kesalahan: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // FIX: Langsung gunakan onBack dari props tanpa wrapper function
    // atau buat wrapper yang sederhana
    const handleBack = () => {
        console.log('🔙 Back to financial plans list via parent handler');
        onBack(); // Langsung panggil onBack dari parent
    };

    return (
        <FinancialPlanForm
            title="Buat Rencana Keuangan Baru"
            subtitle="Isi form berikut untuk membuat rencana keuangan bisnis Anda"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={handleBack} // FIX: Gunakan handleBack yang memanggil onBack dari parent
            submitButtonText="Buat Rencana"
            submitButtonIcon={<span>💾</span>}
            mode="create"
        />
    );
};

export default FinancialPlanCreate;