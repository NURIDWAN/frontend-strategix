import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import CategoryForm from "./Category-Form";
import { managementFinancialApi } from "../../../services/managementFinancial";
import { toast } from "react-toastify";

const CategoryEdit = ({ category, onBack, onSuccess, selectedBusiness }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "#3B82F6",
    status: "actual",
    description: "",
    category_subtype: "other",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        type: category.type || "",
        color: category.color || "#3B82F6",
        status: category.status || "actual",
        description: category.description || "",
        category_subtype: category.category_subtype || "other",
      });
    }
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      console.log("Updating financial category:", submitData);
      const response = await managementFinancialApi.categories.update(category.id, submitData);

      if (response.data.status === "success") {
        toast.success("Kategori keuangan berhasil diperbarui!");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error updating financial category:", error);

      let errorMessage = "Terjadi kesalahan saat memperbarui kategori keuangan";
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

  if (!category) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CategoryForm
      title="Edit Kategori Keuangan"
      subtitle="Perbarui informasi kategori keuangan"
      formData={formData}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      submitButtonText="Perbarui Kategori"
      submitButtonIcon={<Save size={16} />}
      mode="edit"
    />
  );
};

export default CategoryEdit;
