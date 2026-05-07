// frontend/src/components/ManagementFinancial/FinancialSimulation/Simulation-Create.jsx

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import SimulationForm from "./Simulation-Form";
import { managementFinancialApi } from "../../../services/managementFinancial";
import { toast } from "react-toastify";

const SimulationCreate = ({ categories, onBack, onSuccess, selectedBusiness }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", message: "", type: "info" });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Reset category when type changes
    if (name === "type") {
      setFormData((prev) => ({ ...prev, financial_category_id: "" }));
    }
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

    // Validasi business
    if (!selectedBusiness || !selectedBusiness.id) {
      setModalData({
        title: "Bisnis Tidak Dipilih",
        message: "Silakan pilih bisnis terlebih dahulu sebelum membuat simulasi keuangan.",
        type: "warning",
      });
      setShowModal(true);
      return;
    }

    // Validasi user
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      setModalData({
        title: "Data Pengguna Tidak Ditemukan",
        message: "Terjadi kesalahan saat mengambil data pengguna. Silakan login kembali.",
        type: "error",
      });
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
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

      console.log("Creating financial simulation:", submitData);
      const response = await managementFinancialApi.simulations.create(submitData);

      if (response.data.status === "success") {
        toast.success("Simulasi keuangan berhasil dibuat!");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error creating financial simulation:", error);

      let errorMessage = "Terjadi kesalahan saat membuat simulasi keuangan";
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
    <>
      <SimulationForm
        title="Tambah Simulasi Keuangan"
        subtitle="Buat simulasi baru untuk mengelola arus kas"
        formData={formData}
        isLoading={isLoading}
        categories={categories}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onCheckboxChange={handleCheckboxChange}
        onSubmit={handleSubmit}
        onBack={onBack}
        submitButtonText="Simpan Simulasi"
        submitButtonIcon={<Save size={16} />}
        mode="create"
      />

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle
                size={24}
                className={
                  modalData.type === "error" ? "text-red-500" :
                    modalData.type === "warning" ? "text-yellow-500" :
                      "text-blue-500"
                }
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalData.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                  {modalData.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulationCreate;
