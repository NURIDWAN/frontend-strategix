import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Filter,
  Link,
  Link2,
  Loader2,
  Pencil,
  MessageSquareText,
  X,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import consultantApi from "../../services/consultant/consultantApi";

const statusOptions = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"];

const statusStyleMap = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  no_show: "bg-slate-100 text-slate-600 border-slate-200",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ConsultantSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        sort: "newest",
      };

      if (status !== "all") params.status = status;
      if (search.trim()) params.search = search.trim();
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await consultantApi.getSessions(params);
      setSessions(response.data.data || []);
      setMeta(response.data.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 });
    } catch (error) {
      toast.error("Gagal memuat riwayat sesi konsultasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, status, dateFrom, dateTo]);

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchSessions();
  };

  const updateStatus = async (id, nextStatus) => {
    setSubmittingId(id);
    try {
      await consultantApi.updateSession(id, { status: nextStatus });
      toast.success(`Status sesi diubah ke ${nextStatus}`);
      fetchSessions();
    } catch (error) {
      toast.error("Gagal memperbarui status sesi");
    } finally {
      setSubmittingId(null);
    }
  };

  const saveQuickDetails = async (id, notes, meetingLink) => {
    setSubmittingId(id);
    try {
      await consultantApi.updateSession(id, {
        notes_consultant: notes,
        meeting_link: meetingLink,
      });
      toast.success("Catatan/link sesi berhasil disimpan");
      fetchSessions();
    } catch (error) {
      toast.error("Gagal menyimpan detail sesi");
    } finally {
      setSubmittingId(null);
    }
  };

  const totalLabel = useMemo(() => `${meta.total || 0} sesi`, [meta.total]);

  const openDetails = (session) => {
    setSelectedSession(session);
  };

  const closeDetails = () => {
    setSelectedSession(null);
  };

  const saveFromModal = async ({ id, notes, meetingLink, status: nextStatus }) => {
    setSubmittingId(id);
    try {
      await consultantApi.updateSession(id, {
        notes_consultant: notes,
        meeting_link: meetingLink,
        status: nextStatus,
      });
      toast.success("Perubahan sesi berhasil disimpan");
      closeDetails();
      fetchSessions();
    } catch (error) {
      toast.error("Gagal menyimpan perubahan sesi");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Session Center</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Riwayat User Konsul</h1>
        <p className="mt-2 max-w-3xl text-sm text-emerald-50">Kelola jadwal mendatang dan histori konsultasi, termasuk update status, catatan, dan meeting link.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={applySearch} className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="relative xl:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari member/topik"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <div className="xl:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
          <div className="xl:col-span-2">
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 xl:col-span-2">
            <Filter size={16} /> Terapkan
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <p>Total data: <span className="font-bold text-slate-700">{totalLabel}</span></p>
          <p>Halaman {meta.current_page} dari {meta.last_page}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                <th className="px-4 py-3">Jadwal</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Topik</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Meeting & Catatan</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">Memuat sesi konsultasi...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">Tidak ada sesi yang sesuai filter.</td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    disabled={submittingId === session.id}
                    onCompleted={() => updateStatus(session.id, "completed")}
                    onCancelled={() => updateStatus(session.id, "cancelled")}
                    onOpenDetails={() => openDetails(session)}
                    onSaveDetails={(notes, meetingLink) => saveQuickDetails(session.id, notes, meetingLink)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex items-center justify-end gap-2">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={meta.current_page <= 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <button
          onClick={() => setPage((prev) => Math.min(meta.last_page || 1, prev + 1))}
          disabled={meta.current_page >= (meta.last_page || 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Berikutnya
        </button>
      </section>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={closeDetails}
          onSave={saveFromModal}
          saving={submittingId === selectedSession.id}
        />
      )}
    </div>
  );
};

const SessionRow = ({ session, disabled, onCompleted, onCancelled, onSaveDetails, onOpenDetails }) => {
  const [meetingLink, setMeetingLink] = useState(session.meeting_link || "");
  const [notes, setNotes] = useState(session.notes_consultant || "");

  return (
    <tr className="border-t border-slate-100 align-top text-sm">
      <td className="px-4 py-4 text-slate-600">
        <p className="font-semibold text-slate-800">{formatDate(session.session_date)}</p>
        <p className="text-xs text-slate-500">{String(session.start_time).substring(0, 5)} - {String(session.end_time).substring(0, 5)}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-800">{session.member?.name || "Member"}</p>
        <p className="text-xs text-slate-500">{session.member?.email || "-"}</p>
      </td>
      <td className="px-4 py-4 text-slate-700">{session.topic || "-"}</td>
      <td className="px-4 py-4">
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusStyleMap[session.status] || statusStyleMap.pending}`}>
          {session.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-2">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meeting-link"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-xs outline-none focus:border-emerald-400"
            />
          </div>
          <div className="relative">
            <MessageSquareText className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan konsultan"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-xs outline-none focus:border-emerald-400"
            />
          </div>
          <button
            onClick={() => onSaveDetails(notes, meetingLink)}
            disabled={disabled}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Simpan Detail
          </button>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <button
            onClick={onOpenDetails}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            <Pencil size={14} /> Detail
          </button>
          <button
            onClick={onCompleted}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={14} /> Selesai
          </button>
          <button
            onClick={onCancelled}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle size={14} /> Batal
          </button>
        </div>
      </td>
    </tr>
  );
};

const SessionDetailModal = ({ session, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    status: session.status || "pending",
    meetingLink: session.meeting_link || "",
    notes: session.notes_consultant || "",
  });

  const statusChoices = ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Detail Sesi</p>
            <h3 className="text-lg font-black text-slate-900">{session.topic}</h3>
            <p className="text-xs text-slate-500">{session.member?.name || "Member"} - {formatDate(session.session_date)} {String(session.start_time).substring(0, 5)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
            >
              {statusChoices.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Meeting Link</label>
            <div className="relative">
              <Link className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={form.meetingLink}
                onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://meeting-link"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Catatan Konsultan</label>
            <textarea
              rows={5}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Tuliskan ringkasan konsultasi, tindak lanjut, atau catatan penting"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
            Tutup
          </button>
          <button
            onClick={() => onSave({ id: session.id, notes: form.notes, meetingLink: form.meetingLink, status: form.status })}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : null}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultantSessions;
