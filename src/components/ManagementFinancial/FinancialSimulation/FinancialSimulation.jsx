import { useState, useEffect } from "react";
import SimulationList from "./Simulation-List";
import SimulationCreate from "./Simulation-Create";
import SimulationEdit from "./Simulation-Edit";
import SimulationView from "./Simulation-View";
import SimulationDashboard from "./Simulation-Dashboard";
import { managementFinancialApi } from "../../../services/managementFinancial";

const FinancialSimulation = ({ onBack, selectedBusiness }) => {
  const [simulations, setSimulations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard, list, create, edit, view
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    category_id: "",
    year: "",
    month: new Date().getMonth() + 1,
  });

  // Fetch semua simulations
  const fetchSimulations = async (filterParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!selectedBusiness) {
        setSimulations([]);
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user.id,
        business_background_id: selectedBusiness.id,
        ...filters,
        ...filterParams,
      };

      console.log("Fetching financial simulations with params:", params);
      const response = await managementFinancialApi.simulations.getAll(params);

      console.log("API Response:", response.data);

      if (response.data.status === "success") {
        setSimulations(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch simulations");
      }
    } catch (error) {
      console.error("Error fetching simulations:", error);
      handleError(error, "Gagal memuat data simulasi");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories untuk dropdown
  const fetchCategories = async () => {
    try {
      if (!selectedBusiness) {
        setCategories([]);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      };

      const response = await managementFinancialApi.categories.getAll(params);
      if (response.data.status === "success") {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      if (!selectedBusiness) {
        setAvailableYears([]);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      };

      const response = await managementFinancialApi.simulations.getAvailableYears(params);
      if (response.data.status === "success") {
        setAvailableYears(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  const handleError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    if (error.response) {
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    } else {
      errorMessage = error.message;
    }
    setError(errorMessage);
  };

  useEffect(() => {
    // Load saved years from localStorage first
    try {
      const savedYears = JSON.parse(localStorage.getItem("simulation_years"));
      if (savedYears && savedYears.length > 0) {
        setAvailableYears(savedYears.sort((a, b) => b - a));
        // Set default filter year if not set
        if (!filters.year) {
          setFilters(prev => ({ ...prev, year: savedYears[0] }));
        }
      } else {
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear]);
        localStorage.setItem("simulation_years", JSON.stringify([currentYear]));
        if (!filters.year) {
          setFilters(prev => ({ ...prev, year: currentYear }));
        }
      }
    } catch (error) {
      console.error("Error loading years from localStorage:", error);
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear]);
      if (!filters.year) {
        setFilters(prev => ({ ...prev, year: currentYear }));
      }
    }

    // Then fetch data
    fetchSimulations();
    fetchCategories();
    fetchAvailableYears();
  }, [selectedBusiness]);

  // Handler functions
  const handleCreateNew = () => {
    setCurrentSimulation(null);
    setView("create");
  };

  const handleView = (simulation) => {
    setCurrentSimulation(simulation);
    setView("view");
  };

  const handleEdit = (simulation) => {
    setCurrentSimulation(simulation);
    setView("edit");
  };

  const handleDelete = async (simulationId) => {
    try {
      setError(null);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await managementFinancialApi.simulations.delete(simulationId, user.id);

      if (response.data.status === "success") {
        fetchSimulations();
        if (view === "view" || view === "edit") {
          setView("list");
        }
      } else {
        throw new Error(response.data.message || "Failed to delete simulation");
      }
    } catch (error) {
      console.error("Error deleting simulation:", error);
      handleError(error, "Terjadi kesalahan saat menghapus data simulasi");
    }
  };

  const handleBackToList = () => {
    setView("list");
    setCurrentSimulation(null);
    setError(null);
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setCurrentSimulation(null);
    setError(null);
  };

  const handleCreateSuccess = () => {
    fetchSimulations();
    setView("list");
  };

  const handleUpdateSuccess = () => {
    fetchSimulations();
    setView("list");
  };

  const handleRetry = () => {
    setError(null);
    fetchSimulations();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchSimulations(newFilters);
  };

  const handleAddYear = async (year) => {
    // Add year to availableYears and save to localStorage
    if (!availableYears.includes(year)) {
      const newYears = [...availableYears, year].sort((a, b) => b - a);
      setAvailableYears(newYears);

      // Save to localStorage for persistence
      const simulationYears = JSON.parse(localStorage.getItem("simulation_years") || "[]");
      localStorage.setItem("simulation_years", JSON.stringify([...simulationYears, year].filter((v, i, a) => a.indexOf(v) === i)));

      // Switch to the newly added year and fetch data
      const newFilters = { ...filters, year };
      setFilters(newFilters);
      fetchSimulations(newFilters);
    }
  };

  const handleDeleteYear = async (year) => {
    try {
      // Delete all simulations in this year
      const simulationsInYear = simulations.filter(s => s.year === year);
      for (const simulation of simulationsInYear) {
        const user = JSON.parse(localStorage.getItem("user"));
        await managementFinancialApi.simulations.delete(simulation.id, user.id);
      }

      // Update availableYears
      const newYears = availableYears.filter(y => y !== year);
      setAvailableYears(newYears);

      // Update localStorage
      localStorage.setItem("simulation_years", JSON.stringify(newYears));

      // If deleted year was selected, switch to another year
      if (filters.year === year) {
        const currentYear = new Date().getFullYear();
        const newSelectedYear = newYears.includes(currentYear) ? currentYear : newYears[0];
        setFilters({ ...filters, year: newSelectedYear });
        fetchSimulations({ ...filters, year: newSelectedYear });
      } else {
        fetchSimulations();
      }
    } catch (error) {
      console.error("Error deleting year:", error);
      throw error;
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setCurrentSimulation(null);
    setError(null);
  };

  // Render loading state
  if (isLoading && (view === "list" || view === "dashboard")) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Memuat data simulasi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && (view === "list" || view === "dashboard")) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Gagal Memuat Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleRetry} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Coba Lagi
              </button>
              <button onClick={() => window.location.reload()} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                Refresh Halaman
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render different views
  const renderView = () => {
    switch (view) {
      case "dashboard":
        return (
          <SimulationDashboard
            simulations={simulations}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewSimulation={handleView}
            onEditSimulation={handleEdit}
            onDeleteSimulation={handleDelete}
            onCreateNew={handleCreateNew}
            onViewChange={handleViewChange}
            isLoading={isLoading}
            selectedBusiness={selectedBusiness}
            availableYears={availableYears}
            onAddYear={handleAddYear}
            onDeleteYear={handleDeleteYear}
          />
        );
      case "list":
        return (
          <SimulationList
            simulations={simulations}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
            onBackToDashboard={handleBackToDashboard}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            availableYears={availableYears}
          />
        );
      case "create":
        return <SimulationCreate categories={categories} onBack={handleBackToList} onSuccess={handleCreateSuccess} selectedBusiness={selectedBusiness} />;
      case "edit":
        return <SimulationEdit simulation={currentSimulation} categories={categories} onBack={handleBackToList} onSuccess={handleUpdateSuccess} selectedBusiness={selectedBusiness} />;
      case "view":
        return <SimulationView simulation={currentSimulation} onBack={handleBackToList} onEdit={handleEdit} />;
      default:
        return (
          <SimulationDashboard
            simulations={simulations}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewSimulation={handleView}
            onEditSimulation={handleEdit}
            onDeleteSimulation={handleDelete}
            onCreateNew={handleCreateNew}
            selectedBusiness={selectedBusiness}
            onViewChange={handleViewChange}
            isLoading={isLoading}
            availableYears={availableYears}
            onAddYear={handleAddYear}
            onDeleteYear={handleDeleteYear}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{renderView()}</div>
    </div>
  );
};

export default FinancialSimulation;
