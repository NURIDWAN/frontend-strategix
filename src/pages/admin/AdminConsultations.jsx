import React, { useState, useEffect } from "react";
import { 
  Users, 
  Package, 
  Plus, 
  Search, 
  UserPlus, 
  Calendar,
  MoreVertical,
  CheckCircle2,
  Settings,
  ShieldAlert,
  Edit,
  Trash2,
  ArrowRight
} from "lucide-react";
import adminAPI from "../../services/admin/adminApi";
import { toast } from "react-toastify";

const AdminConsultations = () => {
  const [activeTab, setActiveTab] = useState("consultants");
  const [consultants, setConsultants] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");


  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "consultants") {
        const res = await adminAPI.getConsultants();
        setConsultants(res.data.data);
      } else if (activeTab === "sessions") {
        const res = await adminAPI.getAllConsultationSessions();
        setSessions(res.data.data);
      }
    } catch (error) {
       toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignConsultant = async (e) => {
    e.preventDefault();
    if (!targetUserId) return;
    try {
      await adminAPI.assignConsultantRole(targetUserId);
      toast.success("User berhasil dijadikan Konsultan");
      setShowAssignModal(false);
      setTargetUserId("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah role user");
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manajemen Konsultasi</h1>
          <p className="text-gray-500 mt-1">Kelola pakar konsultan, paket berbayar, dan monitoring sesi.</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'consultants' && (
             <button 
               onClick={() => setShowAssignModal(true)}
               className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
             >
                <UserPlus size={18} /> Tambah Konsultan
             </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
         {[
           { id: 'consultants', label: 'Daftar Konsultan', icon: Users },
           { id: 'sessions', label: 'Monitoring Sesi', icon: Calendar }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
               activeTab === tab.id 
               ? 'border-green-600 text-green-600' 
               : 'border-transparent text-gray-400 hover:text-gray-600'
             }`}
           >
             <tab.icon size={18} />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl min-h-[400px]">
         {activeTab === 'consultants' && (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                       <th className="px-6 py-4">Nama Pakar</th>
                       <th className="px-6 py-4">Spesialisasi</th>
                       <th className="px-6 py-4">Email Kalender</th>
                       <th className="px-6 py-4">Status Akun</th>
                       <th className="px-6 py-4">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                       <tr><td colSpan="5" className="p-12 text-center text-gray-400">Loading...</td></tr>
                    ) : consultants.length === 0 ? (
                       <tr><td colSpan="5" className="p-12 text-center text-gray-400">Belum ada konsultan terdaftar.</td></tr>
                    ) : consultants.map(c => (
                       <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                                   {c.user.name.charAt(0)}
                                </div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{c.user.name}</div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-500">{c.specialization || '-'}</td>
                          <td className="px-6 py-5 text-xs font-mono text-gray-400">{c.google_calendar_id || 'Not Linked'}</td>
                          <td className="px-6 py-5">
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${c.user.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {c.user.account_status}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-green-600 transition-colors">
                                   <Settings size={16} />
                                </button>
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}

         {activeTab === 'sessions' && (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Member</th>
                        <th className="px-6 py-4">Konsultan</th>
                        <th className="px-6 py-4">Topik</th>
                        <th className="px-6 py-4">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {loading ? (
                        <tr><td colSpan="5" className="p-12 text-center text-gray-400">Loading...</td></tr>
                     ) : sessions.length === 0 ? (
                        <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">Belum ada riwayat sesi.</td></tr>
                     ) : sessions.map(s => (
                        <tr key={s.id} className="text-sm">
                           <td className="px-6 py-4 font-mono text-xs">{new Date(s.session_date).toLocaleDateString()} {s.start_time.substring(0, 5)}</td>
                           <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{s.member.name}</td>
                           <td className="px-6 py-4 text-green-600 font-bold">{s.consultant.user.name}</td>
                           <td className="px-6 py-4 text-gray-500 truncate max-w-[150px]">{s.topic}</td>
                           <td className="px-6 py-4">
                              <span className="text-[10px] font-black uppercase tracking-tight text-gray-400">{s.status}</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}


      </div>

      {/* Assign Modal (Simple) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-2xl shadow-2xl space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Konsultan Baru</h2>
              <form onSubmit={handleAssignConsultant} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">User ID (Existing User)</label>
                    <input 
                      type="number" 
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      placeholder="Masukkan ID User"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-green-600 outline-none dark:text-white"
                      required
                    />
                 </div>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-xs text-blue-700 flex gap-2">
                    <ShieldAlert size={14} className="shrink-0" />
                    <span>User akan mendapatkan role 'consultant' dan akses Dashboard Pakar.</span>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20">Konfirmasi</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsultations;
