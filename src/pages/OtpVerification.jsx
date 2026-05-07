import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sun, Moon, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { readCheckoutIntentPackageId } from '../utils/checkoutIntent';

const OtpVerification = ({ isDarkMode, toggleDarkMode }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [message, setMessage] = useState('');

    const { verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const checkoutPackageId = readCheckoutIntentPackageId();

    // Get email and phone from location state
    const email = location.state?.email || '';
    const phone = location.state?.phone || '';
    const initialMessage = location.state?.message || '';

    useEffect(() => {
        if (initialMessage) {
            setMessage(initialMessage);
        }

        // Start 60-second countdown for resend OTP
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [initialMessage]);

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp(prev => {
            const newOtp = [...prev];
            newOtp[index] = element.value;
            return newOtp;
        });

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setMessage('Masukkan 6 digit kode OTP');
            return;
        }

        setIsLoading(true);
        setMessage('');

        const result = await verifyOtp({
            email: email,
            phone: phone, // include phone for compatibility
            otp: otpCode
        });

        if (result.success) {
            setMessage('Verifikasi berhasil! Mengarahkan ke dashboard...');
            const user = result.data.data.user;
            setTimeout(() => {
                const checkoutPackageId = readCheckoutIntentPackageId();
                if (checkoutPackageId && user.role !== 'admin' && user.role !== 'consultant') {
                    navigate(`/checkout/${checkoutPackageId}`);
                    return;
                }

                const redirectPath = new URLSearchParams(location.search).get('redirect');
                if (redirectPath && redirectPath.startsWith('/') && user.role !== 'admin' && user.role !== 'consultant') {
                    navigate(redirectPath);
                    return;
                }

                if (user.role === 'admin') {
                    navigate('/admin');
                } else if (user.role === 'consultant') {
                    navigate('/consultant/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 2000);
        } else {
            setMessage(result.message || 'Verifikasi gagal');
            // Clear OTP on failure
            setOtp(['', '', '', '', '', '']);
            // Focus first input
            document.getElementById('otp-0')?.focus();
        }

        setIsLoading(false);
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setIsLoading(true);
        setMessage('');

        const result = await resendOtp({ email, phone });

        if (result.success) {
            setMessage('Kode OTP baru telah dikirim ke Email Anda');
            setCountdown(60);
        } else {
            setMessage(result.message || 'Gagal mengirim ulang OTP');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
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
                                <span className="text-green-600 dark:text-green-400">Grapadi</span>Strategix
                            </h1>
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Business Management</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                    {checkoutPackageId && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                                Setelah verifikasi OTP, Anda akan diarahkan ke checkout paket yang dipilih.
                            </p>
                        </div>
                    )}

                    <div className="text-center mb-6">
                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                            <Mail className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Verifikasi Akun
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Kami telah mengirim kode OTP ke
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            {email || phone}
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-md text-center ${message.includes('berhasil')
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}>
                            {message}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                                Masukkan 6 digit kode OTP
                            </label>
                            <div className="flex justify-center space-x-2">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={data}
                                        onChange={e => handleOtpChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        onFocus={e => e.target.select()}
                                        className="w-12 h-12 text-center border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-lg font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Memverifikasi...
                                    </>
                                ) : (
                                    'Verifikasi'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || isLoading}
                                className="text-green-600 dark:text-green-400 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Kirim ulang OTP {countdown > 0 && `(${countdown}s)`}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                            <strong>Perhatian:</strong> Kode OTP berlaku selama 10 menit. Pastikan alamat email Anda aktif.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
