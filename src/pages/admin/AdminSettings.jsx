import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Globe,
  CreditCard,
  Link2,
  ToggleLeft,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminAPI } from "../../services/admin/adminApi";

const GROUP_CONFIG = {
  general: { label: "Umum", icon: Globe },
  payment: { label: "Pembayaran", icon: CreditCard },
  affiliate: { label: "Affiliate", icon: Link2 },
  features: { label: "Fitur", icon: ToggleLeft },
};

const GROUP_ORDER = ["general", "payment", "affiliate", "features"];

function formatLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseValue(value, type) {
  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === "1" || value === 1) return true;
    return false;
  }
  if (type === "integer") {
    const n = parseInt(value, 10);
    return isNaN(n) ? 0 : n;
  }
  return value ?? "";
}

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [values, setValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [activeGroup, setActiveGroup] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await adminAPI.getSettings();
      const grouped = response.data.data;
      setSettings(grouped);

      const vals = {};
      Object.values(grouped).forEach((items) => {
        items.forEach((item) => {
          vals[item.key] = parseValue(item.value, item.type);
        });
      });
      setValues(vals);
      setOriginalValues(vals);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal memuat pengaturan";
      setFetchError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value, type) => {
    setValues((prev) => ({
      ...prev,
      [key]: parseValue(value, type),
    }));
  };

  const changedKeys = Object.keys(values).filter((key) => {
    return values[key] !== originalValues[key];
  });

  const hasChanges = changedKeys.length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const payload = {};
      changedKeys.forEach((key) => {
        payload[key] = values[key];
      });
      await adminAPI.updateSettings(payload);
      setOriginalValues({ ...values });
      toast.success("Pengaturan berhasil disimpan");
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal menyimpan pengaturan";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setValues({ ...originalValues });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 size={40} className="text-green-600 animate-spin" />
        <p className="text-sm text-gray-500">Memuat pengaturan...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-gray-600">{fetchError}</p>
        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    );
  }

  const activeSettings = settings[activeGroup] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={24} className="text-green-600" />
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-gray-500">
            Konfigurasi dan pengaturan platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasChanges && !saving
                ? "text-white bg-green-600 hover:bg-green-700 shadow-sm"
                : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <AlertCircle size={16} />
          <span>
            {changedKeys.length} pengaturan diubah. Klik{" "}
            <strong>Simpan Perubahan</strong> untuk menerapkan.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Group tabs - sidebar */}
        <div className="lg:w-56 shrink-0">
          <nav className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {GROUP_ORDER.map((groupKey) => {
              const config = GROUP_CONFIG[groupKey];
              if (!config) return null;
              const Icon = config.icon;
              const isActive = activeGroup === groupKey;
              const groupSettings = settings[groupKey] || [];
              const groupChangedCount = groupSettings.filter(
                (s) => values[s.key] !== originalValues[s.key]
              ).length;

              return (
                <button
                  key={groupKey}
                  onClick={() => setActiveGroup(groupKey)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0 ${
                    isActive
                      ? "bg-green-50 text-green-700 border-l-[3px] border-l-green-600"
                      : "text-gray-600 hover:bg-gray-50 border-l-[3px] border-l-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{config.label}</span>
                  {groupChangedCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-amber-500 rounded-full">
                      {groupChangedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings content */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl">
            {/* Group header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {(() => {
                  const config = GROUP_CONFIG[activeGroup];
                  if (!config) return null;
                  const Icon = config.icon;
                  return <Icon size={20} className="text-green-600" />;
                })()}
                <h2 className="text-lg font-semibold text-gray-900">
                  {GROUP_CONFIG[activeGroup]?.label || activeGroup}
                </h2>
              </div>
            </div>

            {/* Settings list */}
            <div className="divide-y divide-gray-100">
              {activeSettings.map((setting) => (
                <SettingRow
                  key={setting.id}
                  setting={setting}
                  value={values[setting.key]}
                  isChanged={values[setting.key] !== originalValues[setting.key]}
                  onChange={(val) =>
                    handleChange(setting.key, val, setting.type)
                  }
                />
              ))}
              {activeSettings.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-400 text-sm">
                  Tidak ada pengaturan di grup ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function SettingRow({ setting, value, isChanged, onChange }) {
  const { key, type, description } = setting;
  const label = formatLabel(key);

  return (
    <div
      className={`px-6 py-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        isChanged ? "bg-amber-50/50" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <label
          htmlFor={`setting-${key}`}
          className="block text-sm font-medium text-gray-800"
        >
          {label}
          {isChanged && (
            <span className="ml-2 text-xs font-normal text-amber-600">
              (diubah)
            </span>
          )}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        )}
      </div>

      <div className="mt-2 sm:mt-0 sm:w-64 shrink-0">
        {type === "boolean" && (
          <ToggleSwitch
            id={`setting-${key}`}
            checked={!!value}
            onChange={(checked) => onChange(checked)}
          />
        )}
        {type === "string" && (
          <input
            id={`setting-${key}`}
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        )}
        {type === "integer" && (
          <input
            id={`setting-${key}`}
            type="number"
            value={value ?? 0}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ id, checked, onChange }) {
  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        checked ? "bg-green-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default AdminSettings;
