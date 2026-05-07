import { useState, useEffect, useCallback, useRef } from "react";
import { adminAPI } from "../../services/admin/adminApi";
import { toast } from "react-toastify";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Ban,
  CheckCircle,
  XCircle,
  Phone,
  Calendar,
  Crown,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  Key,
  AlertTriangle,
  X,
  Download,
  UserPlus,
  Plus,
  MessageSquare,
} from "lucide-react";

// ─── Confirmation Dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, confirmLabel, variant, loading, onConfirm, onCancel }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCancel();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const colors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-orange-600 hover:bg-orange-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div ref={ref} className="w-full max-w-sm p-6 bg-white rounded-2xl dark:bg-gray-800">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 shrink-0">
            <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 ${colors[variant] || colors.info}`}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit User Modal ──────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSaved }) => {
  const [tab, setTab] = useState("profile"); // "profile" | "password"
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    business_name: user?.business_name || "",
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateUser(user.id, profileData);
      toast.success("Profil pengguna berhasil diperbarui");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    try {
      setSaving(true);
      await adminAPI.updateUserPassword(user.id, passwordData);
      toast.success("Password pengguna berhasil diperbarui");
      setPasswordData({ password: "", password_confirmation: "" });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div ref={ref} className="w-full max-w-md bg-white rounded-2xl dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Edit Pengguna — {user.name}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 rounded hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTab("profile")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "profile"
                ? "text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Edit3 size={14} className="inline mr-1.5" />
            Profil
          </button>
          <button
            onClick={() => setTab("password")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "password"
                ? "text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Key size={14} className="inline mr-1.5" />
            Password
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {tab === "profile" ? (
            <>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData((d) => ({ ...d, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData((d) => ({ ...d, username: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Nama Bisnis</label>
                <input
                  type="text"
                  value={profileData.business_name}
                  onChange={(e) => setProfileData((d) => ({ ...d, business_name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Password Baru</label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData((d) => ({ ...d, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Konfirmasi Password</label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData((d) => ({ ...d, password_confirmation: e.target.value }))}
                  placeholder="Ulangi password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handlePasswordSave}
                disabled={saving || !passwordData.password}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Ubah Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create User Modal ────────────────────────────────────────────────────────
const CreateUserModal = ({ onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
    role: "user",
    account_status: "active",
  });
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!formData.name || !formData.username || !formData.phone || !formData.password) {
      toast.error("Mohon lengkapi semua field wajib");
      return;
    }
    try {
      setSaving(true);
      await adminAPI.createUser(formData);
      toast.success("Pengguna baru berhasil dibuat");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat pengguna");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={ref} className="w-full max-w-md bg-white rounded-2xl dark:bg-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserPlus size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tambah Pengguna Baru</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((d) => ({ ...d, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                placeholder="username_tanpa_spasi"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nomor Telepon (WhatsApp)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value.replace(/[^0-9]/g, "") }))}
                placeholder="Contoh: 62812345678"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((d) => ({ ...d, password: e.target.value }))}
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((d) => ({ ...d, role: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</label>
                <select
                  value={formData.account_status}
                  onChange={(e) => setFormData((d) => ({ ...d, account_status: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Simpan Pengguna</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Grant PRO Modal ──────────────────────────────────────────────────────────
const GrantProModal = ({ user, onClose, onSaved }) => {
  const [package_type, setPackageType] = useState("monthly");
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleGrant = async () => {
    try {
      setSaving(true);
      await adminAPI.grantProAccess(user.id, { package: package_type });
      toast.success(`Akses PRO ${package_type === "monthly" ? "Bulanan" : "Tahunan"} berhasil diberikan`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memberikan akses PRO");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={ref} className="w-full max-w-sm bg-white rounded-2xl dark:bg-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full dark:bg-purple-900/30">
            <Crown size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
            Berikan Akses PRO
          </h3>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
            Berikan akses premium secara manual kepada <strong>{user.name}</strong>. Silakan pilih tipe paket:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setPackageType("monthly")}
              className={`p-3 text-sm font-medium rounded-xl border-2 transition-all ${
                package_type === "monthly"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  : "border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              Bulanan
              <span className="block text-[10px] opacity-70">30 Hari</span>
            </button>
            <button
              onClick={() => setPackageType("yearly")}
              className={`p-3 text-sm font-medium rounded-xl border-2 transition-all ${
                package_type === "yearly"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  : "border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              Tahunan
              <span className="block text-[10px] opacity-70">365 Hari</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleGrant}
              disabled={saving}
              className="w-full py-3 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
              Berikan Akses Sekarang
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Grant Consultation Modal ────────────────────────────────────────────────────────
const GrantConsultationModal = ({ user, onClose, onSaved }) => {
  const [credits, setCredits] = useState(1);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleGrant = async () => {
    if (credits < 1) {
       toast.error("Minimal 1 kredit");
       return;
    }
    try {
      setSaving(true);
      await adminAPI.grantConsultationAccess(user.id, { credits });
      toast.success(`Kredit Konsultasi (${credits} sesi) berhasil diberikan kepada ${user.name}`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memberikan kredit konsultasi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={ref} className="w-full max-w-sm bg-white rounded-2xl dark:bg-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full dark:bg-orange-900/30">
            <Plus size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
            Tambah Kredit Konsultasi
          </h3>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
            Berikan sesi/kredit konsultasi secara manual kepada <strong>{user.name}</strong>.
          </p>

          <div className="mb-6">
             <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Jumlah Kredit/Sesi</label>
             <input type="number" min="1" value={credits} onChange={e => setCredits(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-4 py-2 text-center text-lg font-bold border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleGrant}
              disabled={saving}
              className="w-full py-3 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              Tambahkan Kredit Sekarang
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    verified: "",
    pro: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [grantProUser, setGrantProUser] = useState(null);
  const [grantConsultationUser, setGrantConsultationUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Confirmation dialog
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", confirmLabel: "", variant: "info", onConfirm: () => {} });

  const modalRef = useRef(null);

  // Debounce search — only update debouncedSearch after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
        sort_by: sortBy,
        sort_dir: sortDir,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.verified && { verified: filters.verified }),
        ...(filters.pro && { pro: filters.pro }),
      };
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.data);
      setPagination({
        currentPage: response.data.data.current_page,
        lastPage: response.data.data.last_page,
        total: response.data.data.total,
        from: response.data.data.from,
        to: response.data.data.to,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filters, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Click-outside to close detail modal
  useEffect(() => {
    if (!selectedUser) return;
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedUser(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedUser]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="inline ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp size={14} className="inline ml-1" />
      : <ArrowDown size={14} className="inline ml-1" />;
  };

  // ─── Confirmed Actions ─────────────────────────────────────────────────────
  const requestStatusChange = (userId, userName, newStatus) => {
    const labels = { active: "mengaktifkan", banned: "memblokir", inactive: "menonaktifkan" };
    const variants = { active: "success", banned: "danger", inactive: "warning" };
    setConfirm({
      open: true,
      title: `${labels[newStatus]?.charAt(0).toUpperCase()}${labels[newStatus]?.slice(1)} Pengguna`,
      message: `Apakah Anda yakin ingin ${labels[newStatus]} pengguna "${userName}"?`,
      confirmLabel: labels[newStatus]?.charAt(0).toUpperCase() + labels[newStatus]?.slice(1),
      variant: variants[newStatus] || "info",
      onConfirm: () => executeStatusChange(userId, newStatus),
    });
  };

  const executeStatusChange = async (userId, newStatus) => {
    try {
      setActionLoading(userId);
      await adminAPI.updateUserStatus(userId, newStatus);
      toast.success(`Status pengguna berhasil diubah ke "${newStatus}"`);
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, account_status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah status");
    } finally {
      setActionLoading(null);
      setConfirm((c) => ({ ...c, open: false }));
    }
  };

  const requestRoleChange = (userId, userName, newRole) => {
    const label = newRole === "admin" ? "menjadikan admin" : "menjadikan user";
    setConfirm({
      open: true,
      title: "Ubah Role Pengguna",
      message: `Apakah Anda yakin ingin ${label} pengguna "${userName}"?`,
      confirmLabel: newRole === "admin" ? "Jadikan Admin" : "Jadikan User",
      variant: newRole === "admin" ? "warning" : "info",
      onConfirm: () => executeRoleChange(userId, newRole),
    });
  };

  const executeRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId);
      await adminAPI.updateUserRole(userId, newRole);
      toast.success(`Role pengguna berhasil diubah ke "${newRole}"`);
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah role");
    } finally {
      setActionLoading(null);
      setConfirm((c) => ({ ...c, open: false }));
    }
  };

  // ─── Bulk Actions ─────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    const [actionType, actionValue] = bulkAction.split(":");
    const label = actionType === "status" ? `status ke "${actionValue}"` : `role ke "${actionValue}"`;

    setConfirm({
      open: true,
      title: "Aksi Massal",
      message: `Anda akan mengubah ${label} untuk ${selectedIds.size} pengguna. Lanjutkan?`,
      confirmLabel: `Ubah ${selectedIds.size} Pengguna`,
      variant: actionValue === "banned" ? "danger" : "warning",
      onConfirm: async () => {
        try {
          setBulkLoading(true);
          const promises = Array.from(selectedIds).map((id) => {
            if (actionType === "status") return adminAPI.updateUserStatus(id, actionValue);
            if (actionType === "role") return adminAPI.updateUserRole(id, actionValue);
            return Promise.resolve();
          });
          await Promise.allSettled(promises);
          toast.success(`${selectedIds.size} pengguna berhasil diperbarui`);
          setSelectedIds(new Set());
          setBulkAction("");
          fetchUsers();
        } catch (err) {
          toast.error("Beberapa aksi gagal dijalankan");
        } finally {
          setBulkLoading(false);
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
    });
  };

  // ─── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["Nama", "Username", "Telepon", "Status", "Role", "Verifikasi", "Pro", "Terdaftar"],
      ...users.map((u) => [
        u.name,
        u.username,
        u.phone,
        u.account_status,
        u.role,
        u.phone_verified_at ? "Ya" : "Tidak",
        u.pdf_access_active ? "Pro" : "Free",
        u.created_at,
      ]),
    ];
    const csvContent = rows.map((r) => r.map((v) => `"${v || ""}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      banned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        user
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        variant={confirm.variant}
        loading={actionLoading !== null || bulkLoading}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={fetchUsers}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSaved={fetchUsers}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.total || 0} pengguna terdaftar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-500/20 active:scale-95"
          >
            <UserPlus size={16} />
            Tambah Pengguna
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Cari nama, username, atau nomor telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.role}
              onChange={(e) => { setFilters((f) => ({ ...f, role: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Semua Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>

            <select
              value={filters.verified}
              onChange={(e) => { setFilters((f) => ({ ...f, verified: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Verifikasi</option>
              <option value="true">Terverifikasi</option>
              <option value="false">Belum Verifikasi</option>
            </select>

            <select
              value={filters.pro}
              onChange={(e) => { setFilters((f) => ({ ...f, pro: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Langganan</option>
              <option value="true">Pro</option>
              <option value="false">Free</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedIds.size} dipilih
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Pilih aksi...</option>
              <optgroup label="Ubah Status">
                <option value="status:active">Aktifkan</option>
                <option value="status:inactive">Nonaktifkan</option>
                <option value="status:banned">Ban</option>
              </optgroup>
              <optgroup label="Ubah Role">
                <option value="role:user">Jadikan User</option>
                <option value="role:admin">Jadikan Admin</option>
              </optgroup>
            </select>
            <button
              onClick={executeBulkAction}
              disabled={!bulkAction || bulkLoading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {bulkLoading ? "Memproses..." : "Terapkan"}
            </button>
            <button
              onClick={() => { setSelectedIds(new Set()); setBulkAction(""); }}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div ref={modalRef} className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detail Pengguna
                </h3>
                <button onClick={() => setSelectedUser(null)} className="p-1 text-gray-400 rounded hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-green-500 to-green-600">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedUser.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Telepon</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <div className="mt-0.5">{getStatusBadge(selectedUser.account_status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <div className="mt-0.5">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Verifikasi</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedUser.phone_verified_at ? formatDate(selectedUser.phone_verified_at) : "Belum"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF Pro</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedUser.pdf_access_active ? "Aktif" : "Tidak"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Terdaftar</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* Edit button */}
                  <button
                    onClick={() => { setEditUser(selectedUser); setSelectedUser(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  {selectedUser.account_status !== "active" && (
                    <button
                      onClick={() => requestStatusChange(selectedUser.id, selectedUser.name, "active")}
                      disabled={actionLoading === selectedUser.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      Aktifkan
                    </button>
                  )}
                  {selectedUser.account_status !== "banned" && (
                    <button
                      onClick={() => requestStatusChange(selectedUser.id, selectedUser.name, "banned")}
                      disabled={actionLoading === selectedUser.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
                    >
                      <Ban size={14} />
                      Ban
                    </button>
                  )}
                  {selectedUser.account_status !== "inactive" && (
                    <button
                      onClick={() => requestStatusChange(selectedUser.id, selectedUser.name, "inactive")}
                      disabled={actionLoading === selectedUser.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Nonaktifkan
                    </button>
                  )}
                  {selectedUser.role === "user" ? (
                    <button
                      onClick={() => requestRoleChange(selectedUser.id, selectedUser.name, "admin")}
                      disabled={actionLoading === selectedUser.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 disabled:opacity-50"
                    >
                      <Shield size={14} />
                      Jadikan Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => requestRoleChange(selectedUser.id, selectedUser.name, "user")}
                      disabled={actionLoading === selectedUser.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 disabled:opacity-50"
                    >
                      <ShieldOff size={14} />
                      Jadikan User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  {/* Checkbox column */}
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase cursor-pointer select-none dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("name")}
                  >
                    Pengguna
                    <SortIcon field="name" />
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase cursor-pointer select-none dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("phone")}
                  >
                    Telepon
                    <SortIcon field="phone" />
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-center text-gray-500 uppercase cursor-pointer select-none dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("account_status")}
                  >
                    Status
                    <SortIcon field="account_status" />
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-center text-gray-500 uppercase cursor-pointer select-none dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("role")}
                  >
                    Role
                    <SortIcon field="role" />
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                    Verifikasi
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                    Pro
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                    Kredit
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase cursor-pointer select-none dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("created_at")}
                  >
                    Terdaftar
                    <SortIcon field="created_at" />
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedIds.has(u.id) ? "bg-green-50/50 dark:bg-green-900/10" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full shrink-0 bg-gradient-to-br from-green-500 to-green-600">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate dark:text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{u.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(u.account_status)}</td>
                    <td className="px-4 py-3 text-center">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3 text-center">
                      {u.phone_verified_at ? (
                        <CheckCircle size={18} className="inline text-green-500" />
                      ) : (
                        <XCircle size={18} className="inline text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.pdf_access_active ? (
                        <Crown size={18} className="inline text-purple-500" />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                      {u.consultation_credits_sum_remaining_sessions || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(u.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setEditUser(u)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="Edit Profil"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setGrantProUser(u)}
                          className={`p-1 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors ${u.pdf_access_active ? 'opacity-50 grayscale hover:bg-purple-50' : ''}`}
                          title="Berikan Akses PRO Manual"
                        >
                          <Crown size={18} />
                        </button>
                        <button
                          onClick={() => setGrantConsultationUser(u)}
                          className={`p-1 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 transition-colors`}
                          title="Tambah Kredit Konsultasi Manual"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {pagination.from}-{pagination.to} dari {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {pagination.lastPage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))}
                disabled={currentPage === pagination.lastPage}
                className="p-1.5 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
        {grantProUser && (
          <GrantProModal
            user={grantProUser}
            onClose={() => setGrantProUser(null)}
            onSaved={fetchUsers}
          />
        )}
        {grantConsultationUser && (
          <GrantConsultationModal
            user={grantConsultationUser}
            onClose={() => setGrantConsultationUser(null)}
            onSaved={fetchUsers}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
