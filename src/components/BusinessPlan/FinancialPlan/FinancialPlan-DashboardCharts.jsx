import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const FinancialPlanDashboardCharts = ({ plans }) => {
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        // Ensure plans is an array
        const safePlans = Array.isArray(plans) ? plans : [];
        
        if (safePlans.length > 0) {
            generateDashboardData(safePlans);
        } else {
            setDashboardData(null);
        }
    }, [plans]);

    const generateDashboardData = (safePlans) => {
        // Data untuk profit trend
        const profitTrendData = safePlans.map(plan => ({
            name: plan.plan_name && plan.plan_name.length > 10 ? plan.plan_name.substring(0, 10) + '...' : plan.plan_name || 'Unnamed',
            pendapatan: plan.total_monthly_income || 0,
            laba: plan.net_profit || 0,
            fullName: plan.plan_name || 'Unnamed Plan'
        }));

        // Data untuk feasibility distribution
        const feasibilityData = safePlans.reduce((acc, plan) => {
            const status = plan.feasibility_status || 'Tidak Diketahui';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const feasibilityChartData = Object.entries(feasibilityData).map(([name, value]) => ({
            name,
            value
        }));

        // Data untuk ROI comparison
        const roiData = safePlans.map(plan => ({
            name: plan.plan_name && plan.plan_name.length > 8 ? plan.plan_name.substring(0, 8) + '...' : plan.plan_name || 'Unnamed',
            roi: plan.roi_percentage || 0,
            fullName: plan.plan_name || 'Unnamed Plan'
        })).sort((a, b) => b.roi - a.roi);

        setDashboardData({
            profitTrend: profitTrendData,
            feasibility: feasibilityChartData,
            roiComparison: roiData
        });
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'Rp 0';
        
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 dark:text-white">
                        {payload[0]?.payload?.fullName || label}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {
                                entry.name.includes('Rp') ? formatCurrency(entry.value) : 
                                entry.name.includes('%') ? `${entry.value}%` : 
                                entry.value
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Ensure plans is an array before using
    const safePlans = Array.isArray(plans) ? plans : [];

    if (!dashboardData || safePlans.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dashboard Analisis Rencana Keuangan
            </h3>

            {/* Profit Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Trend Pendapatan & Laba</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.profitTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="pendapatan" name="Pendapatan/Bulan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="laba" name="Laba Bersih/Bulan" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ROI Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Perbandingan ROI</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dashboardData.roiComparison} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={80}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                formatter={(value) => [`${value}%`, 'ROI']}
                                labelFormatter={(value, payload) => {
                                    const data = payload[0]?.payload;
                                    return data?.fullName || value;
                                }}
                            />
                            <Bar 
                                dataKey="roi" 
                                name="ROI (%)" 
                                fill="#f59e0b" 
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Feasibility Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Distribusi Kelayakan</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={dashboardData.feasibility}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {dashboardData.feasibility.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{safePlans.length}</p>
                    <p className="text-sm text-blue-600/80">Total Rencana</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {safePlans.length > 0 ? Math.round(safePlans.reduce((acc, plan) => acc + (plan.roi_percentage || 0), 0) / safePlans.length) : 0}%
                    </p>
                    <p className="text-sm text-green-600/80">ROI Rata-rata</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                        {safePlans.filter(p => p.feasibility_status === 'Layak').length}
                    </p>
                    <p className="text-sm text-purple-600/80">Rencana Layak</p>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(safePlans.reduce((acc, plan) => acc + (plan.total_monthly_income || 0), 0))}
                    </p>
                    <p className="text-sm text-orange-600/80">Total Pendapatan/Bln</p>
                </div>
            </div>
        </div>
    );
};

export default FinancialPlanDashboardCharts;