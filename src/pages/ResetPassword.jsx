import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Eye, EyeOff, Sun, Moon, ArrowLeft } from "lucide-react";

const ResetPassword = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  // Get reset_token dari location state (dari ForgotPassword setelah OTP verification)
  const resetToken = location.state?.reset_token;

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect jika tidak ada reset token
    if (!resetToken) {
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    // Validasi password
    if (formData.password.length < 8) {
      setError("Password harus minimal 8 karakter");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak sama");
      setIsLoading(false);
      return;
    }

    const response = await resetPassword({
      reset_token: resetToken,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    });

    setIsLoading(false);

    if (response.success) {
      setMessage("Password berhasil direset. Mengarahkan ke halaman login...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(response.message || "Terjadi kesalahan. Coba lagi nanti.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (error) setError("");
  };

  const passwordStrength = formData.password.length > 0 ? 
    formData.password.length < 6 ? 'weak' : 
    formData.password.length < 10 ? 'medium' : 'strong' 
    : '';

  if (!resetToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 py-8 px-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-red-600 dark:text-red-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Token Tidak Valid
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Token reset password tidak valid atau sudah kedaluwarsa.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Minta Reset Password Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center relative">
          {/* Back to Login - Mobile */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 sm:hidden">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
            </Link>
          </div>

          {/* Back to Login - Desktop */}
          <div className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Login
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Logo */}
          <div className="mx-auto">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                <span className="text-green-600 dark:text-green-400">Smart</span>Web
              </h1>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Business Management
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
              <Lock className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Buat password baru untuk akun Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                {message}
              </p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm pr-10 transition-colors"
                  placeholder="Minimal 8 karakter"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordStrength && (
                <div className="mt-2">
                  <div className={`text-xs ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    Kekuatan password: {
                      passwordStrength === 'weak' ? 'Lemah' :
                      passwordStrength === 'medium' ? 'Sedang' : 'Kuat'
                    }
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm pr-10 transition-colors"
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              <strong>Tips:</strong> Gunakan kombinasi huruf, angka, dan simbol untuk password yang kuat.
            </p>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ingat password Anda?{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info - Desktop */}
        <div className="hidden sm:block text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 SmartWeb. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;