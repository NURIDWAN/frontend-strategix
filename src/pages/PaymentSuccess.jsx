import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import singapayApi from '../services/singapayApi';
import { toast } from 'react-toastify';

const PaymentSuccess = ({ isDarkMode }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking'); // checking, success, pending, failed
    const [paymentData, setPaymentData] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const transactionCode = searchParams.get('transaction_code');

    useEffect(() => {
        if (!transactionCode) {
            toast.error('Transaction code not found');
            navigate('/dashboard');
            return;
        }

        checkPaymentStatus();
        
        // Poll status setiap 3 detik untuk pending payments
        const interval = setInterval(() => {
            if (status === 'checking' || status === 'pending') {
                checkPaymentStatus();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [transactionCode]);

    // Countdown redirect untuk successful payments
    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            navigate('/dashboard');
        }
    }, [status, countdown, navigate]);

    const checkPaymentStatus = async () => {
        try {
            const response = await singapayApi.checkPaymentStatus(transactionCode);
            
            if (response.data.success) {
                const data = response.data;
                setPaymentData(data);
                
                if (data.paid || data.status === 'paid') {
                    setStatus('success');
                    toast.success('Pembayaran berhasil! Akses Pro Anda telah aktif.');
                } else if (data.status === 'pending') {
                    setStatus('pending');
                } else {
                    setStatus('failed');
                }
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setStatus('failed');
        }
    };

    const renderIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-20 h-20 text-green-500" />;
            case 'pending':
                return <Clock className="w-20 h-20 text-yellow-500 animate-pulse" />;
            case 'failed':
                return <XCircle className="w-20 h-20 text-red-500" />;
            default:
                return (
                    <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                );
        }
    };

    const renderTitle = () => {
        switch (status) {
            case 'success':
                return 'Pembayaran Berhasil!';
            case 'pending':
                return 'Menunggu Pembayaran';
            case 'failed':
                return 'Pembayaran Gagal';
            default:
                return 'Memeriksa Status Pembayaran...';
        }
    };

    const renderDescription = () => {
        switch (status) {
            case 'success':
                return (
                    <>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                            Terima kasih! Pembayaran Anda telah berhasil dikonfirmasi.
                        </p>
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                            Akses PDF Pro tanpa watermark Anda sekarang aktif.
                        </p>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Anda akan dialihkan ke dashboard dalam <span className="font-bold">{countdown}</span> detik...
                            </p>
                        </div>
                    </>
                );
            case 'pending':
                return (
                    <div className="space-y-4">
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                            Pembayaran Anda sedang diproses.
                        </p>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                            Silakan selesaikan pembayaran Anda melalui metode yang telah dipilih.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                Status pembayaran akan diperbarui secara otomatis setelah pembayaran dikonfirmasi.
                            </p>
                        </div>
                    </div>
                );
            case 'failed':
                return (
                    <div className="space-y-4">
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                            Maaf, pembayaran Anda gagal atau dibatalkan.
                        </p>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                            Silakan coba lagi atau hubungi customer support jika masalah berlanjut.
                        </p>
                    </div>
                );
            default:
                return (
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        Mohon tunggu sebentar...
                    </p>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {renderIcon()}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-black text-center mb-6 text-gray-900 dark:text-white">
                        {renderTitle()}
                    </h1>

                    {/* Description */}
                    <div className="text-center mb-8">
                        {renderDescription()}
                    </div>

                    {/* Transaction Info */}
                    {paymentData && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Kode Transaksi:</span>
                                    <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                        {transactionCode}
                                    </span>
                                </div>
                                {paymentData.paid_at && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Waktu Pembayaran:</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {new Date(paymentData.paid_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {paymentData.expires_at && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Berlaku Sampai:</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {new Date(paymentData.expires_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {status === 'success' && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
                            >
                                Ke Dashboard
                                <ArrowRight size={20} />
                            </button>
                        )}
                        
                        {status === 'failed' && (
                            <>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
                                >
                                    Coba Lagi
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
                                >
                                    Kembali ke Dashboard
                                </button>
                            </>
                        )}

                        {status === 'pending' && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
                            >
                                Kembali ke Dashboard
                            </button>
                        )}
                    </div>

                    {/* Help Text */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                        Butuh bantuan? Hubungi{' '}
                        <a 
                            href="https://wa.me/6285198887963" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline font-semibold"
                        >
                            customer support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
