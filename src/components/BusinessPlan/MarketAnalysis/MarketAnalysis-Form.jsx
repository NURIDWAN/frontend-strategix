import { useState, useEffect } from 'react';
import { Upload, X, Building, Loader, Plus, Trash2, Calculator, BarChart3, Target, TrendingUp, Users, Shield, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { marketAnalysisApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const MarketAnalysisForm = ({
    title,
    subtitle,
    formData,
    businesses,
    isLoadingBusinesses,
    isLoading,
    onInputChange,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create'
}) => {
    const [competitors, setCompetitors] = useState([]);
    const [showMarketCalculator, setShowMarketCalculator] = useState(false);
    const [calculatorData, setCalculatorData] = useState({
        potential_customers: '',
        average_annual_revenue: '',
        serviceable_percentage: '',
        achievable_percentage: ''
    });
    const [isCalculating, setIsCalculating] = useState(false);

    // Initialize competitors from formData
    useEffect(() => {
        if (formData.competitors && formData.competitors.length > 0) {
            setCompetitors(formData.competitors);
        } else {
            setCompetitors([{
                id: null,
                competitor_name: '',
                type: 'competitor',
                code: '',
                address: '',
                annual_sales_estimate: '',
                selling_price: '',
                strengths: '',
                weaknesses: '',
                sort_order: 0
            }]);
        }
    }, [formData.competitors]);

    const handleCompetitorChange = (index, field, value) => {
        const updatedCompetitors = [...competitors];
        updatedCompetitors[index] = {
            ...updatedCompetitors[index],
            [field]: value
        };
        setCompetitors(updatedCompetitors);
        
        // Update formData
        onInputChange({
            target: {
                name: 'competitors',
                value: updatedCompetitors
            }
        });
    };

    const addCompetitor = () => {
        const newCompetitor = {
            id: null,
            competitor_name: '',
            type: 'competitor',
            code: '',
            address: '',
            annual_sales_estimate: '',
            selling_price: '',
            strengths: '',
            weaknesses: '',
            sort_order: competitors.length
        };
        setCompetitors([...competitors, newCompetitor]);
    };

    const removeCompetitor = (index) => {
        if (competitors.length > 1) {
            const updatedCompetitors = competitors.filter((_, i) => i !== index);
            setCompetitors(updatedCompetitors);
            
            // Update formData
            onInputChange({
                target: {
                    name: 'competitors',
                    value: updatedCompetitors
                }
            });
        }
    };

    const handleCalculatorChange = (field, value) => {
        setCalculatorData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateMarketSize = async () => {
        if (!calculatorData.potential_customers || !calculatorData.average_annual_revenue || 
            !calculatorData.serviceable_percentage || !calculatorData.achievable_percentage) {
            toast.error('Harap isi semua field kalkulator');
            return;
        }

        setIsCalculating(true);
        try {
            const response = await marketAnalysisApi.calculateMarketSize(calculatorData);
            
            if (response.data.status === 'success') {
                const { tam_total, sam_percentage, sam_total, som_percentage, som_total } = response.data.data;
                
                // Auto-fill the form fields
                onInputChange({ target: { name: 'tam_total', value: tam_total } });
                onInputChange({ target: { name: 'sam_percentage', value: sam_percentage } });
                onInputChange({ target: { name: 'sam_total', value: sam_total } });
                onInputChange({ target: { name: 'som_percentage', value: som_percentage } });
                onInputChange({ target: { name: 'som_total', value: som_total } });
                
                setShowMarketCalculator(false);
                toast.success('Perhitungan TAM, SAM, SOM berhasil!');
            }
        } catch (error) {
            toast.error('Gagal menghitung market size');
        } finally {
            setIsCalculating(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header Section dengan tombol back di atas */}
            <div className="mb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
                    
                    {/* Pilih Bisnis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih Bisnis *
                        </label>
                        {isLoadingBusinesses ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Loader className="animate-spin h-4 w-4" />
                                <span>Memuat data bisnis...</span>
                            </div>
                        ) : businesses.length === 0 ? (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Belum ada data bisnis. Silakan buat latar belakang bisnis terlebih dahulu.
                                </p>
                            </div>
                        ) : (
                            <select
                                name="business_background_id"
                                value={formData.business_background_id}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Bisnis</option>
                                {businesses.map((business) => (
                                    <option key={business.id} value={business.id}>
                                        {business.name} - {business.category}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pilih bisnis yang akan dianalisis pasarannya
                        </p>
                    </div>

                    {/* 🔥 REVISI: TAM, SAM, SOM Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Size Analysis</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMarketCalculator(!showMarketCalculator)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <Calculator size={16} />
                                {showMarketCalculator ? 'Tutup Kalkulator' : 'Buka Kalkulator'}
                            </button>
                        </div>

                        {/* Market Calculator */}
                        {showMarketCalculator && (
                            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Kalkulator Market Size</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Jumlah Pelanggan Potensial</label>
                                        <input
                                            type="number"
                                            value={calculatorData.potential_customers}
                                            onChange={(e) => handleCalculatorChange('potential_customers', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Pendapatan Tahunan Rata-rata per Pelanggan (Rp)</label>
                                        <input
                                            type="number"
                                            value={calculatorData.average_annual_revenue}
                                            onChange={(e) => handleCalculatorChange('average_annual_revenue', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="1000000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Persentase Pasar yang Bisa Dilayani (%)</label>
                                        <input
                                            type="number"
                                            value={calculatorData.serviceable_percentage}
                                            onChange={(e) => handleCalculatorChange('serviceable_percentage', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="30"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Persentase Pasar yang Bisa Diraih (%)</label>
                                        <input
                                            type="number"
                                            value={calculatorData.achievable_percentage}
                                            onChange={(e) => handleCalculatorChange('achievable_percentage', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="10"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={calculateMarketSize}
                                    disabled={isCalculating}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCalculating ? (
                                        <>
                                            <Loader className="animate-spin h-4 w-4" />
                                            Menghitung...
                                        </>
                                    ) : (
                                        <>
                                            <Calculator size={16} />
                                            Hitung TAM, SAM, SOM
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* TAM, SAM, SOM Results */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">TAM</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Addressable Market</p>
                                <input
                                    type="number"
                                    name="tam_total"
                                    value={formData.tam_total || ''}
                                    onChange={onInputChange}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center font-semibold text-blue-600 dark:text-blue-400"
                                    placeholder="0"
                                />
                                {formData.tam_total && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatCurrency(formData.tam_total)}
                                    </p>
                                )}
                            </div>
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">SAM</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Serviceable Available Market</p>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        name="sam_percentage"
                                        value={formData.sam_percentage || ''}
                                        onChange={onInputChange}
                                        className="w-full px-2 py-1 border text-green-400 border-gray-300 dark:border-gray-600 rounded text-center"
                                        placeholder="0%"
                                        min="0"
                                        max="100"
                                    />
                                    <input
                                        type="number"
                                        name="sam_total"
                                        value={formData.sam_total || ''}
                                        onChange={onInputChange}
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center font-semibold text-green-600 dark:text-green-400"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
                                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">SOM</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Serviceable Obtainable Market</p>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        name="som_percentage"
                                        value={formData.som_percentage || ''}
                                        onChange={onInputChange}
                                        className="w-full px-2 py-1 border text-purple-400 border-gray-300 dark:border-gray-600 rounded text-center"
                                        placeholder="0%"
                                        min="0"
                                        max="100"
                                    />
                                    <input
                                        type="number"
                                        name="som_total"
                                        value={formData.som_total || ''}
                                        onChange={onInputChange}
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center font-semibold text-purple-600 dark:text-purple-400"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 REVISI: SWOT Analysis Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-orange-600 dark:text-orange-400" size={24} />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SWOT Analysis</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Internal Factors */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                    Internal Factors
                                </h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Strengths (Kekuatan)
                                    </label>
                                    <textarea
                                        name="strengths"
                                        value={formData.strengths || ''}
                                        onChange={onInputChange}
                                        rows={3}
                                        placeholder="Apa kelebihan dan kekuatan internal bisnis Anda?"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Weaknesses (Kelemahan)
                                    </label>
                                    <textarea
                                        name="weaknesses"
                                        value={formData.weaknesses || ''}
                                        onChange={onInputChange}
                                        rows={3}
                                        placeholder="Apa kekurangan dan kelemahan internal bisnis Anda?"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            {/* External Factors */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="text-blue-600 dark:text-blue-400" size={16} />
                                    External Factors
                                </h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Opportunities (Peluang)
                                    </label>
                                    <textarea
                                        name="opportunities"
                                        value={formData.opportunities || ''}
                                        onChange={onInputChange}
                                        rows={3}
                                        placeholder="Apa peluang eksternal yang bisa dimanfaatkan?"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Threats (Ancaman)
                                    </label>
                                    <textarea
                                        name="threats"
                                        value={formData.threats || ''}
                                        onChange={onInputChange}
                                        rows={3}
                                        placeholder="Apa ancaman eksternal yang perlu diwaspadai?"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Pasar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Target Pasar
                        </label>
                        <textarea
                            name="target_market"
                            value={formData.target_market || ''}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Jelaskan target pasar Anda (usia, lokasi, preferensi, kebiasaan belanja, dll.)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Ukuran Pasar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ukuran & Potensi Pasar
                        </label>
                        <input
                            type="text"
                            name="market_size"
                            value={formData.market_size || ''}
                            onChange={onInputChange}
                            placeholder="Estimasi ukuran pasar, pertumbuhan, dan potensi"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Tren Pasar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tren Pasar
                        </label>
                        <textarea
                            name="market_trends"
                            value={formData.market_trends || ''}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Tren pasar saat ini dan prediksi masa depan"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* 🔥 REVISI: Daftar Kompetitor Detail */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="text-gray-600 dark:text-gray-400" size={24} />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Kompetitor Detail</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addCompetitor}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                <Plus size={16} />
                                Tambah Kompetitor
                            </button>
                        </div>

                        <div className="space-y-4">
                            {competitors.map((competitor, index) => (
                                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            Kompetitor {index + 1}
                                        </h4>
                                        {competitors.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCompetitor(index)}
                                                className="text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nama Kompetitor *</label>
                                            <input
                                                type="text"
                                                value={competitor.competitor_name}
                                                onChange={(e) => handleCompetitorChange(index, 'competitor_name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Nama kompetitor"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Jenis</label>
                                            <select
                                                value={competitor.type}
                                                onChange={(e) => handleCompetitorChange(index, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="competitor">Kompetitor</option>
                                                <option value="ownshop">Own Shop</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Kode</label>
                                            <input
                                                type="text"
                                                value={competitor.code}
                                                onChange={(e) => handleCompetitorChange(index, 'code', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Kode kompetitor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                                            <input
                                                type="text"
                                                value={competitor.address}
                                                onChange={(e) => handleCompetitorChange(index, 'address', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Alamat kompetitor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Estimasi Penjualan Tahunan (Rp)</label>
                                            <input
                                                type="number"
                                                value={competitor.annual_sales_estimate}
                                                onChange={(e) => handleCompetitorChange(index, 'annual_sales_estimate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="100000000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Harga Jual (Rp)</label>
                                            <input
                                                type="number"
                                                value={competitor.selling_price}
                                                onChange={(e) => handleCompetitorChange(index, 'selling_price', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="50000"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Kelebihan</label>
                                            <textarea
                                                value={competitor.strengths}
                                                onChange={(e) => handleCompetitorChange(index, 'strengths', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Kelebihan kompetitor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Kekurangan</label>
                                            <textarea
                                                value={competitor.weaknesses}
                                                onChange={(e) => handleCompetitorChange(index, 'weaknesses', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Kekurangan kompetitor"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kompetitor Utama (Ringkasan) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kompetitor Utama (Ringkasan)
                        </label>
                        <textarea
                            name="main_competitors"
                            value={formData.main_competitors || ''}
                            onChange={onInputChange}
                            rows={2}
                            placeholder="Sebutkan kompetitor utama bisnis Anda (ringkasan)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Kelebihan Kompetitor (Ringkasan) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kelebihan Kompetitor (Ringkasan)
                        </label>
                        <textarea
                            name="competitor_strengths"
                            value={formData.competitor_strengths || ''}
                            onChange={onInputChange}
                            rows={2}
                            placeholder="Apa kelebihan dan keunggulan kompetitor? (ringkasan)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Kekurangan Kompetitor (Ringkasan) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kekurangan Kompetitor (Ringkasan)
                        </label>
                        <textarea
                            name="competitor_weaknesses"
                            value={formData.competitor_weaknesses || ''}
                            onChange={onInputChange}
                            rows={2}
                            placeholder="Apa kekurangan dan celah kompetitor? (ringkasan)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Keunggulan Kompetitif */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Keunggulan Kompetitif
                        </label>
                        <textarea
                            name="competitive_advantage"
                            value={formData.competitive_advantage || ''}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Apa keunggulan kompetitif bisnis Anda dibandingkan kompetitor?"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isLoadingBusinesses || businesses.length === 0}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    {submitButtonIcon}
                                    {submitButtonText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MarketAnalysisForm;