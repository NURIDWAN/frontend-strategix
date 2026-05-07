// frontend/src/components/ManagementFinancial/FinancialSimulation/Simulation-Edit.jsx

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import SimulationForm from "./Simulation-Form";
import { managementFinancialApi } from "../../../services/managementFinancial";
import { toast } from "react-toastify";

const SimulationEdit = ({ simulation, categories, onBack, onSuccess, selectedBusiness }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    financial_category_id: "",
    amount: "",
    simulation_date: new Date().toISOString().split("T")[0],
    description: "",
    payment_method: "cash",
    status: "planned",
    is_recurring: false,
    recurring_frequency: "",
    recurring_end_date: "",
    notes: "",
  });

  useEffect(() => {
    if (simulation) {
      setFormData({
        type: simulation.type || "",
        financial_category_id: simulation.financial_category_id || "",
        amount: simulation.amount || "",
        simulation_date: simulation.simulation_date ? simulation.simulation_date.split("T")[0] : new Date().toISOString().split("T")[0],
        description: simulation.description || "",
        payment_method: simulation.payment_method || "cash",
        status: simulation.status || "planned",
        is_recurring: simulation.is_recurring || false,
        recurring_frequency: simulation.recurring_frequency || "",
        recurring_end_date: simulation.recurring_end_date ? simulation.recurring_end_date.split("T")[0] : "",
        notes: simulation.notes || "",
      });
    }
  }, [simulation]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
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
        amount: parseFloat(formData.amount) || 0,
      };

      // Clean up recurring data if not recurring
      if (!submitData.is_recurring) {
        submitData.recurring_frequency = null;
        submitData.recurring_end_date = null;
      }

      console.log("Updating financial simulation:", simulation.id, submitData);
      const response = await managementFinancialApi.simulations.update(simulation.id, submitData);

      if (response.data.status === "success") {
        toast.success("Simulasi keuangan berhasil diperbarui!");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error updating financial simulation:", error);

      let errorMessage = "Terjadi kesalahan saat memperbarui simulasi keuangan";
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

  if (!simulation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SimulationForm
      title="Edit Simulasi Keuangan"
      subtitle="Perbarui informasi simulasi keuangan"
      formData={formData}
      isLoading={isLoading}
      categories={categories}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onCheckboxChange={handleCheckboxChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      submitButtonText="Perbarui Simulasi"
      submitButtonIcon={<Save size={16} />}
      mode="edit"
    />
  );
};

export default SimulationEdit;
