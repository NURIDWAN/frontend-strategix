import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import TeamStructureForm from "./TeamStructure-Form";
import { teamStructureApi, backgroundApi, operationalPlanApi } from "../../../services/businessPlan";
import { toast } from "react-toastify";

const TeamStructureEdit = ({ team, onBack, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [operationalPlans, setOperationalPlans] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isLoadingOperationalPlans, setIsLoadingOperationalPlans] = useState(true);

  const [formData, setFormData] = useState({
    business_background_id: "",
    operational_plan_id: "",
    team_category: "",
    member_name: "",
    position: "",
    salary: 0,
    jobdesk: "",
    experience: "",
    photo: null,
    sort_order: 0,
    status: "draft",
  });

  // Fetch business backgrounds untuk dropdown
  const fetchBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const response = await backgroundApi.getAll();

      if (response.data.status === "success") {
        setBusinesses(response.data.data || []);
      } else {
        throw new Error("Failed to fetch business backgrounds");
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Gagal memuat data bisnis");
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  // Fetch operational plans untuk dropdown
  const fetchOperationalPlans = async () => {
    try {
      setIsLoadingOperationalPlans(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await operationalPlanApi.getAll({ user_id: user?.id });

      if (response.data.status === "success") {
        setOperationalPlans(response.data.data || []);
      } else {
        throw new Error("Failed to fetch operational plans");
      }
    } catch (error) {
      console.error("Error fetching operational plans:", error);
      // Tidak toast error karena opsional
    } finally {
      setIsLoadingOperationalPlans(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchOperationalPlans();
  }, []);

  useEffect(() => {
    if (team) {
      setFormData({
        business_background_id: team.business_background_id || "",
        operational_plan_id: team.operational_plan_id || "",
        team_category: team.team_category || "",
        member_name: team.member_name || "",
        position: team.position || "",
        salary: team.salary || 0,
        jobdesk: team.jobdesk || "",
        experience: team.experience || "",
        photo: null, // Reset photo file, use photo_url for preview
        photo_url: team.photo_url || null,
        sort_order: team.sort_order || 0,
        status: team.status || "draft",
      });
    }
  }, [team]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: business background harus dipilih
    if (!formData.business_background_id) {
      toast.error("Pilih bisnis terlebih dahulu");
      return;
    }

    // Validasi: nama anggota harus diisi
    if (!formData.member_name?.trim()) {
      toast.error("Nama anggota wajib diisi");
      return;
    }

    // Validasi: posisi harus diisi
    if (!formData.position?.trim()) {
      toast.error("Posisi/jabatan wajib diisi");
      return;
    }

    // Validasi: kategori tim harus dipilih
    if (!formData.team_category) {
      toast.error("Kategori tim wajib dipilih");
      return;
    }

    // Validasi: pengalaman harus diisi
    if (!formData.experience?.trim()) {
      toast.error("Pengalaman/latar belakang wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        throw new Error("User data not found");
      }

      const submitData = {
        ...formData,
        user_id: user.id,
      };

      console.log("Updating team structure data:", submitData);
      const response = await teamStructureApi.update(team.id, submitData);

      if (response.data.status === "success") {
        toast.success("Anggota tim berhasil diperbarui!");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error updating team structure:", error);

      let errorMessage = "Terjadi kesalahan saat memperbarui anggota tim";
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

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <TeamStructureForm
      title="Edit Anggota Tim"
      subtitle="Perbarui informasi anggota tim"
      formData={formData}
      businesses={businesses}
      operationalPlans={operationalPlans}
      isLoadingBusinesses={isLoadingBusinesses}
      isLoadingOperationalPlans={isLoadingOperationalPlans}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      submitButtonText="Perbarui Anggota"
      submitButtonIcon={<Save size={16} />}
      mode="edit"
    />
  );
};

export default TeamStructureEdit;
