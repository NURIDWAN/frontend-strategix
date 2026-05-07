import { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: ''
    });

    const waNumber = "6285198887963";

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = encodeURIComponent(
            `Halo Admin Grapadi Strategix,\n\n` +
            `Saya ingin bertanya:\n` +
            `Nama: ${formData.name}\n` +
            `No. HP: ${formData.phone}\n` +
            `Pesan: ${formData.notes}`
        );
        window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
        setIsOpen(false);
        setFormData({ name: '', phone: '', notes: '' });
    };

    return (
        <>
            {/* Widget Window - Fixed Bottom Right */}
            <div
                className={`
                    fixed bottom-6 right-6 z-[100] font-sans px-4 sm:px-0
                    transition-all duration-300 transform origin-bottom-right
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
                `}
            >
                <div className="w-full sm:w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Header with Brand Color */}
                    <div className="bg-[#167814] p-3 sm:p-5 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                        <div className="relative z-10">
                            <h3 className="text-base sm:text-lg font-bold">Butuh Bantuan?</h3>
                            <p className="text-[10px] sm:text-xs text-green-50 opacity-90 mt-0.5">Isi form untuk terhubung ke WhatsApp kami.</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="relative z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-3 sm:p-5">
                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#167814] focus:border-transparent outline-none transition-all text-xs sm:text-sm dark:text-gray-200 placeholder-gray-400"
                                    placeholder="Nama Anda"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">WhatsApp</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#167814] focus:border-transparent outline-none transition-all text-xs sm:text-sm dark:text-gray-200 placeholder-gray-400"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pesan</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#167814] focus:border-transparent outline-none transition-all text-xs sm:text-sm resize-none dark:text-gray-200 placeholder-gray-400"
                                    placeholder="Ada yang bisa kami bantu?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 sm:py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
                            >
                                <FaWhatsapp size={18} className="sm:block hidden group-hover:scale-110 transition-transform" />
                                <FaWhatsapp size={26} className="sm:hidden group-hover:scale-110 transition-transform" />
                                <span>Mulai Chat</span>
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 text-center text-[10px] text-gray-400">
                        Powered by Grapadi Strategix
                    </div>
                </div>
            </div>

            {/* Hanging Trigger Button - Fixed Middle Right */}
            <div className={`
                fixed right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300
                ${isOpen ? 'translate-x-[120%]' : 'translate-x-0'}
            `}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative bg-[#25D366] hover:bg-[#128C7E] text-white p-2 sm:p-3 md:p-4 pl-3 sm:pl-4 md:pl-6 rounded-l-3xl shadow-xl flex items-center justify-center transition-all border-y border-l border-white/20"
                    aria-label="Contact Admin"
                >
                    <FaWhatsapp size={24} className="md:hidden animate-bounce group-hover:animate-none" />
                    <FaWhatsapp size={32} className="hidden md:block animate-bounce group-hover:animate-none" />

                    {/* Tooltip */}
                    <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg pointer-events-none">
                        Hubungi Admin
                    </span>

                    {/* Pulse Ring */}
                    <span className="absolute w-full h-full rounded-l-3xl bg-[#25D366] opacity-75 animate-ping -z-10 group-hover:animate-none"></span>
                </button>
            </div>
        </>
    );
};

export default WhatsAppWidget;
