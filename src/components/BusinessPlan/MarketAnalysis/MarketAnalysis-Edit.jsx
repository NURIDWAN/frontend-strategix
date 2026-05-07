import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import MarketAnalysisForm from './MarketAnalysis-Form';
import { marketAnalysisApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const MarketAnalysisEdit = ({ analysis, onBack, onSuccess }) => {
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
        competitive_advantage: '',
        // TAM SAM SOM - TAMBAHKAN INI
        tam_total: '',
        sam_percentage: '',
        sam_total: '',
        som_percentage: '',
        som_total: '',
        // SWOT Analysis - TAMBAHKAN INI
        strengths: '',
        weaknesses: '',
        opportunities: '',
        threats: '',
        // Competitors - TAMBAHKAN INI
        competitors: []
    });

    // Fetch business backgrounds untuk dropdown
    const fetchBusinesses = async () => {
        try {
            setIsLoadingBusinesses(true);
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

    useEffect(() => {
        if (analysis) {
            console.log('Analysis data untuk edit:', analysis); // Debug log
            setFormData({
                business_background_id: analysis.business_background_id || '',
                target_market: analysis.target_market || '',
                market_size: analysis.market_size || '',
                market_trends: analysis.market_trends || '',
                main_competitors: analysis.main_competitors || '',
                competitor_strengths: analysis.competitor_strengths || '',
                competitor_weaknesses: analysis.competitor_weaknesses || '',
                competitive_advantage: analysis.competitive_advantage || '',
                // TAM SAM SOM - TAMBAHKAN INI
                tam_total: analysis.tam_total || '',
                sam_percentage: analysis.sam_percentage || '',
                sam_total: analysis.sam_total || '',
                som_percentage: analysis.som_percentage || '',
                som_total: analysis.som_total || '',
                // SWOT Analysis - TAMBAHKAN INI
                strengths: analysis.strengths || '',
                weaknesses: analysis.weaknesses || '',
                opportunities: analysis.opportunities || '',
                threats: analysis.threats || '',
                // Competitors - TAMBAHKAN INI
                competitors: analysis.competitors && analysis.competitors.length > 0 
                    ? analysis.competitors.map(comp => ({
                        id: comp.id || null,
                        competitor_name: comp.competitor_name || '',
                        type: comp.type || 'competitor',
                        code: comp.code || '',
                        address: comp.address || '',
                        annual_sales_estimate: comp.annual_sales_estimate || '',
                        selling_price: comp.selling_price || '',
                        strengths: comp.strengths || '',
                        weaknesses: comp.weaknesses || '',
                        sort_order: comp.sort_order || 0
                    }))
                    : []
            });
        }
    }, [analysis]);

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

            console.log('Updating market analysis data:', submitData); // Debug log
            const response = await marketAnalysisApi.update(analysis.id, submitData);

            if (response.data.status === 'success') {
                toast.success('Analisis pasar berhasil diperbarui!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error updating market analysis:', error);
            
            let errorMessage = 'Terjadi kesalahan saat memperbarui analisis pasar';
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

    if (!analysis) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <MarketAnalysisForm
            title="Edit Analisis Pasar"
            subtitle="Perbarui informasi analisis pasar"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Perbarui Analisis"
            submitButtonIcon={<Save size={16} />}
            mode="edit"
        />
    );
};

export default MarketAnalysisEdit;