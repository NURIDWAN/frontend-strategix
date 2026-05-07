import { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { BarChart3, TrendingUp } from "lucide-react";
import { managementFinancialApi } from "../../../services/managementFinancial";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const SummaryChart = ({ selectedYear }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchChartData();
  }, [selectedYear]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const businesses = JSON.parse(localStorage.getItem("user_businesses") || "[]");
      const businessId = businesses[0]?.id;

      const params = {
        user_id: user.id,
        year: selectedYear,
      };

      if (businessId) {
        params.business_id = businessId;
      }

      const response = await managementFinancialApi.summaries.getMonthlyComparison(params);

      if (response.data.status === "success") {
        const data = response.data.data;

        // Prepare chart data
        const labels = data.map((item) => item.month_name);
        const incomeData = data.map((item) => item.total_income);
        const expenseData = data.map((item) => item.total_expense);
        const profitData = data.map((item) => item.net_profit);

        setChartData({
          labels,
          datasets: [
            {
              label: "Pendapatan",
              data: incomeData,
              borderColor: "rgb(34, 197, 94)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "rgb(34, 197, 94)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
            {
              label: "Pengeluaran",
              data: expenseData,
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "rgb(239, 68, 68)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
            {
              label: "Laba Bersih",
              data: profitData,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "rgb(59, 130, 246)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              notation: "compact",
              compactDisplay: "short",
            }).format(value);
          },
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grafik Pendapatan vs Pengeluaran</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tahun {selectedYear}</p>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memuat grafik...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grafik Pendapatan vs Pengeluaran</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tahun {selectedYear}</p>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Generate ringkasan keuangan terlebih dahulu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grafik Pendapatan vs Pengeluaran</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Perbandingan keuangan bulanan - Tahun {selectedYear}</p>
        </div>
      </div>
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SummaryChart;
