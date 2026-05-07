import { useState } from "react";
import { Save } from "lucide-react";
import CategoryForm from "./Category-Form";
import { managementFinancialApi } from "../../../services/managementFinancial";
import { toast } from "react-toastify";

const CategoryCreate = ({ onBack, onSuccess, selectedBusiness }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "#3B82F6", // Default blue
    status: "actual",
    description: "",
    category_subtype: "other",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto set color based on type if not manually set
      ...(name === "type" &&
        !prev.color && {
        color: value === "income" ? "#10B981" : "#EF4444",
      }),
      // Auto set default subtype when type changes
      ...(name === "type" && {
        category_subtype: value === "income" ? "operating_revenue" : "operating_expense",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        throw new Error("User data not found");
      }

      if (!selectedBusiness || !selectedBusiness.id) {
        throw new Error("Business not selected");
      }

      const submitData = {
        ...formData,
        user_id: user.id,
        business_background_id: selectedBusiness.id,
      };

      console.log("Creating financial category:", submitData);
      const response = await managementFinancialApi.categories.create(submitData);

      if (response.data.status === "success") {
        toast.success("Kategori keuangan berhasil dibuat!");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error creating financial category:", error);

      let errorMessage = "Terjadi kesalahan saat membuat kategori keuangan";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(", ");
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CategoryForm
      title="Tambah Kategori Keuangan"
      subtitle="Buat kategori baru untuk mengelompokkan transaksi keuangan"
      formData={formData}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      submitButtonText="Simpan Kategori"
      submitButtonIcon={<Save size={16} />}
      mode="create"
    />
  );
};

export default CategoryCreate;
