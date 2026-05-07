import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon, ArrowLeft, CheckCircle, UserPlus, Phone, Briefcase } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { clearAppData } from "../utils/authStorage";

const RegisterConsultant = ({ isDarkMode, toggleDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    password_confirmation: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { registerConsultant } = useAuth();
  const navigate = useNavigate();

  // Clear any residual app data on mount
  useEffect(() => {
    clearAppData(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.acceptTerms) {
      setErrors({ acceptTerms: "Anda harus menyetujui syarat dan ketentuan" });
      return;
    }

    // Validasi format nomor telepon
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrors({ phone: "Format nomor WhatsApp tidak valid. Contoh: 081234567890" });
      return;
    }

    setIsLoading(true);

    const result = await registerConsultant(formData);

    if (result.success) {
      if (result.needsVerification) {
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            phone: formData.phone,
            message: "Registrasi konsultan berhasil! Silakan cek Email Anda untuk kode verifikasi.",
          },
        });
      } else {
        navigate("/consultant/dashboard");
      }
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setErrors({ general: result.message });
      }
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;
    if (name === "phone") {
      processedValue = value.replace(/[^\d+]/g, "");
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue,
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const passwordStrength = formData.password.length > 0 ? (formData.password.length < 6 ? "weak" : formData.password.length < 10 ? "medium" : "strong") : "";

  return (
    <div className="min-h-screen from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <Link to="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Beranda
            </Link>
          </div>

          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Toggle dark mode">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="mx-auto">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">Grapadi</span>Strategix
              </h1>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Consultant Partnership</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
              <Briefcase className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Daftar Sebagai Konsultan</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bergabunglah sebagai mitra konsultan dan bantu kembangkan bisnis klien kami.</p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.general}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-3 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.name ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-3 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.email ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="Masukkan email aktif"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.phone ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="081234567890"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-3 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.username ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
                placeholder="Pilih username unik"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg dark:bg-gray-700 dark:text-white text-sm pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.password ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="Minimal 8 karakter"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password[0]}</p>}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg dark:bg-gray-700 dark:text-white text-sm pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.password_confirmation ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="Ulangi password"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Saya bersedia mengikuti ketentuan kemitraan konsultan Grapadi Strategix.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={16} />
                  Daftar Konsultan
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterConsultant;
