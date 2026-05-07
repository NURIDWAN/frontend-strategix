import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Edit2, LogOut, CheckCircle, XCircle, Clock, AtSign, AlertTriangle, Award } from "lucide-react";
import userApi from "../../services/userApi";
import singapayApi from "../../services/singapayApi";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function UserProfileView({ onEdit }) {
  const userLS = JSON.parse(localStorage.getItem("user"));
  const userId = userLS?.id;

  const { verifyOtp, resendOtp } = useAuth();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [accessInfo, setAccessInfo] = useState({
    has_access: false,
    package: null,
    expires_at: null,
    remaining_days: 0,
  });
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [veritying, setVerifying] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await userApi.getById(userId);
      const u = res.data.data;

      setUser(u);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    checkProAccess();
  }, []);

  const checkProAccess = async () => {
    try {
      const response = await singapayApi.checkAccess();
      if (response.data.success) {
        setAccessInfo({
          has_access: response.data.has_access || false,
          package: response.data.package || null,
          expires_at: response.data.expires_at || null,
          remaining_days: response.data.remaining_days || 0,
        });
      }
    } catch (error) {
      console.error("Failed to check Pro access:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = (import.meta.env.BASE_URL || "/") + "login";
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.warning("Masukkan kote OTP 6 digit");
      return;
    }

    setVerifying(true);
    const res = await verifyOtp({ phone: user.phone, otp });
    setVerifying(false);

    if (res.success) {
      setShowOtpModal(false);
      setOtp("");
      toast.success("Nomor WhatsApp berhasil diverifikasi!");

      // Update local state and re-fetch to ensure sync
      setUser(prev => ({ ...prev, phone_verified_at: new Date().toISOString() }));
      fetchUser();
    } else {
      toast.error(res.message || "Verifikasi gagal");
    }
  };

  const handleResendOtp = async () => {
    const res = await resendOtp(user.phone);
    if (res.success) {
      toast.success("OTP baru telah dikirim ke WhatsApp Anda");
    } else {
      toast.error(res.message);
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <div className="relative">
              <img
                src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User") + "&background=6366f1&color=fff&size=128"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
              {user.phone_verified_at && (
                <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 border-2 border-white dark:border-gray-800">
                  <CheckCircle className="text-white text-sm" />
                </div>
              )}
            </div>

            {/* Name & Username */}
            <div className="flex-1 text-center sm:text-left sm:mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-center sm:justify-start mt-1">
                <AtSign className="text-sm" />
                {user.username}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${accessInfo.has_access
                  ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                  }`}>
                  <Award className="text-sm" />
                  {accessInfo.has_access ? (
                    <span>Pro {accessInfo.package === 'yearly' ? 'Tahunan' : 'Bulanan'}</span>
                  ) : (
                    <span>Free</span>
                  )}
                </span>

                {/* Remaining Time Info */}
                {accessInfo.has_access && accessInfo.remaining_days > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50">
                    <Clock className="text-sm" />
                    <span>{accessInfo.remaining_days} hari lagi</span>
                  </span>
                )}

                {/* Expiry Date Info */}
                {accessInfo.has_access && accessInfo.expires_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-700/50">
                    <Calendar className="text-sm" />
                    <span>Berakhir: {formatExpiryDate(accessInfo.expires_at)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:mb-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Edit2 className="text-sm" />
                Edit Profil
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <LogOut className="text-sm" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="text-indigo-600 dark:text-indigo-400" />
            Informasi Kontak
          </h2>
          <div className="space-y-4">
            <InfoItem
              icon={Phone}
              label="No WhatsApp"
              value={user.phone || "-"}
            />
            <InfoItem
              icon={CheckCircle}
              label="Status Verifikasi"
              value={user.phone_verified_at ? "✔ Terverifikasi" : "Belum Terverifikasi"}
              valueColor={user.phone_verified_at ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}
              extra={!user.phone_verified_at && (
                <button
                  onClick={() => setShowOtpModal(true)}
                  className="ml-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full transition-colors"
                >
                  Verifikasi No HP
                </button>
              )}
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="text-indigo-600 dark:text-indigo-400" />
            Informasi Akun
          </h2>
          <div className="space-y-4">
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={user.name}
            />
            <InfoItem
              icon={AtSign}
              label="Username"
              value={user.username}
            />
            <InfoItem
              icon={Calendar}
              label="Terdaftar Sejak"
              value={new Date(user.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            />
          </div>
        </div>
      </div>
      {/* OTP Modal */}
      {
        showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Nomor WhatsApp</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Kami telah mengirimkan kode OTP ke <strong>{user.phone}</strong>. Masukkan kode tersebut untuk memverifikasi nomor Anda.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kode OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={veritying || otp.length < 6}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {veritying ? "Memproses..." : "Verifikasi"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Belum menerima kode?{" "}
                  <button
                    onClick={handleResendOtp}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Kirim Ulang
                  </button>
                </p>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function InfoItem({ icon: Icon, label, value, valueColor = "text-gray-900 dark:text-white", extra }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Icon className="text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <div className="flex items-center flex-wrap gap-2">
          <p className={`font-medium ${valueColor} truncate`}>
            {value}
          </p>
          {extra}
        </div>
      </div>
    </div>
  );
}
