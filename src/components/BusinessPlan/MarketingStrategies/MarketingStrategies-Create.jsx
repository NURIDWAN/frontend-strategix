import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import MarketingStrategiesForm from "./MarketingStrategies-Form";
import {
  marketingStrategiesApi,
  backgroundApi,
} from "../../../services/businessPlan";
import { toast } from "react-toastify";

const MarketingStrategiesCreate = ({ onBack, onSuccess }) => {
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
      const response = await backgroundApi.getAll();

      if (response.data.status === "success") {
        setBusinesses(response.data.data || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch business backgrounds"
        );
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memuat data bisnis";
      toast.error(errorMessage);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: business background harus dipilih
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

      console.log("Creating marketing strategy with data:", submitData);

      const response = await marketingStrategiesApi.create(submitData);

      if (response.data.status === "success") {
        toast.success("Strategi pemasaran berhasil dibuat!");
        onSuccess();
      } else {
        throw new Error(
          response.data.message ||
            "Terjadi kesalahan saat membuat strategi pemasaran"
        );
      }
    } catch (error) {
      console.error("Error creating marketing strategy:", error);

      let errorMessage = "Terjadi kesalahan saat membuat strategi pemasaran";
      if (error.response?.status === 403) {
        errorMessage =
          "Anda tidak memiliki izin untuk membuat data ini. Pastikan login dengan benar.";
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
      console.log("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MarketingStrategiesForm
      title="Tambah Strategi Pemasaran"
      subtitle="Isi formulir untuk menambahkan strategi pemasaran baru"
      formData={formData}
      businesses={businesses}
      isLoadingBusinesses={isLoadingBusinesses}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      submitButtonText="Simpan Strategi"
      submitButtonIcon={<Save size={16} />}
      mode="create"
    />
  );
};

export default MarketingStrategiesCreate;
