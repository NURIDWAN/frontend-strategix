import { useState, useEffect, useRef } from "react";
import { BarChart3, PieChart, TrendingUp, DollarSign, Download, Calendar } from "lucide-react";
import { financialPlanApi } from "../../../services/businessPlan";
import { toast } from "react-toastify";

// Chart.js imports
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const FinancialPlanCharts = ({ plan, onBack }) => {
  const [activeChart, setActiveChart] = useState("profit_loss");
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");
  const [forecastData, setForecastData] = useState(null);

  // Refs untuk setiap chart
  const chartRefs = {
    profit_loss: useRef(null),
    capital_structure: useRef(null),
    revenue_streams: useRef(null),
    expense_breakdown: useRef(null),
    feasibility: useRef(null),
    forecast: useRef(null),
  };

  const chartTypes = [
    { id: "profit_loss", name: "Laba Rugi", icon: "📊", color: "#4f46e5" },
    { id: "capital_structure", name: "Struktur Modal", icon: "💰", color: "#10b981" },
    { id: "revenue_streams", name: "Sumber Pendapatan", icon: "📈", color: "#ef4444" },
    { id: "expense_breakdown", name: "Breakdown Biaya", icon: "📉", color: "#8b5cf6" },
    { id: "feasibility", name: "Analisis Kelayakan", icon: "🔍", color: "#06b6d4" },
    { id: "forecast", name: "Proyeksi Masa Depan", icon: "🔮", color: "#8b5cf6" },
  ];

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899"];

  useEffect(() => {
    if (plan) {
      fetchChartData();
      fetchForecastData();
    }
  }, [plan, activeChart, timeRange]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      const response = await financialPlanApi.getChartData(plan.id, {
        chart_type: activeChart,
        time_range: timeRange,
      });

      if (response.data.status === "success") {
        setChartData(response.data.data);
      } else {
        throw new Error("Failed to fetch chart data");
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast.error("Gagal memuat data chart");
      setChartData(generateFallbackData());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await financialPlanApi.getFinancialForecast(plan.id, {
        period: 12,
      });
      if (response.data.status === "success") {
        setForecastData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  const generateFallbackData = () => {
    switch (activeChart) {
      case "profit_loss":
        return {
          labels: ["Pendapatan", "Biaya Operasional", "Laba Kotor", "Laba Bersih"],
          values: [plan.total_monthly_income || 0, plan.total_monthly_opex || 0, plan.gross_profit || 0, plan.net_profit || 0],
        };

      case "capital_structure":
        const capitalSources = plan.capital_sources || [];
        return {
          labels: capitalSources.map((source) => source.source),
          values: capitalSources.map((source) => source.amount),
          percentages: capitalSources.map((source) => source.percentage),
        };

      case "revenue_streams":
        const salesData = plan.sales_projections || [];
        return {
          labels: salesData.map((item) => item.product),
          values: salesData.map((item) => item.monthly_income),
        };

      case "expense_breakdown":
        const opexData = plan.monthly_opex || [];
        return {
          labels: opexData.map((item) => item.category),
          values: opexData.map((item) => item.amount),
        };

      case "feasibility":
        return {
          labels: ["ROI", "Payback Period", "Profit Margin"],
          values: [plan.roi_percentage || 0, plan.payback_period || 0, plan.profit_margin || 0],
          targets: [25, 24, 20],
        };

      case "forecast":
        return generateForecastDataLocal();

      default:
        return null;
    }
  };

  const generateForecastDataLocal = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return months.map((month, index) => {
      const baseIncome = plan.total_monthly_income || 10000000;
      const baseOpex = plan.total_monthly_opex || 5000000;
      const growth = 1 + index * 0.05;

      return {
        month,
        projected_income: baseIncome * growth,
        projected_opex: baseOpex * (1 + index * 0.02),
        projected_profit: baseIncome * growth - baseOpex * (1 + index * 0.02),
      };
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Chart.js Options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        displayColors: true,
      },
    },
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (activeChart) {
      case "profit_loss": {
        const data = {
          labels: chartData.labels || ["Pendapatan", "Biaya Operasional", "Laba Kotor", "Laba Bersih"],
          datasets: [
            {
              label: "Nilai (Rp)",
              data: chartData.values || [],
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
              },
            },
          },
        };

        return <Bar ref={chartRefs.profit_loss} data={data} options={options} />;
      }

      case "capital_structure": {
        const data = {
          labels: chartData.labels || [],
          datasets: [
            {
              label: "Sumber Modal",
              data: chartData.values || [],
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
            tooltip: {
              ...commonOptions.plugins.tooltip,
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = formatCurrency(context.parsed);
                  const percentage = chartData.percentages?.[context.dataIndex] || 0;
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        };

        return <Pie ref={chartRefs.capital_structure} data={data} options={options} />;
      }

      case "revenue_streams": {
        const data = {
          labels: chartData.labels || [],
          datasets: [
            {
              label: "Pendapatan/Bulan",
              data: chartData.values || [],
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
              },
            },
          },
        };

        return <Bar ref={chartRefs.revenue_streams} data={data} options={options} />;
      }

      case "expense_breakdown": {
        const data = {
          labels: chartData.labels || [],
          datasets: [
            {
              label: "Biaya Operasional",
              data: chartData.values || [],
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
            tooltip: {
              ...commonOptions.plugins.tooltip,
              callbacks: {
                label: (context) => {
                  return `${context.label}: ${formatCurrency(context.parsed)}`;
                },
              },
            },
          },
        };

        return <Pie ref={chartRefs.expense_breakdown} data={data} options={options} />;
      }

      case "feasibility": {
        const data = {
          labels: chartData.labels || ["ROI", "Payback Period", "Profit Margin"],
          datasets: [
            {
              label: "Nilai Aktual",
              data: chartData.values || [],
              backgroundColor: "#4f46e5",
              borderColor: "#4338ca",
              borderWidth: 2,
            },
            {
              label: "Target Ideal",
              data: chartData.targets || [],
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
            },
          },
        };

        return <Bar ref={chartRefs.feasibility} data={data} options={options} />;
      }

      case "forecast": {
        const forecastDataLocal = forecastData || generateForecastDataLocal();

        const data = {
          labels: forecastDataLocal.map((d) => d.month),
          datasets: [
            {
              label: "Proyeksi Pendapatan",
              data: forecastDataLocal.map((d) => d.projected_income),
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Proyeksi Biaya",
              data: forecastDataLocal.map((d) => d.projected_opex),
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Proyeksi Laba",
              data: forecastDataLocal.map((d) => d.projected_profit),
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79, 70, 229, 0.1)",
              fill: true,
              tension: 0.4,
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
              },
            },
          },
        };

        return <Line ref={chartRefs.forecast} data={data} options={options} />;
      }

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Chart tidak tersedia</p>
          </div>
        );
    }
  };

  const downloadChart = () => {
    const chartRef = chartRefs[activeChart];
    if (chartRef && chartRef.current) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${activeChart}-chart.png`;
      link.href = url;
      link.click();
      toast.success("Chart berhasil diunduh");
    }
  };

  const generateChartInsights = () => {
    switch (activeChart) {
      case "profit_loss":
        return [
          `Laba bersih bulanan: ${formatCurrency(plan.net_profit || 0)}`,
          `Margin profit: ${plan.profit_margin || 0}%`,
          (plan.net_profit || 0) > 0 ? "Usaha menunjukkan profitabilitas yang positif" : "Perlu evaluasi biaya operasional dan strategi pendapatan",
        ];

      case "capital_structure":
        const mainSource = plan.capital_sources?.[0];
        return [
          mainSource ? `Sumber modal utama: ${mainSource.source} (${mainSource.percentage}%)` : "Belum ada data modal",
          `Total modal awal: ${formatCurrency(plan.total_initial_capital || 0)}`,
          "Diversifikasi sumber modal dapat mengurangi risiko",
        ];

      case "revenue_streams":
        const topProduct = plan.sales_projections?.[0];
        return [topProduct ? `Produk unggulan: ${topProduct.product}` : "Belum ada data penjualan", `Total pendapatan bulanan: ${formatCurrency(plan.total_monthly_income || 0)}`, "Fokus pada produk dengan margin tertinggi"];

      case "expense_breakdown":
        const topExpense = plan.monthly_opex?.[0];
        return [topExpense ? `Biaya terbesar: ${topExpense.category}` : "Belum ada data biaya", `Total biaya operasional: ${formatCurrency(plan.total_monthly_opex || 0)}`, "Evaluasi efisiensi operasional secara berkala"];

      case "feasibility":
        return [`ROI saat ini: ${plan.roi_percentage || 0}% (Target: 25%)`, `Payback period: ${plan.payback_period || 0} bulan (Target: 24 bulan)`, `Status kelayakan: ${plan.feasibility_status || "Belum dianalisis"}`];

      case "forecast":
        return ["Proyeksi menunjukkan pertumbuhan 5% per bulan", "Biaya operasional diproyeksikan naik 2% per bulan", "Monitoring berkala diperlukan untuk validasi proyeksi"];

      default:
        return [];
    }
  };

  if (!plan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analisis Grafik Keuangan</h1>
            <p className="text-indigo-100">Visualisasi data rencana keuangan "{plan.plan_name}"</p>
          </div>

          <div className="flex gap-2">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-3 py-2 border border-white/20 bg-white/10 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white text-sm">
              <option value="monthly" className="text-gray-900">
                Bulanan
              </option>
              <option value="yearly" className="text-gray-900">
                Tahunan
              </option>
            </select>

            <button onClick={downloadChart} className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              <Download size={16} />
              Export
            </button>

            <button onClick={onBack} className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors">
              ← Kembali
            </button>
          </div>
        </div>
      </div>

      {/* Chart Type Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex overflow-x-auto gap-1">
          {chartTypes.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeChart === chart.id
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{chart.icon}</span>
              {chart.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Memuat data chart...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {chartTypes.find((chart) => chart.id === activeChart)?.icon}
                {chartTypes.find((chart) => chart.id === activeChart)?.name}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">Periode: {timeRange === "monthly" ? "Bulanan" : "Tahunan"}</div>
            </div>

            <div className="h-[400px]" data-chart-type={activeChart}>
              {renderChart()}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Insights:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {generateChartInsights().map((insight, index) => (
                  <p key={index}>• {insight}</p>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(plan.total_monthly_income || 0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pendapatan/Bln</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.roi_percentage || 0}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.profit_margin || 0}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Profit Margin</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.payback_period || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bulan Balik Modal</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanCharts;
