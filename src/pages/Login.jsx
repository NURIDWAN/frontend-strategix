import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon, ArrowLeft, LogIn, Phone } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { clearAppData } from "../utils/authStorage";
import { readCheckoutIntentPackageId } from "../utils/checkoutIntent";

const Login = ({ isDarkMode, toggleDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: "", // bisa phone atau username
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithToken, isAdmin, isConsultant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const checkoutPackageId = readCheckoutIntentPackageId();

  // Clear any residual app data on mount to prevent data leakage from previous accounts
  useEffect(() => {
    // We preserve affiliate info because it might be needed for registration
    clearAppData(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get("google_token");
    const googleError = params.get("google_error");

    if (googleError) {
      setError(googleError);
      navigate("/login", { replace: true });
      return;
    }

    if (!googleToken) {
      return;
    }

    const processGoogleLogin = async () => {
      setIsLoading(true);
      const result = await loginWithToken(googleToken);

      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      const currentUser = result.user;

      if (currentUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (currentUser.role === "consultant") {
        navigate("/consultant/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      setIsLoading(false);
    };

    processGoogleLogin();
  }, [location.search, loginWithToken, navigate]);

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/api/auth/google/redirect`;
  };

  // Helper function to check if input looks like a phone number
  const isPhoneInput = (value) => {
    return /^[\d+]/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(formData);

    if (result.success) {
      const checkoutPackageId = readCheckoutIntentPackageId();
      if (checkoutPackageId) {
        navigate(`/checkout/${checkoutPackageId}`);
        setIsLoading(false);
        return;
      }

      const redirectPath = new URLSearchParams(location.search).get("redirect");
      if (redirectPath && redirectPath.startsWith("/")) {
        navigate(redirectPath);
        setIsLoading(false);
        return;
      }

      // Logic redirect di handle oleh useEffect atau manual berdasarkan role baru
      const user = result.data.data.user;
      if (user.role === 'admin') {
        navigate("/admin");
      } else if (user.role === 'consultant') {
        navigate("/consultant/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      if (result.needsVerification) {
        // Redirect to OTP verification
        navigate("/verify-otp", {
          state: {
            email: result.email,
            phone: result.phone,
            message: 'Silakan verifikasi akun Anda untuk melanjutkan login.'
          },
        });
      } else {
        setError(result.message);
      }
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format nomor telepon saat input (jika input phone)
    let processedValue = value;
    if (name === 'login' && isPhoneInput(value)) {
      processedValue = value.replace(/[^\d+]/g, '');
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });
    setError(""); // Clear error when user types
  };

  // Determine input type for better UX
  const getInputType = () => {
    return isPhoneInput(formData.login) ? "tel" : "text";
  };

  const getPlaceholder = () => {
    return isPhoneInput(formData.login)
      ? "081234567890"
      : "username, email, atau no HP";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center relative">
          {/* Back to Home - Mobile */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 sm:hidden">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
            </Link>
          </div>

          {/* Back to Home - Desktop */}
          <div className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Beranda
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
                <span className="text-green-600 dark:text-green-400">Grapadi</span>
                Strategix
              </h1>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Business Management
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          {checkoutPackageId && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                Setelah login, Anda akan diarahkan ke checkout paket yang dipilih.
              </p>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
              <LogIn className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Masuk ke Akun
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Selamat datang kembali! Silakan masuk ke akun Anda.
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

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username, Email, atau No HP
              </label>
              <div className="relative">
                {isPhoneInput(formData.login) && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <input
                  id="login"
                  name="login"
                  type={getInputType()}
                  autoComplete="username"
                  required
                  value={formData.login}
                  onChange={handleChange}
                  className={`w-full py-3 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-colors ${isPhoneInput(formData.login) ? 'pl-10 pr-3' : 'px-3'
                    }`}
                  placeholder={getPlaceholder()}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Gunakan username, alamat email, atau nomor HP Anda
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm pr-10 transition-colors"
                  placeholder="Masukkan password"
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-gray-700 dark:text-gray-300"
                >
                  Ingat saya
                </label>
              </div>

              <div>
                <Link
                  to="/forgot-password"
                  className="text-green-600 dark:text-green-400 hover:text-green-500 transition-colors"
                >
                  Lupa password?
                </Link>
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
                  "Masuk ke Akun"
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">atau</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 11.1H12v2.98h5.36c-.23 1.5-1.74 4.4-5.36 4.4-3.22 0-5.85-2.66-5.85-5.93s2.63-5.93 5.85-5.93c1.84 0 3.07.78 3.78 1.46l2.58-2.49C16.74 3.96 14.58 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.65-3.66 8.65-8.82 0-.59-.06-1.04-.14-1.48z" />
                </svg>
                Lanjutkan dengan Google
              </button>
            </div>
          </form>

          {/* Info Verification */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <div className="mt-0.5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400">
                ⭐
              </div>
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Verifikasi Keamanan:</strong> Jika akun Anda belum terverifikasi, sistem mungkin meminta verifikasi OTP (Email) setelah login.
                </p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 transition-colors"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info - Desktop */}
        <div className="hidden sm:block text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 Grapadi Strategix. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
