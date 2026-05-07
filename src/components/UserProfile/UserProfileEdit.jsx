import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Camera, Save, Lock, User, Mail, AtSign, Shield, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import userApi from "../../services/userApi";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function UserProfileEdit({ onBack }) {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    status: "active",
  });

  // Load user data
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    userApi
      .getById(userId)
      .then((res) => {
        const data = res.data.data;

        setUser(data);
        setForm({
          name: data.name || "",
          username: data.username || "",
          phone: data.phone || "",
          status: data.account_status || "active",
        });
      })
      .catch(() => toast.error("Gagal memuat data pengguna"))
      .finally(() => setLoading(false));
  }, [userId]);

  // Handle inputs
  const handleInput = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        username: form.username,
        phone: form.phone,
        status: form.status,
      };

      const res = await userApi.update(userId, payload);

      toast.success("Profil berhasil diperbarui");

      const updated = res.data.data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name: updated.name,
          username: updated.username,
          phone: updated.phone,
        })
      );

      setUser(updated);

      if (res.data.needs_verification) {
        toast.info("Nomor berhasil diubah. Silakan verifikasi di halaman profil.", { autoClose: 3000 });
      }

      // Always go back to view
      onBack && onBack();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    const current = e.target.current_password.value;
    const newp = e.target.new_password.value;
    const confirm = e.target.new_password_confirmation.value;

    if (!current || !newp) {
      toast.error("Isi semua field password");
      return;
    }
    if (newp.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    if (newp !== confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        current_password: current,
        new_password: newp,
        new_password_confirmation: confirm,
      };

      const res = await userApi.updatePassword(userId, payload);
      toast.success(res.data.message || "Password berhasil diubah");

      e.target.reset();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="text-xl" />
        <span className="font-medium">Kembali</span>
      </button>

      {/* Edit Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <User className="text-indigo-600 dark:text-indigo-400" />
          Edit Profil
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Preview Only */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(form.name || "User") + "&background=6366f1&color=fff&size=128"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Data Diri
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sesuaikan informasi profil Anda sesuai dengan data yang terdaftar.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <User className="text-gray-500" />
                  Nama Lengkap
                </div>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                required
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <AtSign className="text-gray-500" />
                  Username
                </div>
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleInput}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                placeholder="Masukkan username"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="text-gray-500" />
                  No WhatsApp
                </div>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleInput}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                required
                placeholder="Masukkan nomor WhatsApp"
              />
              <p className="mt-1 text-xs text-gray-500">Pastikan nomor aktif dan terdaftar di WhatsApp untuk menerima OTP.</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="text-gray-500" />
                  Status Akun
                </div>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="suspended">Ditangguhkan</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            <Save className="text-lg" />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Lock className="text-indigo-600 dark:text-indigo-400" />
          Ubah Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Lama
            </label>
            <input
              name="current_password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              required
              placeholder="Masukkan password lama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Baru
            </label>
            <input
              name="new_password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              required
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Konfirmasi Password Baru
            </label>
            <input
              name="new_password_confirmation"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              required
              placeholder="Ulangi password baru"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            <Lock className="text-lg" />
            {loading ? "Mengubah..." : "Ganti Password"}
          </button>
        </form>
      </div>
      {/* OTP Modal */}
    </div>
  );
}
