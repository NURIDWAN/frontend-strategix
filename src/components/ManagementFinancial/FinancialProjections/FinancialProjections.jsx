import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import financialProjectionApi from "../../../services/managementFinancial/financialProjectionApi";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, TrendingUp, Calculator, Eye, Trash2, BarChart3, DollarSign, Target, Clock } from "lucide-react";

function currency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function percentage(value) {
  const numValue = parseFloat(value) || 0;
  return `${numValue.toFixed(2)}%`;
}

const FinancialProjections = ({ selectedBusiness, onBack }) => {
  const { user } = useAuth();
  const [view, setView] = useState("list");
  const [projections, setProjections] = useState([]);
  const [currentProjection, setCurrentProjection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state for creating new projection
  const [formData, setFormData] = useState({
    projection_name: "",
    base_year: new Date().getFullYear(),
    growth_rate: 10,
    inflation_rate: 5,
    discount_rate: 10,
    initial_investment: 0,
  });

  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    if (selectedBusiness && user) {
      fetchProjections();
    }
  }, [selectedBusiness, user]);

  const fetchProjections = async () => {
    try {
      setIsLoading(true);
      const response = await financialProjectionApi.getAll({
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      });

      if (response.data.status === "success") {
        setProjections(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching projections:", error);
      setError("Gagal memuat data proyeksi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBaseline = async (baseYear) => {
    try {
      const response = await financialProjectionApi.getBaseline({
        user_id: user.id,
        business_background_id: selectedBusiness.id,
        base_year: baseYear,
      });

      if (response.data.status === "success") {
        setBaseline(response.data.data);
      } else {
        setBaseline(null);
        toast.error("Tidak ada data simulasi untuk tahun " + baseYear);
      }
    } catch (error) {
      console.error("Error fetching baseline:", error);
      setBaseline(null);
      toast.error("Gagal memuat data baseline");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("rate") || name === "initial_investment" ? parseFloat(value) || 0 : value,
    }));

    // Fetch baseline when base_year changes
    if (name === "base_year") {
      fetchBaseline(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!baseline) {
      toast.error("Data baseline tidak tersedia untuk tahun ini");
      return;
    }

    try {
      setIsLoading(true);
      const response = await financialProjectionApi.create({
        ...formData,
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      });

      if (response.data.status === "success") {
        toast.success("Proyeksi berhasil dibuat!");
        setView("list");
        fetchProjections();
        setFormData({
          projection_name: "",
          base_year: new Date().getFullYear(),
          growth_rate: 10,
          inflation_rate: 5,
          discount_rate: 10,
          initial_investment: 0,
        });
      }
    } catch (error) {
      console.error("Error creating projection:", error);
      toast.error("Gagal membuat proyeksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (projection) => {
    try {
      const response = await financialProjectionApi.show(projection.id);
      if (response.data.status === "success") {
        setCurrentProjection(response.data.data);
        setView("detail");
      }
    } catch (error) {
      console.error("Error fetching projection detail:", error);
      toast.error("Gagal memuat detail proyeksi");
    }
  };

  const handleDelete = async (projectionId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyeksi ini?")) return;

    try {
      const response = await financialProjectionApi.delete(projectionId, user.id);
      if (response.data.status === "success") {
        toast.success("Proyeksi berhasil dihapus");
        fetchProjections();
      }
    } catch (error) {
      console.error("Error deleting projection:", error);
      toast.error("Gagal menghapus proyeksi");
    }
  };

  // Start fetching baseline for initial base_year
  useEffect(() => {
    if (view === "create" && formData.base_year && selectedBusiness && user) {
      fetchBaseline(formData.base_year);
    }
  }, [view, formData.base_year, selectedBusiness, user]);

  if (view === "create") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Buat Proyeksi Keuangan 5 Tahun</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Proyeksi berdasarkan data simulasi keuangan</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parameter Proyeksi</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Proyeksi *</label>
                  <input
                    type="text"
                    name="projection_name"
                    value={formData.projection_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Contoh: Proyeksi Ekspansi 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tahun Dasar *</label>
                  <input
                    type="number"
                    name="base_year"
                    value={formData.base_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tingkat Pertumbuhan Pendapatan (% per tahun) *</label>
                  <input
                    type="number"
                    name="growth_rate"
                    value={formData.growth_rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    step="0.1"
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tingkat Inflasi Biaya (% per tahun) *</label>
                  <input
                    type="number"
                    name="inflation_rate"
                    value={formData.inflation_rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    step="0.1"
                    placeholder="5"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Discount Rate (% per tahun) *</label>
                  <input
                    type="number"
                    name="discount_rate"
                    value={formData.discount_rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    step="0.1"
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Investasi Awal (Rp) *</label>
                  <input
                    type="number"
                    name="initial_investment"
                    value={formData.initial_investment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    placeholder="100000000"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Baseline Data */}
          {baseline && (
            <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl dark:bg-blue-900/20 dark:border-blue-800">
              <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">📊 Data Baseline & Posisi Kas Terkini</h3>

              {/* Cash Position Summary */}
              <div className="p-4 mb-4 bg-white border border-blue-300 rounded-lg dark:bg-gray-800 dark:border-blue-700">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Posisi Kas Saat Ini</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Modal Awal</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currency(baseline.initial_investment || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400">Total Pendapatan</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">+{currency(baseline.accumulated_income || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400">Total Pengeluaran</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">-{currency(baseline.accumulated_expense || 0)}</p>
                  </div>
                  <div className="p-3 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <p className="text-xs opacity-90">💰 Kas Terkini</p>
                    <p className="text-xl font-bold">{currency(baseline.current_cash_balance || 0)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Dari {baseline.all_simulation_count || 0} total transaksi simulasi</p>
              </div>

              {/* Baseline Year Performance */}
              <div className="p-4 bg-white border border-blue-200 rounded-lg dark:bg-gray-800 dark:border-blue-700">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Performa Tahun {baseline.base_year} (Baseline untuk Proyeksi)</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Pendapatan Tahun Ini</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{currency(baseline.total_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Biaya Tahun Ini</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{currency(baseline.total_cost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Laba Bersih</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{currency(baseline.net_profit)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Berdasarkan {baseline.simulation_count} transaksi di tahun {baseline.base_year}
                </p>
              </div>

              <div className="p-3 mt-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Catatan:</strong> Proyeksi NPV akan dihitung berdasarkan <strong>Kas Terkini ({currency(baseline.current_cash_balance || 0)})</strong>, bukan modal awal. Ini mencerminkan kondisi riil bisnis Anda saat ini.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setView("list")} className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" disabled={isLoading}>
              Batal
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={isLoading || !baseline}>
              <Calculator size={16} />
              {isLoading ? "Membuat Proyeksi..." : "Buat Proyeksi"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "detail" && currentProjection) {
    return <ProjectionDetail projection={currentProjection} onBack={() => setView("list")} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Proyeksi Keuangan 5 Tahun</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analisis proyeksi berdasarkan data historis</p>
          </div>
        </div>
        <button onClick={() => setView("create")} className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          Buat Proyeksi
        </button>
      </div>

      {/* Error State */}
      {error && <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">{error}</div>}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <span className="text-gray-600 dark:text-gray-300">Memuat data proyeksi...</span>
          </div>
        </div>
      )}

      {/* Projections List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {projections.length === 0 ? (
            <div className="py-12 text-center">
              <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Belum ada proyeksi</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">Mulai dengan membuat proyeksi keuangan pertama Anda</p>
              <button onClick={() => setView("create")} className="flex items-center gap-2 px-4 py-2 mx-auto text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Plus size={16} />
                Buat Proyeksi Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projections.map((projection) => (
                <ProjectionCard key={projection.id} projection={projection} onView={handleView} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectionCard = ({ projection, onView, onDelete }) => {
  const getScenarioColor = (scenario) => {
    switch (scenario) {
      case "optimistic":
        return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20";
      case "realistic":
        return "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20";
      case "pessimistic":
        return "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20";
      default:
        return "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/20";
    }
  };

  // Safe handling untuk data projection card
  const safeProjection = {
    id: projection?.id || 0,
    projection_name: projection?.projection_name || "Nama Proyeksi",
    base_year: projection?.base_year || new Date().getFullYear(),
    display_scenario: projection?.display_scenario || "Skenario",
    scenario_type: projection?.scenario_type || "realistic",
    formatted_npv: projection?.formatted_npv || "Rp 0",
    formatted_roi: projection?.formatted_roi || "0%",
    formatted_payback: projection?.formatted_payback || "0 tahun",
  };

  return (
    <div className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{safeProjection.projection_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tahun Dasar: {safeProjection.base_year}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScenarioColor(safeProjection.scenario_type)}`}>{safeProjection.display_scenario}</span>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={16} className="text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">NPV:</span>
          <span className="font-medium text-gray-900 dark:text-white">{safeProjection.formatted_npv}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">ROI:</span>
          <span className="font-medium text-gray-900 dark:text-white">{safeProjection.formatted_roi}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Payback:</span>
          <span className="font-medium text-gray-900 dark:text-white">{safeProjection.formatted_payback}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onView(safeProjection)} className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
          <Eye size={14} />
          Detail
        </button>
        <button onClick={() => onDelete(safeProjection.id)} className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const ProjectionDetail = ({ projection, onBack }) => {
  const yearlyData = projection?.yearly_projections || [];

  // Safe handling untuk data yang mungkin tidak lengkap
  const safeProjection = {
    projection_name: projection?.projection_name || "Nama Proyeksi",
    display_scenario: projection?.display_scenario || "Skenario",
    base_year: projection?.base_year || new Date().getFullYear(),
    formatted_npv: projection?.formatted_npv || "Rp 0",
    formatted_roi: projection?.formatted_roi || "0%",
    formatted_irr: projection?.formatted_irr || "0%",
    formatted_payback: projection?.formatted_payback || "0 tahun",
    growth_rate: parseFloat(projection?.growth_rate) || 0,
    inflation_rate: parseFloat(projection?.inflation_rate) || 0,
    discount_rate: parseFloat(projection?.discount_rate) || 0,
    initial_investment: parseFloat(projection?.initial_investment) || 0,
    current_cash_balance: parseFloat(projection?.current_cash_balance) || 0,
    accumulated_income: parseFloat(projection?.accumulated_income) || 0,
    accumulated_expense: parseFloat(projection?.accumulated_expense) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{safeProjection.projection_name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Skenario {safeProjection.display_scenario} - Tahun Dasar {safeProjection.base_year}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Target className="text-green-600 dark:text-green-400" size={20} />
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">NPV</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">{safeProjection.formatted_npv}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">ROI</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{safeProjection.formatted_roi}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <Calculator className="text-purple-600 dark:text-purple-400" size={20} />
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300">IRR</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{safeProjection.formatted_irr}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <Clock className="text-orange-600 dark:text-orange-400" size={20} />
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-300">Payback</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{safeProjection.formatted_payback}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Projections Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Proyeksi 5 Tahun ({safeProjection.base_year + 1} - {safeProjection.base_year + 5})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <th className="px-4 py-3 font-semibold text-left text-gray-900 dark:text-white">Tahun</th>
                  <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Pendapatan</th>
                  <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Biaya</th>
                  <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Laba Bersih</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Tahun {data.year}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{currency(data.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{currency(data.cost)}</td>
                    <td className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">{currency(data.net_profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="p-6 border border-gray-200 bg-gray-50 rounded-xl dark:bg-gray-700/50 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Asumsi & Posisi Awal</h3>

        {/* Cash Position */}
        <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
          <h4 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">💰 Posisi Kas</h4>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Modal Awal</p>
              <p className="font-semibold text-gray-900 dark:text-white">{currency(safeProjection.initial_investment)}</p>
            </div>
            <div>
              <p className="text-green-600 dark:text-green-400">Akumulasi Pendapatan</p>
              <p className="font-semibold text-green-700 dark:text-green-300">+{currency(safeProjection.accumulated_income)}</p>
            </div>
            <div>
              <p className="text-red-600 dark:text-red-400">Akumulasi Pengeluaran</p>
              <p className="font-semibold text-red-700 dark:text-red-300">-{currency(safeProjection.accumulated_expense)}</p>
            </div>
            <div className="p-2 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <p className="text-xs opacity-90">Kas Terkini</p>
              <p className="text-lg font-bold">{currency(safeProjection.current_cash_balance)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">ℹ️ NPV dihitung dari posisi kas terkini, mencerminkan kondisi riil bisnis</p>
        </div>

        {/* Projection Assumptions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pertumbuhan Revenue</p>
            <p className="font-medium text-gray-900 dark:text-white">{percentage(safeProjection.growth_rate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inflasi Biaya</p>
            <p className="font-medium text-gray-900 dark:text-white">{percentage(safeProjection.inflation_rate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discount Rate</p>
            <p className="font-medium text-gray-900 dark:text-white">{percentage(safeProjection.discount_rate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProjections;
