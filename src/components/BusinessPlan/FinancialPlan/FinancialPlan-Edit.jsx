import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import FinancialPlanForm from './FinancialPlan-Form';
import { financialPlanApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';

const FinancialPlanEdit = ({ plan, onBack, onSuccess }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

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

    // Fetch business backgrounds untuk dropdown
    const fetchBusinesses = async () => {
        try {
            setIsLoadingBusinesses(true);
            const response = await financialPlanApi.getBusinesses({ user_id: user?.id });
            
            if (response.data.status === 'success') {
                setBusinesses(response.data.data || []);
            } else {
                throw new Error('Failed to fetch business backgrounds');
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
            toast.error('Gagal memuat data bisnis');
        } finally {
            setIsLoadingBusinesses(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, [user]);

    useEffect(() => {
        if (plan) {
            setFormData({
                plan_name: plan.plan_name || '',
                business_background_id: plan.business_background_id || '',
                capital_sources: plan.capital_sources || [],
                initial_capex: plan.initial_capex || [],
                monthly_opex: plan.monthly_opex || [],
                sales_projections: plan.sales_projections || [],
                cash_flow_simulation: plan.cash_flow_simulation || [],
                tax_rate: plan.tax_rate || 10,
                interest_expense: plan.interest_expense || 0,
                plan_duration_months: plan.plan_duration_months || 12,
                notes: plan.notes || '',
                status: plan.status || 'draft'
            });
        }
    }, [plan]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e, submitData) => {
        e.preventDefault();
        
        // Validasi dasar
        if (!submitData.plan_name?.trim()) {
            toast.error('Nama rencana keuangan wajib diisi');
            return;
        }

        if (!submitData.business_background_id) {
            toast.error('Pilih bisnis terlebih dahulu');
            return;
        }

        setIsLoading(true);

        try {
            const submitDataWithUser = {
                ...submitData,
                user_id: user.id
            };

            console.log('Updating financial plan data:', submitDataWithUser);
            const response = await financialPlanApi.update(plan.id, submitDataWithUser);

            if (response.data.status === 'success') {
                toast.success('Rencana keuangan berhasil diperbarui!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error updating financial plan:', error);
            
            let errorMessage = 'Terjadi kesalahan saat memperbarui rencana keuangan';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!plan) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <FinancialPlanForm
            title="Edit Rencana Keuangan"
            subtitle="Perbarui informasi rencana keuangan Anda"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Perbarui Rencana"
            submitButtonIcon={<Save size={16} />}
            mode="edit"
        />
    );
};

export default FinancialPlanEdit;