import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Link2,
  Star,
  User,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import consultantApi from "../../services/consultant/consultantApi";

const statusStyleMap = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  no_show: "bg-slate-100 text-slate-600 border-slate-200",
};

const StatCard = ({ title, value, hint, icon: Icon, tone }) => (
  <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      </div>
      <div className={`rounded-xl p-3 ${tone}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ConsultantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  const fetchOverview = async () => {
    try {
      const response = await consultantApi.getDashboardOverview();
      setOverview(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat konten dashboard konsultan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = overview?.stats ?? {};
  const weeklyTrend = overview?.weekly_trend ?? [];
  const todayAgenda = overview?.today_agenda ?? [];
  const latestSessions = overview?.latest_sessions ?? [];

  const actionItems = useMemo(() => {
    const items = [];

    if ((stats.needs_meeting_link_count ?? 0) > 0) {
      items.push({
        label: "Tambahkan link meeting",
        detail: `${stats.needs_meeting_link_count} sesi mendatang belum memiliki link`,
        to: "/consultant/sessions",
      });
    }

    if ((todayAgenda?.length ?? 0) === 0) {
      items.push({
        label: "Belum ada agenda hari ini",
        detail: "Cek jadwal minggu ini untuk persiapan sesi berikutnya",
        to: "/consultant/schedule",
      });
    }

    if ((stats.completion_rate ?? 0) < 60) {
      items.push({
        label: "Rasio penyelesaian masih rendah",
        detail: `Completion rate saat ini ${stats.completion_rate ?? 0}%`,
        to: "/consultant/sessions",
      });
    }

    if (items.length === 0) {
      items.push({
        label: "Operasional stabil",
        detail: "Semua indikator utama dalam kondisi baik",
        to: "/consultant/sessions",
      });
    }

    return items;
  }, [stats, todayAgenda]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-16 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Konsultan Workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Dashboard Operasional Konsultan</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50">
              Pantau performa sesi, agenda harian, dan tindak lanjut user konsultasi dari satu tempat.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/consultant/schedule" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
              Buka Kalender
            </Link>
            <Link to="/consultant/sessions" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sesi Hari Ini" value={stats.today_count ?? 0} hint="Total agenda pada tanggal berjalan" icon={CalendarDays} tone="bg-emerald-100 text-emerald-700" />
        <StatCard title="Sesi Minggu Ini" value={stats.week_count ?? 0} hint="Akumulasi agenda minggu aktif" icon={Clock3} tone="bg-cyan-100 text-cyan-700" />
        <StatCard title="Sesi Selesai" value={stats.total_completed ?? 0} hint={`Completion rate ${stats.completion_rate ?? 0}%`} icon={CheckCircle2} tone="bg-lime-100 text-lime-700" />
        <StatCard title="Rating Rata-Rata" value={stats.average_rating ?? 0} hint={stats.is_available ? "Status menerima sesi: aktif" : "Status menerima sesi: nonaktif"} icon={Star} tone="bg-amber-100 text-amber-700" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Tren Aktivitas 7 Hari</h2>
          <p className="text-xs text-slate-500">Perbandingan total sesi vs sesi selesai</p>
        </div>
        {weeklyTrend.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Belum ada data tren pada periode ini.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="completedSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" name="Total Sesi" stroke="#0ea5e9" fill="url(#totalSessions)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Sesi Selesai" stroke="#10b981" fill="url(#completedSessions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Agenda Hari Ini</h2>
            <Link to="/consultant/schedule" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800">
              Detail kalender <ArrowRight size={16} />
            </Link>
          </div>

          {todayAgenda.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Waves className="mx-auto text-slate-300" size={26} />
              <p className="mt-2 text-sm font-semibold text-slate-600">Tidak ada sesi terjadwal hari ini.</p>
              <p className="mt-1 text-xs text-slate-500">Gunakan kalender untuk memeriksa agenda tanggal lainnya.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAgenda.map((session) => (
                <div key={session.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">{session.topic}</p>
                      <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><User size={13} /> {session.member?.name || "Member"}</span>
                        <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {String(session.start_time).substring(0, 5)} - {String(session.end_time).substring(0, 5)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusStyleMap[session.status] || statusStyleMap.pending}`}>
                        {session.status}
                      </span>
                      {session.meeting_link ? (
                        <a href={session.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
                          Join <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                          <Link2 size={13} /> Belum ada link
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-black text-slate-900">Butuh Tindakan</h2>
          <p className="mt-1 text-xs text-slate-500">Prioritas kerja untuk menjaga kualitas layanan konsultasi.</p>
          <div className="mt-4 space-y-3">
            {actionItems.map((item, idx) => (
              <Link key={`${item.label}-${idx}`} to={item.to} className="block rounded-xl border border-slate-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50/40">
                <p className="text-sm font-bold text-slate-800">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Riwayat Konsultasi Terbaru</h2>
          <Link to="/consultant/sessions" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">Buka semua riwayat</Link>
        </div>

        {latestSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Belum ada data sesi konsultasi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-2 py-3">Tanggal</th>
                  <th className="px-2 py-3">Member</th>
                  <th className="px-2 py-3">Topik</th>
                  <th className="px-2 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestSessions.map((session) => (
                  <tr key={session.id} className="border-t border-slate-100 text-sm">
                    <td className="px-2 py-3 text-slate-600">{formatDate(session.session_date)} {String(session.start_time).substring(0, 5)}</td>
                    <td className="px-2 py-3 font-semibold text-slate-800">{session.member?.name || "-"}</td>
                    <td className="px-2 py-3 text-slate-700">{session.topic}</td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusStyleMap[session.status] || statusStyleMap.pending}`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultantDashboard;
