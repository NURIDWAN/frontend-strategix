import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Search, User } from "lucide-react";
import { toast } from "react-toastify";
import consultantApi from "../../services/consultant/consultantApi";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusOptions = [
  { label: "Semua", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show", value: "no_show" },
];

const statusStyleMap = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  no_show: "bg-slate-100 text-slate-600 border-slate-200",
};

const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthRange = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { first, last };
};

const ConsultantSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async (dateContext) => {
    setLoading(true);
    try {
      const { first, last } = monthRange(dateContext);
      const response = await consultantApi.getSessions({
        date_from: toDateString(first),
        date_to: toDateString(last),
        per_page: 50,
        sort: "oldest",
      });
      setSessions(response.data.data || []);
    } catch (error) {
      toast.error("Gagal memuat jadwal kalender");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(currentDate);
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const emptyDays = Array(firstDay).fill(null);
  const monthDays = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);

  const sessionCountByDate = useMemo(() => {
    const counts = {};
    sessions.forEach((session) => {
      const dateKey = String(session.session_date).slice(0, 10);
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  const selectedDateKey = toDateString(selectedDate);

  const selectedDateSessions = useMemo(() => {
    return sessions
      .filter((session) => String(session.session_date).slice(0, 10) === selectedDateKey)
      .filter((session) => (statusFilter === "all" ? true : session.status === statusFilter))
      .filter((session) => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return true;
        return (
          (session.member?.name || "").toLowerCase().includes(keyword) ||
          (session.topic || "").toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => `${a.start_time}`.localeCompare(`${b.start_time}`));
  }, [searchTerm, selectedDateKey, sessions, statusFilter]);

  const goPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Kalender Konsultan</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Jadwal Konsultasi Interaktif</h1>
            <p className="mt-2 text-sm text-emerald-50">Pilih tanggal untuk melihat detail sesi, filter status, dan pantau agenda harian.</p>
          </div>
          <button onClick={goToday} className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            Kembali ke Hari Ini
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-emerald-600" size={22} />
              <h2 className="text-xl font-black text-slate-900">
                {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
              </h2>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              <button onClick={goPrevMonth} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-emerald-700">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goNextMonth} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-emerald-700">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-y border-slate-200 bg-slate-50">
            {weekdays.map((day) => (
              <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {[...emptyDays, ...monthDays].map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="min-h-[105px] border-r border-b border-slate-100 bg-slate-50/40" />;
              }

              const currentCellDate = new Date(year, month, day);
              const dateKey = toDateString(currentCellDate);
              const count = sessionCountByDate[dateKey] || 0;
              const isToday = dateKey === toDateString(new Date());
              const isSelected = dateKey === selectedDateKey;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(currentCellDate)}
                  className={`min-h-[105px] border-r border-b border-slate-100 p-2 text-left transition ${
                    isSelected ? "bg-emerald-50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-emerald-600 text-white" : "text-slate-600"}`}>
                      {day}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
          <h2 className="text-lg font-black text-slate-900">Detail {selectedDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</h2>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama/topik"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((id) => (
                  <div key={id} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : selectedDateSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Tidak ada sesi untuk filter ini pada tanggal terpilih.
              </div>
            ) : (
              selectedDateSessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black text-slate-800">{session.topic}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${statusStyleMap[session.status] || statusStyleMap.pending}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p className="inline-flex items-center gap-1"><User size={13} /> {session.member?.name || "Member"}</p>
                    <p className="inline-flex items-center gap-1"><Clock3 size={13} /> {String(session.start_time).substring(0, 5)} - {String(session.end_time).substring(0, 5)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultantSchedule;
