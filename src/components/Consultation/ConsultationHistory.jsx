import React, { useState, useEffect } from "react";
import { consultationApi } from "../../services/consultationApi";
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal, 
  Star,
  MessageSquare,
  AlertCircle
} from "lucide-react";

const ConsultationHistory = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await consultationApi.getMySessions();
      setSessions(response.data.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Riwayat Konsultasi</h2>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
           <p className="text-gray-500">Anda belum memiliki riwayat konsultasi.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Video className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{session.topic}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(session.session_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                        Konsultan: {session.consultant?.user?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 self-end sm:self-center">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusStyle(session.status)}`}>
                    {session.status}
                  </span>
                  
                  {session.status === 'confirmed' && session.meeting_link && (
                    <a 
                      href={session.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Video size={16} />
                      Gabung Meet
                    </a>
                  )}

                  {session.status === 'completed' && !session.rating && (
                    <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                       <Star size={16} />
                       Beri Rating
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;
