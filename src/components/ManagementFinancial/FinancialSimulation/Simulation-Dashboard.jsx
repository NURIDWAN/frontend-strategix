// frontend/src/components/ManagementFinancial/FinancialSimulation/Simulation-Dashboard.jsx

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Plus, List, DollarSign, Calendar, PieChart, BarChart3 } from "lucide-react";
import { managementFinancialApi } from "../../../services/managementFinancial";
import YearManagement from "./Year-Management";

const SimulationDashboard = ({ simulations, categories, filters, onFilterChange, onViewSimulation, onEditSimulation, onDeleteSimulation, onCreateNew, onViewChange, isLoading, selectedBusiness, availableYears = [], onAddYear, onDeleteYear }) => {
  const [cashFlowSummary, setCashFlowSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Fetch cash flow summary
  const fetchCashFlowSummary = async () => {
    if (!selectedBusiness) {
      setCashFlowSummary(null);
      setSummaryLoading(false);
      return;
    }

    try {
      setSummaryLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user.id,
        business_background_id: selectedBusiness.id,
        year: filters.year,
      };

      // Only add month if it's specified
      if (filters.month) {
        params.month = filters.month;
      }

      const response = await managementFinancialApi.simulations.getCashFlowSummary(params);
      if (response.data.status === "success") {
        setCashFlowSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching cash flow summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowSummary();
  }, [filters.year, filters.month, selectedBusiness]);

  // Calculate quick stats from simulations
  const completedIncome = simulations.filter((s) => s.type === "income" && s.status === "completed").reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const completedExpense = simulations.filter((s) => s.type === "expense" && s.status === "completed").reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const plannedIncome = simulations.filter((s) => s.type === "income" && s.status === "planned").reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const plannedExpense = simulations.filter((s) => s.type === "expense" && s.status === "planned").reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[month - 1] || "";
  };

  const handleAddYear = async (year) => {
    // Call parent handler to add year to availableYears and localStorage
    await onAddYear(year);
  };

  const handleDeleteYear = async (year) => {
    // Call parent handler to delete year
    await onDeleteYear(year);
  };

  const handleYearChange = (year) => {
    onFilterChange({ ...filters, year });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulasi Arus Kas</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola dan pantau simulasi keuangan Anda</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onViewChange("list")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <List size={16} />
            Lihat Semua
          </button>
          <button onClick={onCreateNew} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Tambah Simulasi
          </button>
        </div>
      </div>

      {/* Year Management */}
      <YearManagement
        availableYears={availableYears}
        selectedYear={filters.year}
        onYearChange={handleYearChange}
        onAddYear={handleAddYear}
        onDeleteYear={handleDeleteYear}
        simulations={simulations}
      />

      {/* Month Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ ...filters, year: parseInt(e.target.value) })}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              )}
            </select>
            <select
              value={filters.month}
              onChange={(e) => onFilterChange({ ...filters, month: e.target.value ? parseInt(e.target.value) : '' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                return (
                  <option key={month} value={month}>
                    {months[month - 1]}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Helper Text */}
      {filters.year && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Filter aktif:</span> Tahun {filters.year}{filters.month && ` • Bulan ${["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][filters.month]}`}
          </p>
        </div>
      )}

      {/* Cash Flow Summary */}
      {!summaryLoading && cashFlowSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Income */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(cashFlowSummary.summary.total_income)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+ {formatCurrency(cashFlowSummary.summary.planned_income)} rencana</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          {/* Total Expense */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(cashFlowSummary.summary.total_expense)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+ {formatCurrency(cashFlowSummary.summary.planned_expense)} rencana</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arus Kas Bersih</p>
                <p className={`text-2xl font-bold mt-1 ${cashFlowSummary.summary.net_cash_flow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(cashFlowSummary.summary.net_cash_flow)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Realisasi</p>
              </div>
              <div className={`p-3 rounded-full ${cashFlowSummary.summary.net_cash_flow >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
                <DollarSign className={cashFlowSummary.summary.net_cash_flow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} size={24} />
              </div>
            </div>
          </div>

          {/* Projected Cash Flow */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyeksi Arus Kas</p>
                <p className={`text-2xl font-bold mt-1 ${cashFlowSummary.summary.projected_net_cash_flow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(cashFlowSummary.summary.projected_net_cash_flow)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Termasuk rencana</p>
              </div>
              <div className={`p-3 rounded-full ${cashFlowSummary.summary.projected_net_cash_flow >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
                <BarChart3 className={cashFlowSummary.summary.projected_net_cash_flow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Simulasi</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{simulations.length}</p>
            </div>
            <PieChart className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Simulasi Rencana</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{simulations.filter((s) => s.status === "planned").length}</p>
            </div>
            <Calendar className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Simulasi Selesai</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{simulations.filter((s) => s.status === "completed").length}</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Bulan Tercatat</p>
          <div className="flex flex-wrap gap-1">
            {simulations.length > 0 ? (
              Array.from(new Set(simulations.map(s => new Date(s.simulation_date).getMonth() + 1)))
                .sort((a, b) => a - b)
                .map(month => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                  return (
                    <span key={month} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                      {monthNames[month - 1]}
                    </span>
                  );
                })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-xs">-</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Simulations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simulasi Terbaru</h3>
        </div>
        <div className="p-6">
          {simulations.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada simulasi</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Mulai dengan menambahkan simulasi pertama Anda</p>
              <button onClick={onCreateNew} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                Tambah Simulasi Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.slice(0, 5).map((simulation) => (
                <div key={simulation.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${simulation.category?.color || "#6B7280"}20`,
                        border: `2px solid ${simulation.category?.color || "#6B7280"}`,
                      }}
                    >
                      {simulation.type === "income" ? <TrendingUp size={16} style={{ color: simulation.category?.color || "#6B7280" }} /> : <TrendingDown size={16} style={{ color: simulation.category?.color || "#6B7280" }} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{simulation.description || simulation.category?.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {simulation.category?.name} • {new Date(simulation.simulation_date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${simulation.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {simulation.type === "income" ? "+" : "-"} {formatCurrency(simulation.amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${simulation.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                          : simulation.status === "planned"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                        }`}
                    >
                      {simulation.status === "completed" ? "Selesai" : simulation.status === "planned" ? "Rencana" : "Dibatalkan"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationDashboard;
