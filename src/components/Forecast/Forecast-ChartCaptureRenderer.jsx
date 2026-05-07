import React, { useState, useEffect, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Hidden component untuk render dan capture forecast charts
 */
const ForecastChartCaptureRenderer = ({ forecastResults, onCaptureComplete, onError }) => {
    const [isCapturing, setIsCapturing] = useState(false);

    const chartRefs = {
        income: useRef(null),
        expense: useRef(null),
        profit: useRef(null),
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    useEffect(() => {
        if (forecastResults && forecastResults.length > 0 && !isCapturing) {
            setIsCapturing(true);
            const timer = setTimeout(() => {
                captureAllCharts();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [forecastResults]);

    const captureAllCharts = () => {
        try {
            const charts = {};
            const chartTypes = ['income', 'expense', 'profit'];

            chartTypes.forEach((chartType) => {
                const chartRef = chartRefs[chartType];
                if (chartRef && chartRef.current && chartRef.current.canvas) {
                    const canvas = chartRef.current.canvas;
                    const base64Image = canvas.toDataURL('image/png', 1.0);
                    charts[chartType] = base64Image;
                    console.log(`✅ Chart ${chartType} captured successfully`);
                } else {
                    console.warn(`⚠️ Chart ${chartType} ref not available`);
                }
            });

            if (Object.keys(charts).length > 0) {
                console.log(`📊 Total charts captured: ${Object.keys(charts).length}`);
                onCaptureComplete(charts);
            } else {
                onError(new Error('No charts could be captured'));
            }
        } catch (error) {
            console.error('Error capturing charts:', error);
            onError(error);
        }
    };

    const commonOptions = {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: 'Arial, sans-serif',
                    },
                    padding: 15,
                    color: '#1f2937',
                },
            },
            tooltip: {
                enabled: false,
            },
            title: {
                display: false,
            },
        },
    };

    const chartWidth = 800;
    const chartHeight = 400;

    // Income Chart Data
    const incomeData = {
        labels: forecastResults.map(r => `Bulan ${r.month}`),
        datasets: [
            {
                label: 'Proyeksi Pendapatan (Rp)',
                data: forecastResults.map(r => parseFloat(r.forecast_income)),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
            },
        ],
    };

    const incomeOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => formatCurrency(value),
                    font: { size: 12 },
                    color: '#4b5563',
                },
                grid: {
                    color: '#e5e7eb',
                },
            },
            x: {
                ticks: {
                    font: { size: 12 },
                    color: '#4b5563',
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    // Expense Chart Data
    const expenseData = {
        labels: forecastResults.map(r => `Bulan ${r.month}`),
        datasets: [
            {
                label: 'Proyeksi Pengeluaran (Rp)',
                data: forecastResults.map(r => parseFloat(r.forecast_expense)),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#ef4444',
            },
        ],
    };

    const expenseOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => formatCurrency(value),
                    font: { size: 12 },
                    color: '#4b5563',
                },
                grid: {
                    color: '#e5e7eb',
                },
            },
            x: {
                ticks: {
                    font: { size: 12 },
                    color: '#4b5563',
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    // Profit Chart Data
    const profitData = {
        labels: forecastResults.map(r => `Bulan ${r.month}`),
        datasets: [
            {
                label: 'Proyeksi Laba (Rp)',
                data: forecastResults.map(r => parseFloat(r.forecast_profit)),
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 2,
            },
        ],
    };

    const profitOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => formatCurrency(value),
                    font: { size: 12 },
                    color: '#4b5563',
                },
                grid: {
                    color: '#e5e7eb',
                },
            },
            x: {
                ticks: {
                    font: { size: 12 },
                    color: '#4b5563',
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: '-9999px',
                top: 0,
                width: '800px',
                backgroundColor: 'white',
                padding: '20px',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Income Chart */}
                <div style={{ width: chartWidth, height: chartHeight }}>
                    <Line
                        ref={chartRefs.income}
                        data={incomeData}
                        options={incomeOptions}
                        width={chartWidth}
                        height={chartHeight}
                    />
                </div>

                {/* Expense Chart */}
                <div style={{ width: chartWidth, height: chartHeight }}>
                    <Line
                        ref={chartRefs.expense}
                        data={expenseData}
                        options={expenseOptions}
                        width={chartWidth}
                        height={chartHeight}
                    />
                </div>

                {/* Profit Chart */}
                <div style={{ width: chartWidth, height: chartHeight }}>
                    <Bar
                        ref={chartRefs.profit}
                        data={profitData}
                        options={profitOptions}
                        width={chartWidth}
                        height={chartHeight}
                    />
                </div>
            </div>
        </div>
    );
};

export default ForecastChartCaptureRenderer;