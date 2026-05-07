    import { Edit3, Target, TrendingUp, Users, BarChart3, Shield, Building, Calendar, Calculator, Zap, CheckCircle, AlertCircle, DollarSign, MapPin, Code, PieChart as PieChartIcon } from 'lucide-react';
    import { Pie, Bar } from 'react-chartjs-2';
    import ChartDataLabels from 'chartjs-plugin-datalabels';
    import {
        Chart as ChartJS,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Tooltip,
        Legend,
    } from 'chart.js';

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Tooltip,
        Legend,
        ChartDataLabels
    );

    const MarketAnalysisView = ({ analysis, onBack, onEdit }) => {
        if (!analysis) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            );
        }

        // Helper function untuk mengakses business background
        const getBusinessInfo = () => {
            if (!analysis.business_background) {
                return { name: 'Bisnis Tidak Ditemukan', category: 'Tidak ada kategori' };
            }
            return {
                name: analysis.business_background.name || 'Bisnis Tidak Ditemukan',
                category: analysis.business_background.category || 'Tidak ada kategori'
            };
        };

        const businessInfo = getBusinessInfo();

        const formatCurrency = (value) => {
            if (!value) return '-';
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        };

        const formatPercentage = (value) => {
            if (!value) return '-';
            return `${value}%`;
        };

        // Data untuk grafik TAM/SAM/SOM
        const marketSizeData = [
            { name: 'TAM', value: Number(analysis.tam_total) || 0, color: '#3b82f6' },
            { name: 'SAM', value: Number(analysis.sam_total) || 0, color: '#10b981' },
            { name: 'SOM', value: Number(analysis.som_total) || 0, color: '#8b5cf6' }
        ];

        // Calculate total untuk percentage - dengan explicit number conversion
        const totalMarketSize = marketSizeData.reduce((sum, item) => {
            const val = Number(item.value);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        // Debug log untuk troubleshoot
        const hasValidData = totalMarketSize > 0;

        const maxValue = Math.max(...marketSizeData.map(item => item.value || 0));

        return (
            <div className="space-y-6 max-w-full overflow-hidden">
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
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Analisis Pasar</h1>
                            <p className="text-gray-600 dark:text-gray-400">Lihat detail lengkap analisis pasar</p>
                        </div>
                        <button
                            onClick={() => onEdit(analysis)}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                        >
                            <Edit3 size={16} />
                            Edit
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8 overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                                <BarChart3 className="w-12 h-12 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {businessInfo.name}
                            </h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full flex items-center gap-1">
                                    <BarChart3 size={14} />
                                    Analisis Pasar
                                </span>
                                <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                                    <Building size={14} />
                                    {businessInfo.category}
                                </span>
                                <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-1">
                                    <Calendar size={14} />
                                    Dibuat: {new Date(analysis.created_at).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 REVISI: TAM, SAM, SOM Section dengan Grafik */}
                    {(analysis.tam_total || analysis.sam_total || analysis.som_total) && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calculator size={20} />
                                Market Size Analysis
                            </h3>
                            
                            {/* Grid: Pie Chart + Bar Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Pie Chart TAM/SAM/SOM */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center flex items-center justify-center gap-2">
                                        <PieChartIcon size={18} />
                                        Market Size Distribution
                                    </h4>
                                    <div style={{ position: 'relative', height: 300 }}>
                                        <Pie
                                            data={{
                                                labels: marketSizeData.map(item => item.name),
                                                datasets: [
                                                    {
                                                        data: marketSizeData.map(item => item.value || 0),
                                                        backgroundColor: marketSizeData.map(item => item.color),
                                                        borderColor: '#ffffff',
                                                        borderWidth: 2,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            color: '#6b7280',
                                                            font: { size: 13, weight: 'bold' },
                                                            padding: 20,
                                                            boxWidth: 15,
                                                            boxHeight: 15,
                                                        },
                                                    },
                                                    tooltip: {
                                                        enabled: true,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                        padding: 12,
                                                        cornerRadius: 6,
                                                        titleFont: { size: 13, weight: 'bold' },
                                                        bodyFont: { size: 12 },
                                                        callbacks: {
                                                            label: function(context) {
                                                                const value = context.parsed || 0;
                                                                return formatCurrency(value);
                                                            },
                                                        },
                                                    },
                                                    datalabels: {
                                                        color: '#ffffff',
                                                        font: {
                                                            size: 12,
                                                            weight: 'bold',
                                                        },
                                                        formatter: function(value, context) {
                                                            try {
                                                                const label = context.chart.data.labels[context.dataIndex];
                                                                
                                                                // Ensure value is a valid number
                                                                const numValue = Number(value);
                                                                if (isNaN(numValue)) {
                                                                    return label;
                                                                }
                                                                
                                                                // Use the calculated totalMarketSize from component scope
                                                                if (!hasValidData || totalMarketSize === 0) {
                                                                    return label;
                                                                }
                                                                
                                                                const percentage = ((numValue / totalMarketSize) * 100).toFixed(0);
                                                                return `${label}\n${percentage}%`;
                                                            } catch (e) {
                                                                console.error('Datalabels error:', e);
                                                                return context.chart.data.labels[context.dataIndex] || 'N/A';
                                                            }
                                                        },
                                                        anchor: 'center',
                                                        align: 'center',
                                                        offset: 0,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Bar Chart TAM/SAM/SOM */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                        Market Size Comparison
                                    </h4>
                                    <div style={{ position: 'relative', height: 300 }}>
                                        <Bar
                                            data={{
                                                labels: marketSizeData.map(item => item.name),
                                                datasets: [
                                                    {
                                                        label: 'Market Size',
                                                        data: marketSizeData.map(item => item.value),
                                                        backgroundColor: marketSizeData.map(item => item.color),
                                                        borderColor: marketSizeData.map(item => item.color),
                                                        borderWidth: 1,
                                                        borderRadius: 6,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y',
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        labels: {
                                                            color: '#6b7280',
                                                            font: { size: 12 },
                                                        },
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function(context) {
                                                                return `${formatCurrency(context.parsed.x)}`;
                                                            },
                                                        },
                                                    },
                                                    datalabels: {
                                                        display: false,
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: {
                                                            color: '#6b7280',
                                                            maxTicksLimit: 5,
                                                            callback: function(value) {
                                                                if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
                                                                if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
                                                                if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}Rb`;
                                                                return formatCurrency(value);
                                                            },
                                                        },
                                                        grid: {
                                                            color: '#e5e7eb',
                                                            drawBorder: false,
                                                        },
                                                    },
                                                    y: {
                                                        ticks: {
                                                            color: '#6b7280',
                                                        },
                                                        grid: {
                                                            display: false,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cards TAM/SAM/SOM */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* TAM */}
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">TAM</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Addressable Market</p>
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(analysis.tam_total)}
                                    </p>
                                </div>
                                
                                {/* SAM */}
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">SAM</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Serviceable Available Market</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        {formatPercentage(analysis.sam_percentage)}
                                    </p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(analysis.sam_total)}
                                    </p>
                                </div>
                                
                                {/* SOM */}
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">SOM</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Serviceable Obtainable Market</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        {formatPercentage(analysis.som_percentage)}
                                    </p>
                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(analysis.som_total)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🔥 REVISI: SWOT Analysis */}
                    {(analysis.strengths || analysis.weaknesses || analysis.opportunities || analysis.threats) && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield size={20} />
                                SWOT Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Internal Factors */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                        Internal Factors
                                    </h4>
                                    
                                    {analysis.strengths && (
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                            <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Strengths (Kekuatan)</h5>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                                {analysis.strengths}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {analysis.weaknesses && (
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                                            <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2">Weaknesses (Kelemahan)</h5>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                                {analysis.weaknesses}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* External Factors */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <AlertCircle className="text-blue-600 dark:text-blue-400" size={16} />
                                        External Factors
                                    </h4>
                                    
                                    {analysis.opportunities && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Opportunities (Peluang)</h5>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                                {analysis.opportunities}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {analysis.threats && (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                                            <h5 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Threats (Ancaman)</h5>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                                {analysis.threats}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Target Pasar */}
                    {analysis.target_market && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Target size={20} />
                                Target Pasar
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                                    {analysis.target_market}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Ukuran Pasar */}
                    {analysis.market_size && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp size={20} />
                                Ukuran & Potensi Pasar
                            </h3>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                    {analysis.market_size}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tren Pasar */}
                    {analysis.market_trends && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 size={20} />
                                Tren Pasar
                            </h3>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                    {analysis.market_trends}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Daftar Kompetitor Detail */}
                    {analysis.competitors && analysis.competitors.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users size={20} />
                                Daftar Kompetitor Detail
                            </h3>
                            
                            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 -mx-2 sm:mx-0">
                                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                                                No
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                                                Nama
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                                                Jenis
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                                                Kode
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px] max-w-[180px]">
                                                Alamat
                                            </th>
                                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                                                Est. Penjualan/Thn
                                            </th>
                                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[90px]">
                                                Harga Jual
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px] max-w-[200px]">
                                                Kelebihan
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px] max-w-[200px]">
                                                Kekurangan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {analysis.competitors.map((competitor, index) => (
                                            <tr key={competitor.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">
                                                    {competitor.competitor_name}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        competitor.type === 'ownshop' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                                    }`}>
                                                        {competitor.type === 'ownshop' ? 'Own Shop' : 'Kompetitor'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                                                    {competitor.code || '-'}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900 dark:text-white max-w-[180px] break-words">
                                                    {competitor.address || '-'}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-gray-900 dark:text-white">
                                                    {competitor.annual_sales_estimate ? formatCurrency(competitor.annual_sales_estimate) : '-'}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-gray-900 dark:text-white">
                                                    {competitor.selling_price ? formatCurrency(competitor.selling_price) : '-'}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900 dark:text-white max-w-[200px] break-words">
                                                    {competitor.strengths || '-'}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900 dark:text-white max-w-[200px] break-words">
                                                    {competitor.weaknesses || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Kompetitor Utama (Ringkasan) */}
                    {analysis.main_competitors && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users size={20} />
                                Kompetitor Utama (Ringkasan)
                            </h3>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                    {analysis.main_competitors}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Keunggulan Kompetitif */}
                    {analysis.competitive_advantage && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield size={20} />
                                Keunggulan Kompetitif
                            </h3>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                    {analysis.competitive_advantage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Analisis Kompetitor (Ringkasan) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kelebihan Kompetitor */}
                        {analysis.competitor_strengths && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Kelebihan Kompetitor (Ringkasan)
                                </h3>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                        {analysis.competitor_strengths}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Kekurangan Kompetitor */}
                        {analysis.competitor_weaknesses && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Kekurangan Kompetitor (Ringkasan)
                                </h3>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                        {analysis.competitor_weaknesses}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons di bagian bawah */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={() => onEdit(analysis)}
                            className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit3 size={16} />
                            Edit Analisis
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default MarketAnalysisView;