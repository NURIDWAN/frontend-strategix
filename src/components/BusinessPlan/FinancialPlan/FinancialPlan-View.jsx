import {
  Edit3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  Download,
  Building,
  Calendar,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { financialPlanApi } from "../../../services/businessPlan";
import FinancialPlanCharts from "./FinancialPlan-Charts"; // Import komponen charts
import { toast } from "react-toastify";

const FinancialPlanView = ({ plan, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  if (!plan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  {
    activeTab === "charts" && (
      <FinancialPlanCharts plan={plan} onBack={() => setActiveTab("summary")} />
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        label: "Draft",
      },
      active: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        label: "Aktif",
      },
      completed: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        label: "Selesai",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getFeasibilityBadge = (status) => {
    const feasibilityConfig = {
      Layak: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        label: "Layak",
      },
      "Cukup Layak": {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        label: "Cukup Layak",
      },
      "Tidak Layak": {
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        label: "Tidak Layak",
      },
    };

    const config = feasibilityConfig[status] || {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
      label: status,
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getCashFlowTypeBadge = (type) => {
    const typeConfig = {
      income: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        label: "Pendapatan",
        icon: ArrowUpCircle,
      },
      expense: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        label: "Pengeluaran",
        icon: ArrowDownCircle,
      },
    };

    const config = typeConfig[type] || typeConfig.income;
    const IconComponent = config.icon;

    return (
      <span
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  const handleGenerateReport = async (reportType, format = "json") => {
    try {
      setIsGeneratingReport(true);
      const response = await financialPlanApi.generateReport(plan.id, {
        report_type: reportType,
        format: format,
      });

      if (response.data.status === "success") {
        toast.success(`Laporan ${reportType} berhasil di-generate`);

        // Untuk format JSON, kita bisa menampilkan data di console atau modal
        if (format === "json") {
          console.log("Report Data:", response.data.data);
          // Bisa juga menampilkan di modal atau new tab
          const reportWindow = window.open("", "_blank");
          reportWindow.document.write(`
                    <html>
                        <head>
                            <title>Laporan ${reportType} - ${
            plan.plan_name
          }</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                .section { margin-bottom: 30px; }
                                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f5f5f5; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Laporan ${reportType}</h1>
                                <h2>${plan.plan_name}</h2>
                                <p>Dibuat: ${new Date().toLocaleDateString(
                                  "id-ID"
                                )}</p>
                            </div>
                            <pre>${JSON.stringify(
                              response.data.data,
                              null,
                              2
                            )}</pre>
                        </body>
                    </html>
                `);
          reportWindow.document.close();
        }
      } else {
        throw new Error(response.data.message || "Gagal generate laporan");
      }
    } catch (error) {
      console.error("Error generating report:", error);

      let errorMessage = "Gagal generate laporan";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Calculate cash flow totals
  const calculateCashFlowTotals = () => {
    const cashFlows = plan.cash_flow_simulation || [];

    const totals = {
      totalIncome: 0,
      totalExpense: 0,
      netCashFlow: 0,
    };

    cashFlows.forEach((flow) => {
      if (flow.type === "income") {
        totals.totalIncome += parseFloat(flow.amount) || 0;
      } else {
        totals.totalExpense += parseFloat(flow.amount) || 0;
      }
    });

    totals.netCashFlow = totals.totalIncome - totals.totalExpense;
    return totals;
  };

  const cashFlowTotals = calculateCashFlowTotals();

  const tabs = [
    { id: "summary", name: "Ringkasan", icon: "📊" },
    { id: "capital", name: "Modal & Investasi", icon: "💰" },
    { id: "operations", name: "Operasional", icon: "🏢" },
    { id: "sales", name: "Penjualan", icon: "📈" },
    { id: "cashflow", name: "Arus Kas", icon: "💸" },
    { id: "charts", name: "Grafik & Analisis", icon: "📉" },
    { id: "analysis", name: "Analisis", icon: "🔍" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detail Rencana Keuangan
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analisis lengkap rencana keuangan usaha
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(plan)}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Edit3 size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Plan Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {plan.plan_name}
              </h2>
              {getStatusBadge(plan.status)}
              {getFeasibilityBadge(plan.feasibility_status)}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Building size={14} />
                <span>{plan.business_background?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  Dibuat:{" "}
                  {new Date(plan.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>Durasi: {plan.plan_duration_months} bulan</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {plan.roi_percentage}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {plan.payback_period}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bulan Balik Modal
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {plan.profit_margin}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Margin</p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  plan.net_profit >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(plan.net_profit)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Laba/Bulan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex overflow-x-auto space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Ringkasan Keuangan Rencana Usaha
            </h3>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(plan.total_monthly_income)}
                </p>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  Pendapatan/Bulan
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(plan.total_monthly_opex)}
                </p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Pengeluaran/Bulan
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(plan.net_profit)}
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  Laba Bersih/Bulan
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <Calculator className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {plan.profit_margin}%
                </p>
                <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                  Margin Profit
                </p>
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Metrik
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bulanan
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tahunan
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Pendapatan
                    </td>
                    <td className="px-4 py-2 text-green-600 dark:text-green-400">
                      {formatCurrency(plan.total_monthly_income)}
                    </td>
                    <td className="px-4 py-2 text-green-600 dark:text-green-400">
                      {formatCurrency(plan.total_yearly_income)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Total pendapatan usaha
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Biaya Operasional
                    </td>
                    <td className="px-4 py-2 text-red-600 dark:text-red-400">
                      {formatCurrency(plan.total_monthly_opex)}
                    </td>
                    <td className="px-4 py-2 text-red-600 dark:text-red-400">
                      {formatCurrency(plan.total_monthly_opex * 12)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Biaya rutin bulanan
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Laba Kotor
                    </td>
                    <td className="px-4 py-2 text-blue-600 dark:text-blue-400">
                      {formatCurrency(plan.gross_profit)}
                    </td>
                    <td className="px-4 py-2 text-blue-600 dark:text-blue-400">
                      {formatCurrency(plan.gross_profit * 12)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Pendapatan - Biaya Operasional
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Laba Bersih
                    </td>
                    <td
                      className={`px-4 py-2 ${
                        plan.net_profit >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(plan.net_profit)}
                    </td>
                    <td
                      className={`px-4 py-2 ${
                        plan.net_profit >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(plan.net_profit * 12)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Setelah pajak & bunga
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Capital & Investment Tab */}
        {activeTab === "capital" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Sumber & Struktur Modal
            </h3>

            {/* Capital Sources */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sumber Modal
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nominal
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {(plan.capital_sources || []).map((source, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {source.source}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {formatCurrency(source.amount)}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {source.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Total Modal
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(plan.total_initial_capital)}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* CapEx */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Estimasi Biaya Awal (CapEx)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kategori
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {(plan.initial_capex || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {item.category}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                        Total CapEx
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(plan.total_capex)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Operations Tab */}
        {activeTab === "operations" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Biaya Operasional Bulanan (OpEx)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kategori Biaya
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nominal/Bulan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {(plan.monthly_opex || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {item.category}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Total Biaya Operasional/Bulan
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(plan.total_monthly_opex)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Proyeksi Penjualan & Pendapatan
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Produk/Layanan
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Harga Jual
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Volume/Bulan
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pendapatan/Bulan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {(plan.sales_projections || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {item.product}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {item.volume}
                      </td>
                      <td className="px-4 py-2 text-green-600 dark:text-green-400">
                        {formatCurrency(item.monthly_income)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <td
                      className="px-4 py-2 font-medium text-gray-900 dark:text-white"
                      colSpan="3"
                    >
                      Total Pendapatan/Bulan
                    </td>
                    <td className="px-4 py-2 font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(plan.total_monthly_income)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="px-4 py-2 font-medium text-gray-900 dark:text-white"
                      colSpan="3"
                    >
                      Total Pendapatan/Tahun
                    </td>
                    <td className="px-4 py-2 font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(plan.total_yearly_income)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Cash Flow Tab */}
        {activeTab === "cashflow" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Simulasi Arus Kas
            </h3>

            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <ArrowUpCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(cashFlowTotals.totalIncome)}
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  Total Pendapatan
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <ArrowDownCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(cashFlowTotals.totalExpense)}
                </p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Total Pengeluaran
                </p>
              </div>

              <div
                className={`rounded-lg p-4 text-center ${
                  cashFlowTotals.netCashFlow >= 0
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-orange-50 dark:bg-orange-900/20"
                }`}
              >
                <DollarSign
                  className={`w-8 h-8 mx-auto mb-2 ${
                    cashFlowTotals.netCashFlow >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
                <p
                  className={`text-2xl font-bold ${
                    cashFlowTotals.netCashFlow >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {formatCurrency(cashFlowTotals.netCashFlow)}
                </p>
                <p
                  className={`text-sm ${
                    cashFlowTotals.netCashFlow >= 0
                      ? "text-blue-600/80 dark:text-blue-400/80"
                      : "text-orange-600/80 dark:text-orange-400/80"
                  }`}
                >
                  Arus Kas Bersih
                </p>
              </div>
            </div>

            {/* Cash Flow Transactions */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tanggal
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jenis
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kategori
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Deskripsi
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nominal
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Metode Pembayaran
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {(plan.cash_flow_simulation || []).map((flow, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {formatDate(flow.date)}
                      </td>
                      <td className="px-4 py-2">
                        {getCashFlowTypeBadge(flow.type)}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {flow.category}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {flow.description}
                      </td>
                      <td
                        className={`px-4 py-2 font-medium ${
                          flow.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(flow.amount)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <CreditCard size={14} />
                          {flow.payment_method}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {(plan.cash_flow_simulation || []).length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <DollarSign className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Belum Ada Data Arus Kas
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Data simulasi arus kas belum diinputkan untuk rencana keuangan
                  ini.
                </p>
                <button
                  onClick={() => onEdit(plan)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit3 size={16} />
                  Tambah Data Arus Kas
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Analisis Kelayakan Finansial
            </h3>

            {/* Feasibility Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Indikator Kelayakan
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      ROI (Return on Investment):
                    </span>
                    <span
                      className={`font-medium ${
                        plan.roi_percentage >= 25
                          ? "text-green-600 dark:text-green-400"
                          : plan.roi_percentage >= 15
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {plan.roi_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Payback Period:
                    </span>
                    <span
                      className={`font-medium ${
                        plan.payback_period <= 12
                          ? "text-green-600 dark:text-green-400"
                          : plan.payback_period <= 24
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {plan.payback_period} bulan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Break Even Point:
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {plan.bep_amount} unit/bulan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Profit Margin:
                    </span>
                    <span
                      className={`font-medium ${
                        plan.profit_margin >= 20
                          ? "text-green-600 dark:text-green-400"
                          : plan.profit_margin >= 10
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {plan.profit_margin}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Status Kelayakan
                </h4>
                <div className="text-center py-4">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium ${
                      plan.feasibility_status === "Layak"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : plan.feasibility_status === "Cukup Layak"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    }`}
                  >
                    <BarChart3 size={20} />
                    {plan.feasibility_status}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {plan.feasibility_notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                Rekomendasi
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                {plan.roi_percentage < 15 && (
                  <li>
                    Pertimbangkan untuk meningkatkan efisiensi operasional untuk
                    meningkatkan ROI
                  </li>
                )}
                {plan.payback_period > 24 && (
                  <li>
                    Masa balik modal cukup panjang, pertimbangkan strategi untuk
                    mempercepat ROI
                  </li>
                )}
                {plan.profit_margin < 10 && (
                  <li>
                    Margin profit rendah, evaluasi struktur biaya dan strategi
                    pricing
                  </li>
                )}
                {plan.total_monthly_opex > plan.total_monthly_income * 0.7 && (
                  <li>
                    Biaya operasional terlalu tinggi dibandingkan pendapatan,
                    perlu optimasi
                  </li>
                )}
                {plan.roi_percentage >= 25 && plan.profit_margin >= 20 && (
                  <li>
                    Model bisnis menunjukkan kesehatan finansial yang baik,
                    pertahankan strategi saat ini
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <FinancialPlanCharts
            plan={plan}
            onBack={() => setActiveTab("summary")}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={() => onEdit(plan)}
            className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 size={16} />
            Edit Rencana Keuangan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanView;
