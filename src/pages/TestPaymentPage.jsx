import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";
const VA_BANKS = ["BRI", "BNI", "DANAMON", "MAYBANK"];

// ─── SingaPay Section ────────────────────────────────────────────────────────

function SingapaySection() {
  const [form, setForm] = useState({
    amount: "1000",
    payment_method: "virtual_account",
    bank_code: "BRI",
    description: "Test Payment",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [config, setConfig] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const payload = {
        amount: Number(form.amount),
        payment_method: form.payment_method,
        description: form.description,
      };
      if (form.payment_method === "virtual_account" && form.bank_code) {
        payload.bank_code = form.bank_code;
      }
      const { data } = await axios.post(`${API_URL}/api/test/singapay/payment`, payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    setConfigLoading(true);
    setConfig(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/test/singapay/config`);
      setConfig(data.data);
    } catch (err) {
      setConfig({ error: err.message });
    } finally {
      setConfigLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Konfigurasi SingaPay</h2>
          <button
            onClick={loadConfig}
            disabled={configLoading}
            className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            {configLoading ? "Memuat..." : "Cek Config"}
          </button>
        </div>
        {config && (
          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        )}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Buat Test Payment Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Jumlah (Rp) — tidak ada batas minimum">
            <input type="number" name="amount" value={form.amount} onChange={handleChange} min="1" required className={inputCls} />
          </Field>
          <Field label="Deskripsi">
            <input type="text" name="description" value={form.description} onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Metode Pembayaran">
            <div className="flex gap-3">
              {["virtual_account", "qris"].map((m) => (
                <RadioCard key={m} name="payment_method" value={m} current={form.payment_method} onChange={handleChange}>
                  {m === "virtual_account" ? "Virtual Account" : "QRIS"}
                </RadioCard>
              ))}
            </div>
          </Field>
          {form.payment_method === "virtual_account" && (
            <Field label="Bank">
              <select name="bank_code" value={form.bank_code} onChange={handleChange} className={inputCls}>
                {VA_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          )}
          <SubmitBtn loading={loading} label="Buat Payment Link (SingaPay)" />
        </form>
      </div>

      <ErrorBox error={error} />

      {result?.success && (
        <ResultBox
          fields={[
            ["Ref No", <span className="font-mono">{result.data.reff_no}</span>],
            ["Jumlah", `Rp ${Number(result.data.amount).toLocaleString("id-ID")}`],
            ["Metode", result.data.method],
            ["Mode", <ModeTag mode={result.data.mode} />],
          ]}
          paymentUrl={result.data.payment_url}
          raw={result.data.raw_response}
        />
      )}
    </div>
  );
}

// ─── Faspay Section ──────────────────────────────────────────────────────────

function FaspaySection() {
  const [form, setForm] = useState({
    amount: "1000",
    customer_name: "Test User",
    customer_email: "test@example.com",
    customer_phone: "628123456789",
    description: "Test Payment Faspay",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [statusBillNo, setStatusBillNo] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/test/faspay/payment`, {
        amount: Number(form.amount),
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        description: form.description,
      });
      setResult(data);
      if (data?.data?.bill_no) setStatusBillNo(data.data.bill_no);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/test/faspay/config`);
      setConfig(data.data);
    } catch (err) {
      setConfig({ error: err.message });
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkStatus = async () => {
    if (!statusBillNo) return;
    setStatusLoading(true);
    setStatusResult(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/test/faspay/status/${statusBillNo}`);
      setStatusResult(data);
    } catch (err) {
      setStatusResult({ error: err.response?.data?.message || err.message });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Konfigurasi Faspay</h2>
          <button
            onClick={loadConfig}
            disabled={configLoading}
            className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            {configLoading ? "Memuat..." : "Cek Config"}
          </button>
        </div>
        {config && (
          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        )}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Buat Test Invoice Faspay</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {config?.invoice_prefix && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md font-mono">
                Prefix: <strong>{config.invoice_prefix}</strong>
              </span>
            )}
            {config?.environment && (
              <span className={`px-2 py-1 rounded-md font-mono uppercase ${
                config.environment === "production"
                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
              }`}>
                {config.environment}
              </span>
            )}
          </div>
        </div>
        {config?.invoice_prefix && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Bill No format: <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">{config.invoice_prefix}-XXXXXX-{`{timestamp}`}</code>
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Jumlah (Rp) — tidak ada batas minimum">
            <input type="number" name="amount" value={form.amount} onChange={handleChange} min="1" required className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nama Customer">
              <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} required className={inputCls} />
            </Field>
            <Field label="No. HP">
              <input type="text" name="customer_phone" value={form.customer_phone} onChange={handleChange} required className={inputCls} />
            </Field>
          </div>
          <Field label="Email Customer">
            <input type="email" name="customer_email" value={form.customer_email} onChange={handleChange} required className={inputCls} />
          </Field>
          <Field label="Deskripsi">
            <input type="text" name="description" value={form.description} onChange={handleChange} className={inputCls} />
          </Field>
          <SubmitBtn loading={loading} label="Buat Invoice Faspay" color="blue" />
        </form>
      </div>

      <ErrorBox error={error} />

      {result?.success && (
        <>
          <ResultBox
            fields={[
              ["Bill No", <span className="font-mono">{result.data.bill_no}</span>],
              ["Jumlah", `Rp ${Number(result.data.amount).toLocaleString("id-ID")}`],
              ["Trx ID", result.data.trx_id || "-"],
              ["Environment", <ModeTag mode={result.data.environment} />],
            ]}
            paymentUrl={result.data.payment_url}
            raw={result.data.raw_response}
          />

          {/* Status checker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Cek Status Pembayaran</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={statusBillNo}
                onChange={(e) => setStatusBillNo(e.target.value)}
                placeholder="Bill No"
                className={`flex-1 ${inputCls}`}
              />
              <button
                onClick={checkStatus}
                disabled={statusLoading || !statusBillNo}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                {statusLoading ? "Mengecek..." : "Cek Status"}
              </button>
            </div>
            {statusResult && (
              <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-3 overflow-x-auto">
                {JSON.stringify(statusResult, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function RadioCard({ name, value, current, onChange, children }) {
  return (
    <label
      className={`flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm font-medium transition ${
        current === value
          ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
      }`}
    >
      <input type="radio" name={name} value={value} checked={current === value} onChange={onChange} className="hidden" />
      {children}
    </label>
  );
}

function SubmitBtn({ loading, label, color = "green" }) {
  const colors = {
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };
  return (
    <button type="submit" disabled={loading} className={`w-full ${colors[color]} disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition`}>
      {loading ? "Memproses..." : label}
    </button>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4">
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Error</p>
      <pre className="text-xs mt-1 text-red-600 dark:text-red-300 whitespace-pre-wrap">
        {typeof error === "object" ? JSON.stringify(error, null, 2) : error}
      </pre>
    </div>
  );
}

function ModeTag({ mode }) {
  const cls =
    mode === "sandbox"
      ? "text-blue-600 dark:text-blue-400"
      : mode === "mock"
      ? "text-yellow-600 dark:text-yellow-400"
      : mode === "production"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-600 dark:text-gray-400";
  return <span className={`font-semibold ${cls}`}>{mode?.toUpperCase()}</span>;
}

function ResultBox({ fields, paymentUrl, raw }) {
  return (
    <div className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl p-5 space-y-3">
      <p className="font-semibold text-green-700 dark:text-green-300">✅ Berhasil Dibuat</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.map(([k, v]) => (
          <>
            <span className="text-gray-500 dark:text-gray-400">{k}</span>
            <span className="text-gray-800 dark:text-gray-200">{v}</span>
          </>
        ))}
      </div>
      {paymentUrl && (
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition mt-2"
        >
          Buka Halaman Pembayaran →
        </a>
      )}
      <details className="mt-2">
        <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700">Raw Response</summary>
        <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-2 overflow-x-auto">
          {JSON.stringify(raw, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "singapay", label: "SingaPay" },
  { id: "faspay",   label: "Faspay" },
];

export default function TestPaymentPage() {
  const [activeTab, setActiveTab] = useState("singapay");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
          <h1 className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
            ⚠️ Halaman Test Pembayaran
          </h1>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
            Hanya untuk pengujian. <strong>Tidak ada batas minimal pembayaran.</strong>{" "}
            Gunakan mode <strong>sandbox/mock</strong> untuk menghindari transaksi nyata.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl shadow p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "singapay" && <SingapaySection />}
        {activeTab === "faspay" && <FaspaySection />}
      </div>
    </div>
  );
}
