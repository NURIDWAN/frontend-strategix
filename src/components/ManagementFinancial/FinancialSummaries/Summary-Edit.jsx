import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import SummaryForm from './Summary-Form';
import { managementFinancialApi } from '../../../services/managementFinancial';
import { toast } from 'react-toastify';

const SummaryEdit = ({ summary, onBack, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        month: '',
        year: '',
        total_income: '',
        total_expense: '',
        gross_profit: '',
        net_profit: '',
        cash_position: '',
        income_breakdown: null,
        expense_breakdown: null,
        notes: ''
    });

    useEffect(() => {
        if (summary) {
            setFormData({
                month: summary.month || '',
                year: summary.year || '',
                total_income: summary.total_income || '',
                total_expense: summary.total_expense || '',
                gross_profit: summary.gross_profit || '',
                net_profit: summary.net_profit || '',
                cash_position: summary.cash_position || '',
                income_breakdown: summary.income_breakdown || null,
                expense_breakdown: summary.expense_breakdown || null,
                notes: summary.notes || ''
            });
        }
    }, [summary]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user || !user.id) {
                throw new Error('User data not found');
            }

            const submitData = {
                ...formData,
                user_id: user.id,
                total_income: parseFloat(formData.total_income) || 0,
                total_expense: parseFloat(formData.total_expense) || 0,
                gross_profit: parseFloat(formData.total_income) - parseFloat(formData.total_expense),
                net_profit: parseFloat(formData.total_income) - parseFloat(formData.total_expense),
                cash_position: parseFloat(formData.cash_position) || 0
            };

            console.log('Updating financial summary:', submitData);
            const response = await managementFinancialApi.summaries.update(summary.id, submitData);

            if (response.data.status === 'success') {
                toast.success('Ringkasan keuangan berhasil diperbarui!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error updating financial summary:', error);

            let errorMessage = 'Terjadi kesalahan saat memperbarui ringkasan keuangan';
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

    if (!summary) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <SummaryForm
            title="Edit Ringkasan Keuangan"
            subtitle="Perbarui informasi ringkasan keuangan"
            formData={formData}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onNumberChange={handleNumberChange}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Perbarui Ringkasan"
            submitButtonIcon={<Save size={16} />}
            mode="edit"
        />
    );
};

export default SummaryEdit;