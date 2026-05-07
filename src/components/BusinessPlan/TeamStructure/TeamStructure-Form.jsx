import { useState, useEffect } from "react";
import { Building, Loader, Upload, X, User, Briefcase, GraduationCap, Users, DollarSign } from "lucide-react";

const TeamStructureForm = ({ title, subtitle, formData, businesses, operationalPlans, isLoadingBusinesses, isLoadingOperationalPlans, isLoading, onInputChange, onSubmit, onBack, submitButtonText, submitButtonIcon, mode = "create" }) => {
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // Team category options
  const teamCategories = ["Tim Management", "Tim Operasional", "Tim Produksi", "Tim Marketing", "Tim Frontend", "Tim Backend", "Tim IT/Technology", "Tim Customer Service", "Tim Finance", "Tim HRD", "Lainnya"];

  // Initialize photo preview
  useEffect(() => {
    if (formData.photo_url) {
      setPhotoPreview(formData.photo_url);
    } else if (formData.photo instanceof File) {
      const objectUrl = URL.createObjectURL(formData.photo);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [formData.photo, formData.photo_url]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "member_name" && !value.trim()) {
      newErrors.member_name = "Nama anggota wajib diisi";
    } else if (name === "member_name") {
      delete newErrors.member_name;
    }

    if (name === "position" && !value.trim()) {
      newErrors.position = "Posisi/jabatan wajib diisi";
    } else if (name === "position") {
      delete newErrors.position;
    }

    if (name === "team_category" && !value) {
      newErrors.team_category = "Kategori tim wajib dipilih";
    } else if (name === "team_category") {
      delete newErrors.team_category;
    }

    if (name === "experience" && !value.trim()) {
      newErrors.experience = "Pengalaman/latar belakang wajib diisi";
    } else if (name === "experience") {
      delete newErrors.experience;
    }

    if (name === "salary" && (!value || value === 0)) {
      newErrors.salary = "Gaji wajib diisi dan harus lebih dari 0";
    } else if (name === "salary") {
      delete newErrors.salary;
    }

    setErrors(newErrors);
  };

  const handleInputChangeWrapper = (name, value) => {
    onInputChange(name, value);
    validateField(name, value);
  };

  // Format number dengan separator
  const formatCurrency = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse formatted currency ke number
  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/\./g, ""), 10) || 0;
  };

  const handleSalaryChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, ""); // Remove dots
    const numValue = parseInt(rawValue, 10) || 0;
    handleInputChangeWrapper("salary", numValue);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          photo: "Format file harus JPG, PNG, atau GIF",
        }));
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "Ukuran file maksimal 2MB",
        }));
        return;
      }

      // Clear errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });

      onInputChange("photo", file);
    }
  };

  const removePhoto = () => {
    onInputChange("photo", null);
    onInputChange("photo_url", null);
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation
    const finalErrors = {};
    if (!formData.member_name?.trim()) finalErrors.member_name = "Nama anggota wajib diisi";
    if (!formData.position?.trim()) finalErrors.position = "Posisi/jabatan wajib diisi";
    if (!formData.team_category) finalErrors.team_category = "Kategori tim wajib dipilih";
    if (!formData.experience?.trim()) finalErrors.experience = "Pengalaman/latar belakang wajib diisi";

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    onSubmit(e);
  };

  return (
    <div className="space-y-6">
      {/* Header Section dengan tombol back di atas */}
      <div className="mb-2">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Pilih Bisnis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Bisnis *</label>
            {isLoadingBusinesses ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader className="animate-spin h-4 w-4" />
                <span>Memuat data bisnis...</span>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada data bisnis. Silakan buat latar belakang bisnis terlebih dahulu.</p>
              </div>
            ) : (
              <select
                name="business_background_id"
                value={formData.business_background_id}
                onChange={(e) => handleInputChangeWrapper("business_background_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Pilih Bisnis</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.category}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pilih bisnis untuk anggota tim ini</p>
          </div>

          {/* Pilih Rencana Operasional (Opsional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rencana Operasional (Opsional)</label>
            {isLoadingOperationalPlans ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader className="animate-spin h-4 w-4" />
                <span>Memuat data operasional...</span>
              </div>
            ) : (
              <select
                name="operational_plan_id"
                value={formData.operational_plan_id || ""}
                onChange={(e) => handleInputChangeWrapper("operational_plan_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Pilih Rencana Operasional (Opsional)</option>
                {operationalPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.business_location} - {plan.business_background?.name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hubungkan dengan rencana operasional tertentu (opsional)</p>
          </div>

          {/* Informasi Dasar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Anggota *</label>
              <input
                type="text"
                name="member_name"
                value={formData.member_name}
                onChange={(e) => handleInputChangeWrapper("member_name", e.target.value)}
                placeholder="Nama lengkap anggota"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.member_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.member_name && <p className="text-red-500 text-sm mt-1">{errors.member_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Posisi/Jabatan *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={(e) => handleInputChangeWrapper("position", e.target.value)}
                placeholder="Contoh: Manager, Developer, dll"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.position ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>
          </div>

          {/* Gaji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <DollarSign size={18} />
              Gaji per Bulan (Rupiah) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rp</span>
              <input
                type="text"
                name="salary"
                value={formatCurrency(formData.salary)}
                onChange={handleSalaryChange}
                placeholder="5.000.000"
                className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.salary ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Masukkan gaji bulanan karyawan (hanya angka)</p>
          </div>

          {/* Job Desk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Desk / Deskripsi Tugas (Opsional)</label>
            <textarea
              name="jobdesk"
              value={formData.jobdesk || ""}
              onChange={(e) => handleInputChangeWrapper("jobdesk", e.target.value)}
              rows={4}
              placeholder="Deskripsi tugas dan tanggung jawab sehari-hari, misalnya: Mengelola tim, membuat laporan, menangani customer service, dll."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jelaskan tugas dan tanggung jawab utama yang dikerjakan</p>
          </div>

          {/* Kategori Tim & Urutan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori Tim *</label>
              <select
                name="team_category"
                value={formData.team_category}
                onChange={(e) => handleInputChangeWrapper("team_category", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.team_category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Pilih Kategori Tim</option>
                {teamCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.team_category && <p className="text-red-500 text-sm mt-1">{errors.team_category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urutan Tampil</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={(e) => handleInputChangeWrapper("sort_order", parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Angka lebih kecil akan ditampilkan lebih dulu</p>
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Anggota (Opsional)</label>

            <div className="space-y-4">
              {/* Photo Preview */}
              {photoPreview && (
                <div className="flex items-center gap-4">
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600" />
                  <button type="button" onClick={removePhoto} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <X size={16} />
                    Hapus Foto
                  </button>
                </div>
              )}

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  errors.photo ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
              >
                <input type="file" id="photo" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handlePhotoChange} className="hidden" />
                <label htmlFor="photo" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Klik untuk upload foto atau drag & drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Format: JPG, PNG, GIF (Maks. 2MB)</p>
                </label>
              </div>

              {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
            </div>
          </div>

          {/* Pengalaman & Latar Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pengalaman & Latar Belakang *</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={(e) => handleInputChangeWrapper("experience", e.target.value)}
              rows={6}
              placeholder="Deskripsi pengalaman kerja, latar belakang pendidikan, keahlian khusus, pencapaian, dll."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.experience ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jelaskan pengalaman dan kualifikasi anggota secara detail</p>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <Users size={20} />
              Status Anggota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleInputChangeWrapper("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onBack} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingBusinesses || businesses.length === 0}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  {submitButtonIcon}
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeamStructureForm;
