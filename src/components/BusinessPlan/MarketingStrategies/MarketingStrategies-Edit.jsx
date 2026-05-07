import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import MarketingStrategiesForm from "./MarketingStrategies-Form";
import {
  marketingStrategiesApi,
  backgroundApi,
} from "../../../services/businessPlan";
import { toast } from "react-toastify";

const MarketingStrategiesEdit = ({ strategy, onBack, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

  const [formData, setFormData] = useState({
    business_background_id: "",
    promotion_strategy: "",
    media_used: "",
    pricing_strategy: "",
    monthly_target: "",
    collaboration_plan: "",
    status: "draft",
  });

  // Fetch business backgrounds untuk dropdown
  const fetchBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        toast.error("User tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await backgroundApi.getAll({ user_id: user.id });
      if (response.data.status === "success") {
        setBusinesses(response.data.data || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch business backgrounds"
        );
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal memuat data bisnis"
      );
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  // Set form data awal ketika strategy tersedia
  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (strategy) {
      setFormData({
        business_background_id: strategy.business_background_id || "",
        promotion_strategy: strategy.promotion_strategy || "",
        media_used: strategy.media_used || "",
        pricing_strategy: strategy.pricing_strategy || "",
        monthly_target: strategy.monthly_target?.toString() || "",
        collaboration_plan: strategy.collaboration_plan || "",
        status: strategy.status || "draft",
      });
    }
  }, [strategy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.business_background_id) {
      toast.error("Pilih bisnis terlebih dahulu");
      return;
    }

    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id)
        throw new Error("User data not found. Please login again.");

      const submitData = {
        user_id: user.id,
        business_background_id: formData.business_background_id,
        promotion_strategy: formData.promotion_strategy.trim() || "",
        media_used: formData.media_used.trim() || "",
        pricing_strategy: formData.pricing_strategy.trim() || "",
        monthly_target: formData.monthly_target
          ? parseInt(formData.monthly_target)
          : 0,
        collaboration_plan: formData.collaboration_plan.trim() || "",
        status: formData.status,
      };

      console.log(submitData);

      console.log("Updating marketing strategy with data:", submitData);

      const response = await marketingStrategiesApi.update(
        strategy.id,
        submitData
      );

      if (response.data.status === "success") {
        toast.success("Strategi pemasaran berhasil diperbarui!");
        if (onSuccess) onSuccess(response.data.data);
      } else {
        throw new Error(
          response.data.message ||
            "Terjadi kesalahan saat memperbarui strategi pemasaran"
        );
      }
    } catch (error) {
      console.error("Error updating marketing strategy:", error);

      let errorMessage =
        "Terjadi kesalahan saat memperbarui strategi pemasaran";
      if (error.response?.status === 403) {
        errorMessage =
          "Anda tidak memiliki izin untuk mengubah data ini. Pastikan data ini milik Anda.";
      } else if (
        error.response?.status === 422 &&
        error.response.data?.errors
      ) {
        const firstError = Object.values(error.response.data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!strategy) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data strategi pemasaran...</p>
        </div>
      </div>
    );
  }

  return (
    <MarketingStrategiesForm
      title="Edit Strategi Pemasaran"
      subtitle="Perbarui informasi strategi pemasaran"
      formData={formData}
      businesses={businesses}
      isLoadingBusinesses={isLoadingBusinesses}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      submitButtonText="Perbarui Strategi"
      submitButtonIcon={<Save size={16} />}
      mode="edit"
      existingStrategy={strategy}
    />
  );
};

export default MarketingStrategiesEdit;
