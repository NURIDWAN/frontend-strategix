import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import MarketAnalysisForm from './MarketAnalysis-Form';
import { marketAnalysisApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const MarketAnalysisCreate = ({ onBack, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

    const [formData, setFormData] = useState({
        business_background_id: '',
        target_market: '',
        market_size: '',
        market_trends: '',
        main_competitors: '',
        competitor_strengths: '',
        competitor_weaknesses: '',
        competitive_advantage: ''
    });

    // Fetch business backgrounds untuk dropdown
    const fetchBusinesses = async () => {
        try {
            setIsLoadingBusinesses(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await backgroundApi.getAll();
            
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
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi: business background harus dipilih
        if (!formData.business_background_id) {
            toast.error('Pilih bisnis terlebih dahulu');
            return;
        }

        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.id) {
                throw new Error('User data not found');
            }

            const submitData = {
                ...formData,
                user_id: user.id
            };

            console.log('Submitting market analysis data:', submitData);
            const response = await marketAnalysisApi.create(submitData);

            if (response.data.status === 'success') {
                toast.success('Analisis pasar berhasil dibuat!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error creating market analysis:', error);
            
            let errorMessage = 'Terjadi kesalahan saat membuat analisis pasar';
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

    return (
        <MarketAnalysisForm
            title="Tambah Analisis Pasar"
            subtitle="Isi formulir untuk menambahkan analisis pasar baru"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Simpan Analisis"
            submitButtonIcon={<Save size={16} />}
            mode="create"
        />
    );
};

export default MarketAnalysisCreate;