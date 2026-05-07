import { useState, useEffect } from "react";
import CategoryList from "./Category-List";
import CategoryCreate from "./Category-Create";
import CategoryEdit from "./Category-Edit";
import CategoryView from "./Category-View";
import { managementFinancialApi } from "../../../services/managementFinancial";

const FinancialCategories = ({ onBack, selectedBusiness }) => {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [view, setView] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch semua categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!selectedBusiness) {
        setCategories([]);
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const params = {
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      };

      console.log("Fetching financial categories with params:", params);
      const response = await managementFinancialApi.categories.getAll(params);

      console.log("API Response:", response.data);

      if (response.data.status === "success") {
        setCategories(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);

      let errorMessage = "Gagal memuat data kategori";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedBusiness]);

  // Handler functions
  const handleCreateNew = () => {
    setCurrentCategory(null);
    setView("create");
  };

  const handleView = (category) => {
    setCurrentCategory(category);
    setView("view");
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setView("edit");
  };

  const handleDelete = async (categoryId) => {
    try {
      setError(null);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await managementFinancialApi.categories.delete(categoryId, user.id);

      if (response.data.status === "success") {
        fetchCategories();
        setView("list");
      } else {
        throw new Error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      let errorMessage = "Terjadi kesalahan saat menghapus data kategori";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setCurrentCategory(null);
    setError(null);
  };

  const handleCreateSuccess = () => {
    fetchCategories();
    setView("list");
  };

  const handleUpdateSuccess = () => {
    fetchCategories();
    setView("list");
  };

  const handleRetry = () => {
    fetchCategories();
  };

  // Render loading state
  if (isLoading && view === "list") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Memuat data kategori...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && view === "list") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
      case "list":
        return <CategoryList categories={categories} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreateNew={handleCreateNew} isLoading={isLoading} error={error} onRetry={handleRetry} />;
      case "create":
        return <CategoryCreate onBack={handleBackToList} onSuccess={handleCreateSuccess} selectedBusiness={selectedBusiness} />;
      case "edit":
        return <CategoryEdit category={currentCategory} onBack={handleBackToList} onSuccess={handleUpdateSuccess} selectedBusiness={selectedBusiness} />;
      case "view":
        return <CategoryView category={currentCategory} onBack={handleBackToList} onEdit={handleEdit} />;
      default:
        return <CategoryList categories={categories} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onCreateNew={handleCreateNew} isLoading={isLoading} error={error} onRetry={handleRetry} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{renderView()}</div>
    </div>
  );
};

export default FinancialCategories;
