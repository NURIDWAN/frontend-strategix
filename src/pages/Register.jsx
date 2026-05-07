import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon, ArrowLeft, CheckCircle, UserPlus, Phone } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { clearAppData } from "../utils/authStorage";

const Register = ({ isDarkMode, toggleDarkMode }) => {
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

  const { register } = useAuth();
  const navigate = useNavigate();

  // Clear any residual app data on mount to prevent data leakage from previous accounts
  useEffect(() => {
    // We preserve affiliate info because it might be needed for this registration
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

    // Read affiliate referral code from localStorage
    const affiliateRef = localStorage.getItem("affiliate_ref");
    const affiliateTimestamp = localStorage.getItem("affiliate_ref_timestamp");

    // Check if referral code is still valid (30 days = 30 * 24 * 60 * 60 * 1000 ms)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const isRefValid = affiliateRef && affiliateTimestamp && Date.now() - parseInt(affiliateTimestamp) < thirtyDaysMs;

    // Prepare registration data with referral code
    const registrationData = {
      ...formData,
      ...(isRefValid && { referral_code: affiliateRef }),
    };

    console.log("[Register] Submitting with referral:", isRefValid ? affiliateRef : "none");

    const result = await register(registrationData);

    if (result.success) {
      // Clear referral code after successful registration
      if (isRefValid) {
        localStorage.removeItem("affiliate_ref");
        localStorage.removeItem("affiliate_ref_timestamp");
        console.log("[Register] Referral code cleared after successful registration");
      }

      if (result.needsVerification) {
        // Redirect to OTP verification dengan email user
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            phone: formData.phone,
            message: "Registrasi berhasil! Silakan cek Email Anda untuk kode verifikasi.",
          },
        });
      } else {
        navigate("/dashboard");
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

    // Format nomor telepon saat input
    let processedValue = value;
    if (name === "phone") {
      // Hanya allow angka dan +
      processedValue = value.replace(/[^\d+]/g, "");
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const formatPhoneExample = () => {
    return "Contoh: 081234567890, 6281234567890, atau +6281234567890";
  };

  const passwordStrength = formData.password.length > 0 ? (formData.password.length < 6 ? "weak" : formData.password.length < 10 ? "medium" : "strong") : "";

  return (
    <div className="min-h-screen from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center relative">
          {/* Back to Home - Mobile */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 sm:hidden">
            <Link to="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <ArrowLeft size={16} className="mr-1" />
            </Link>
          </div>

          {/* Back to Home - Desktop */}
          <div className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2">
            <Link to="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Beranda
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Toggle dark mode">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Logo */}
          <div className="mx-auto">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                <span className="text-green-600 dark:text-green-400">Grapadi</span>Strategix
              </h1>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Business Management</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
              <UserPlus className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Buat Akun Baru</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bergabunglah dengan Grapadi Strategix dan mulai kelola bisnis Anda.</p>
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
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 sm:py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-colors ${errors.name ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 sm:py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-colors ${errors.email ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="Masukkan email aktif"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nomor Telepon (Opsional jika OTP via WA nonaktif)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 sm:py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-colors ${errors.phone ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="081234567890"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatPhoneExample()}</p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 sm:py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-colors ${errors.username ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="Pilih username"
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 sm:py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm pr-10 transition-colors ${errors.password ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="Minimal 8 karakter"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password[0]}</p>}
              {passwordStrength && !errors.password && (
                <div className="mt-2">
                  <div className={`text-xs ${passwordStrength === "weak" ? "text-red-500" : passwordStrength === "medium" ? "text-yellow-500" : "text-green-500"}`}>
                    Kekuatan password: {passwordStrength === "weak" ? "Lemah" : passwordStrength === "medium" ? "Sedang" : "Kuat"}
                  </div>
                </div>
              )}
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
                  autoComplete="new-password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 sm:py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm pr-10 transition-colors ${errors.password_confirmation ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="Ulangi password"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
              {errors.password_confirmation && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation[0]}</p>}
            </div>

            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Saya menyetujui{" "}
                <a href="/terms" className="text-green-600 dark:text-green-400 hover:text-green-500 transition-colors">
                  Syarat & Ketentuan
                </a>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Membuat Akun...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={16} />
                    Buat Akun
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Email Verification */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <div className="mt-0.5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400">
                ⭐
              </div>
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Verifikasi Keamanan:</strong> Jika verifikasi akun aktif, kami akan mengirimkan kode (OTP) ke alamat Email Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info - Desktop */}
        <div className="hidden sm:block text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Grapadi Strategix. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
