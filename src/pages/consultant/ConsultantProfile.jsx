import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Globe, Loader2, Save, UserCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import consultantApi from "../../services/consultant/consultantApi";

const dayLabels = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 7, label: "Sun" },
];

const ConsultantProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileStats, setProfileStats] = useState({ average_rating: 0, total_completed_sessions: 0 });
  const [form, setForm] = useState({
    specialization: "",
    bio: "",
    google_calendar_id: "",
    working_hours_start: "09:00",
    working_hours_end: "17:00",
    working_days: [1, 2, 3, 4, 5],
    is_available: true,
  });

  const fetchProfile = async () => {
    try {
      const response = await consultantApi.getProfile();
      const data = response.data.data || {};
      setForm({
        specialization: data.specialization || "",
        bio: data.bio || "",
        google_calendar_id: data.google_calendar_id || "",
        working_hours_start: data.working_hours_start || "09:00",
        working_hours_end: data.working_hours_end || "17:00",
        working_days: data.working_days || [1, 2, 3, 4, 5],
        is_available: Boolean(data.is_available),
      });
      setProfileStats({
        average_rating: data.average_rating || 0,
        total_completed_sessions: data.total_completed_sessions || 0,
      });
    } catch (error) {
      toast.error("Gagal memuat profil konsultan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.working_days.includes(day);
      const nextDays = exists ? prev.working_days.filter((d) => d !== day) : [...prev.working_days, day];
      return { ...prev, working_days: nextDays.sort((a, b) => a - b) };
    });
  };

  const saveProfile = async () => {
    if (!form.specialization.trim()) {
      toast.error("Spesialisasi wajib diisi");
      return;
    }

    if (form.working_days.length === 0) {
      toast.error("Pilih minimal satu hari kerja");
      return;
    }

    setSaving(true);
    try {
      await consultantApi.updateAvailability(form);
      toast.success("Profil konsultan berhasil diperbarui");
      fetchProfile();
    } catch (error) {
      toast.error("Gagal menyimpan profil konsultan");
    } finally {
      setSaving(false);
    }
  };

  const daySummary = useMemo(() => {
    const labels = dayLabels.filter((d) => form.working_days.includes(d.id)).map((d) => d.label);
    return labels.length ? labels.join(", ") : "Belum ada hari kerja";
  }, [form.working_days]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Consultant Identity</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Profil & Availability</h1>
            <p className="mt-2 text-sm text-emerald-50">Atur informasi profesional, jam kerja, dan status menerima konsultasi.</p>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Simpan Profil
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Informasi Utama</h2>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Spesialisasi</label>
                <input
                  value={form.specialization}
                  onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Contoh: Business Growth Consultant"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Biografi</label>
                <textarea
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Jelaskan pengalaman dan pendekatan konsultasi Anda"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Google Calendar ID</label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={form.google_calendar_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, google_calendar_id: e.target.value }))}
                    placeholder="nama@gmail.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Jam Kerja</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Mulai</label>
                <input
                  type="time"
                  value={form.working_hours_start}
                  onChange={(e) => setForm((prev) => ({ ...prev, working_hours_start: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Selesai</label>
                <input
                  type="time"
                  value={form.working_hours_end}
                  onChange={(e) => setForm((prev) => ({ ...prev, working_hours_end: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Hari Kerja</p>
              <div className="flex flex-wrap gap-2">
                {dayLabels.map((day) => {
                  const active = form.working_days.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="text-sm font-bold text-slate-800">Status menerima sesi</p>
                <p className="text-xs text-slate-500">{form.is_available ? "Aktif menerima konsultasi" : "Nonaktif sementara"}</p>
              </div>
              <button
                onClick={() => setForm((prev) => ({ ...prev, is_available: !prev.is_available }))}
                className={`relative h-7 w-14 rounded-full transition ${form.is_available ? "bg-emerald-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${form.is_available ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">Performa</h3>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs text-slate-500">Rating Rata-Rata</p>
                <p className="text-2xl font-black text-emerald-700">{profileStats.average_rating}</p>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3">
                <p className="text-xs text-slate-500">Sesi Selesai</p>
                <p className="text-2xl font-black text-cyan-700">{profileStats.total_completed_sessions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">Ringkasan Kerja</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2"><UserCircle2 size={15} /> {form.specialization || "Spesialisasi belum diisi"}</p>
              <p className="inline-flex items-center gap-2"><CheckCircle2 size={15} /> Hari kerja: {daySummary}</p>
              <p className="inline-flex items-center gap-2"><CheckCircle2 size={15} /> Jam: {form.working_hours_start} - {form.working_hours_end}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultantProfile;
