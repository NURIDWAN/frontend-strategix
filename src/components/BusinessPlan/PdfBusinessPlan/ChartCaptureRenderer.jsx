import React, { useState, useEffect, useRef } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

/**
 * Hidden component untuk render dan capture semua charts menggunakan Chart.js
 * Menggunakan canvas.toDataURL() untuk mendapatkan hasil yang sempurna dengan semua label/legend
 */
const ChartCaptureRenderer = ({ financialPlan, onCaptureComplete, onError }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  // Refs untuk semua chart
  const chartRefs = {
    profit_loss: useRef(null),
    capital_structure: useRef(null),
    revenue_streams: useRef(null),
    expense_breakdown: useRef(null),
    feasibility: useRef(null),
    forecast: useRef(null),
  };

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899"];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    if (financialPlan && !isCapturing) {
      setIsCapturing(true);
      // Delay untuk memastikan semua chart ter-render
      const timer = setTimeout(() => {
        captureAllCharts();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [financialPlan]);

  const captureAllCharts = () => {
    try {
      const charts = {};
      const chartTypes = ["profit_loss", "capital_structure", "revenue_streams", "expense_breakdown", "feasibility", "forecast"];

      chartTypes.forEach((chartType) => {
        const chartRef = chartRefs[chartType];
        if (chartRef && chartRef.current && chartRef.current.canvas) {
          // Langsung ambil dari canvas Chart.js - no html2canvas needed!
          const canvas = chartRef.current.canvas;
          const base64Image = canvas.toDataURL("image/png", 1.0);
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
        onError(new Error("No charts could be captured"));
      }
    } catch (error) {
      console.error("Error capturing charts:", error);
      onError(error);
    }
  };

  // Common chart options
  const commonOptions = {
    responsive: false,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "Arial, sans-serif",
          },
          padding: 15,
          color: "#1f2937",
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

  const renderChart = (chartType) => {
    if (!financialPlan) return null;

    const chartWidth = 800;
    const chartHeight = 400;

    switch (chartType) {
      case "profit_loss": {
        const data = {
          labels: ["Pendapatan", "Biaya Operasional", "Laba Kotor", "Laba Bersih"],
          datasets: [
            {
              label: "Nilai (Rp)",
              data: [financialPlan.total_monthly_income || 0, financialPlan.total_monthly_opex || 0, financialPlan.gross_profit || 0, financialPlan.net_profit || 0],
              backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#4f46e5"],
              borderColor: ["#059669", "#dc2626", "#d97706", "#4338ca"],
              borderWidth: 2,
            },
          ],
        };

        const options = {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value),
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                color: "#e5e7eb",
              },
            },
            x: {
              ticks: {
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                display: false,
              },
            },
          },
        };

        return (
          <div style={{ width: chartWidth, height: chartHeight }}>
            <Bar ref={chartRefs.profit_loss} data={data} options={options} width={chartWidth} height={chartHeight} />
          </div>
        );
      }

      case "capital_structure": {
        const capitalSources = financialPlan.capital_sources || [];
        const data = {
          labels: capitalSources.map((source) => source.source),
          datasets: [
            {
              label: "Sumber Modal",
              data: capitalSources.map((source) => source.amount),
              backgroundColor: COLORS,
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        };

        const options = {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            legend: {
              ...commonOptions.plugins.legend,
              position: "right",
            },
          },
        };

        return (
          <div style={{ width: chartWidth, height: chartHeight }}>
            <Pie ref={chartRefs.capital_structure} data={data} options={options} width={chartWidth} height={chartHeight} />
          </div>
        );
      }

      case "revenue_streams": {
        const salesData = financialPlan.sales_projections || [];
        const data = {
          labels: salesData.map((item) => item.product),
          datasets: [
            {
              label: "Pendapatan/Bulan",
              data: salesData.map((item) => item.monthly_income),
              backgroundColor: "#4f46e5",
              borderColor: "#4338ca",
              borderWidth: 2,
            },
          ],
        };

        const options = {
          ...commonOptions,
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value),
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                color: "#e5e7eb",
              },
            },
            y: {
              ticks: {
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                display: false,
              },
            },
          },
        };

        return (
          <div style={{ width: chartWidth, height: chartHeight }}>
            <Bar ref={chartRefs.revenue_streams} data={data} options={options} width={chartWidth} height={chartHeight} />
          </div>
        );
      }

      case "expense_breakdown": {
        const opexData = financialPlan.monthly_opex || [];
        const data = {
          labels: opexData.map((item) => item.category),
          datasets: [
            {
              label: "Biaya Operasional",
              data: opexData.map((item) => item.amount),
              backgroundColor: COLORS,
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        };

        const options = {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            legend: {
              ...commonOptions.plugins.legend,
              position: "right",
            },
          },
        };

        return (
          <div style={{ width: chartWidth, height: chartHeight }}>
            <Pie ref={chartRefs.expense_breakdown} data={data} options={options} width={chartWidth} height={chartHeight} />
          </div>
        );
      }

      case "feasibility": {
        const data = {
          labels: ["ROI (%)", "Payback Period (Bulan)", "Profit Margin (%)"],
          datasets: [
            {
              label: "Nilai Aktual",
              data: [financialPlan.roi_percentage || 0, financialPlan.payback_period || 0, financialPlan.profit_margin || 0],
              backgroundColor: "#4f46e5",
              borderColor: "#4338ca",
              borderWidth: 2,
            },
            {
              label: "Target Ideal",
              data: [25, 24, 20],
              backgroundColor: "#94a3b8",
              borderColor: "#64748b",
              borderWidth: 2,
            },
          ],
        };

        const options = {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                color: "#e5e7eb",
              },
            },
            x: {
              ticks: {
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                display: false,
              },
            },
          },
        };

        return (
          <div style={{ width: chartWidth, height: chartHeight }}>
            <Bar ref={chartRefs.feasibility} data={data} options={options} width={chartWidth} height={chartHeight} />
          </div>
        );
      }

      case "forecast": {
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const baseIncome = financialPlan.total_monthly_income || 10000000;
        const baseOpex = financialPlan.total_monthly_opex || 5000000;

        const forecastData = months.map((month, index) => {
          const growth = 1 + index * 0.05;
          const income = baseIncome * growth;
          const opex = baseOpex * (1 + index * 0.02);
          return {
            month,
            income,
            opex,
            profit: income - opex,
          };
        });

        const data = {
          labels: forecastData.map((d) => d.month),
          datasets: [
            {
              label: "Proyeksi Pendapatan",
              data: forecastData.map((d) => d.income),
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#10b981",
            },
            {
              label: "Proyeksi Biaya",
              data: forecastData.map((d) => d.opex),
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#ef4444",
            },
            {
              label: "Proyeksi Laba",
              data: forecastData.map((d) => d.profit),
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79, 70, 229, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#4f46e5",
            },
          ],
        };

        const options = {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value),
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                color: "#e5e7eb",
              },
            },
            x: {
              ticks: {
                font: { size: 12 },
                color: "#4b5563",
              },
              grid: {
                display: false,
              },
            },
          },
        };

        return (
          <div style={{ width: chartWidth, height: chartHeight }}>
            <Line ref={chartRefs.forecast} data={data} options={options} width={chartWidth} height={chartHeight} />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: "800px",
        backgroundColor: "white",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {renderChart("profit_loss")}
        {renderChart("capital_structure")}
        {renderChart("revenue_streams")}
        {renderChart("expense_breakdown")}
        {renderChart("feasibility")}
        {renderChart("forecast")}
      </div>
    </div>
  );
};

export default ChartCaptureRenderer;
