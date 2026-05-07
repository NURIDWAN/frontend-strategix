import { useState, useEffect } from "react";
import SummaryList from "./Summary-List";
import SummaryCreate from "./Summary-Create";
import SummaryView from "./Summary-View";
import YearDisplay from "./Year-Display";
import { managementFinancialApi } from "../../../services/managementFinancial";
import { toast } from "react-toastify";

const FinancialSummaries = ({ onBack, selectedBusiness }) => {
  const [summaries, setSummaries] = useState([]);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [view, setView] = useState("list"); // Default langsung ke list
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);

  // Load available years dari summaries yang ada
  useEffect(() => {
    if (summaries.length > 0) {
      const yearsFromSummaries = [...new Set(summaries.map((s) => s.year))];
      const allYears = [...new Set([...availableYears, ...yearsFromSummaries, currentYear])];
      setAvailableYears(allYears.sort((a, b) => b - a));
    }
  }, [summaries]);

  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(null); // null = semua bulan

  // Fetch semua summaries (support filter month - null untuk semua bulan)
  const fetchSummaries = async (year = selectedYear, month = selectedMonth) => {
    try {
      setIsLoading(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        throw new Error("User data not found. Please login again.");
      }

      if (!selectedBusiness) {
        setSummaries([]);
        setIsLoading(false);
        return;
      }

      const params = {
        user_id: user.id,
        business_background_id: selectedBusiness.id,
        year: year,
      };

      // Only add month if specified
      if (month) {
        params.month = month;
      }

      console.log("Fetching financial summaries with params:", params);
      const response = await managementFinancialApi.summaries.getAll(params);

      if (response.data && response.data.status === "success") {
        setSummaries(response.data.data || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch summaries");
      }
    } catch (error) {
      console.error("Error fetching summaries:", error);

      let errorMessage = "Gagal memuat data ringkasan keuangan";
      if (error.response?.status === 500) {
        errorMessage = "Server error: Silakan coba lagi nanti.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, selectedBusiness]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setError(null);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setError(null);
  };

  // Fetch available years from simulations API and merge with any local saved years
  const fetchAvailableYears = async () => {
    try {
      if (!selectedBusiness) {
        setAvailableYears([]);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user?.id,
        business_background_id: selectedBusiness.id,
      };

      const response = await managementFinancialApi.simulations.getAvailableYears(params);
      let apiYears = [];
      if (response?.data?.status === "success") {
        apiYears = response.data.data || [];
      }

      // Merge years from API, simulation_local, and user_local
      const savedUserYears = JSON.parse(localStorage.getItem("user_years") || "[]");
      const simYears = JSON.parse(localStorage.getItem("simulation_years") || "[]");

      const combined = Array.from(new Set([...(apiYears || []), ...(savedUserYears || []), ...(simYears || []), currentYear]));
      const sorted = combined.sort((a, b) => b - a);
      setAvailableYears(sorted);

      // Persist combined list so both Summary and Simulation can read the same source
      localStorage.setItem("user_years", JSON.stringify(sorted));

      // Ensure selectedYear is valid
      if (!sorted.includes(selectedYear)) {
        setSelectedYear(sorted[0]);
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
      // Fallback to localStorage if API fails
      try {
        const savedYears = JSON.parse(localStorage.getItem("user_years") || "[]");
        if (savedYears && savedYears.length > 0) {
          setAvailableYears(savedYears.sort((a, b) => b - a));
        } else {
          const defaultYears = [currentYear, currentYear - 1, currentYear + 1];
          setAvailableYears(defaultYears);
          localStorage.setItem("user_years", JSON.stringify(defaultYears));
        }
      } catch (e) {
        console.error("Error loading years fallback:", e);
        const defaultYears = [currentYear, currentYear - 1, currentYear + 1];
        setAvailableYears(defaultYears);
      }
    }
  };

  useEffect(() => {
    fetchAvailableYears();
  }, [selectedBusiness]);

  // Handler functions
  const handleView = (summary) => {
    setCurrentSummary(summary);
    setView("view");
  };

  const handleDelete = async (summaryId) => {
    try {
      setError(null);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await managementFinancialApi.summaries.delete(summaryId, user.id);

      if (response.data.status === "success") {
        await fetchSummaries();
      } else {
        throw new Error(response.data.message || "Failed to delete summary");
      }
    } catch (error) {
      console.error("Error deleting summary:", error);
      let errorMessage = "Terjadi kesalahan saat menghapus data ringkasan";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setCurrentSummary(null);
    setError(null);
  };

  const handleEdit = (summary) => {
    // Untuk saat ini, edit summary belum diimplementasikan
    // Bisa redirect ke form edit atau show toast
    toast.info("Fitur edit ringkasan akan segera tersedia", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleRetry = () => {
    setError(null);
    fetchSummaries();
  };

  // Render loading state
  if (isLoading && view === "list") {
    return (
      <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400">Memuat data ringkasan keuangan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render different views
  const renderView = () => {
    switch (view) {
      case "list":
        return (
          <SummaryList
            summaries={summaries}
            onView={handleView}
            onDelete={handleDelete}
            onCreateNew={() => setView("create")}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            onBack={onBack}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            selectedBusiness={selectedBusiness}
          />
        );
      case "create":
        return (
          <SummaryCreate
            onBack={handleBackToList}
            onSuccess={() => {
              setView("list");
              fetchSummaries();
            }}
            selectedYear={selectedYear}
          />
        );
      case "view":
        return <SummaryView summary={currentSummary} onBack={handleBackToList} onEdit={handleEdit} />;
      default:
        return (
          <SummaryList
            summaries={summaries}
            onView={handleView}
            onDelete={handleDelete}
            onCreateNew={() => setView("create")}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            onBack={onBack}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            selectedBusiness={selectedBusiness}
          />
        );
    }
  };

  return (
    <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
        {/* YearDisplay hanya untuk list view */}
        {view === "list" && <YearDisplay availableYears={availableYears} selectedYear={selectedYear} onYearChange={handleYearChange} summaries={summaries} />}

        {renderView()}
      </div>
    </div>
  );
};

export default FinancialSummaries;
