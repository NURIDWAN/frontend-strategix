import { useState } from "react";
import { ChevronDown, Shield, Scale, FileText, Lock, Gavel, DollarSign, RefreshCw, FileCheck, AlertTriangle } from "lucide-react";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

function Terms({ isDarkMode, toggleDarkMode }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const termsData = [
    {
      id: 1,
      title: "1. Definisi Layanan",
      icon: Shield,
      color: { light: "#10B517", dark: "#10B517" },
      content:
        "Grapadi Strategix menyediakan layanan perangkat lunak berbasis Kecerdasan Buatan (AI) untuk membantu penyusunan rencana bisnis (business plan) dan layanan konsultasi oleh ahli manusia. Layanan ini bertujuan sebagai alat bantu perencanaan, bukan sebagai jaminan keberhasilan bisnis.",
    },
    {
      id: 2,
      title: "2. Batasan Tanggung Jawab (Limitation of Liability)",
      icon: Scale,
      color: { light: "#3B82F6", dark: "#60A5FA" },
      subsections: [
        {
          subtitle: "Hasil Berbasis AI:",
          text: "Pengguna memahami bahwa dokumen yang dihasilkan oleh AI bersifat referensi dan estimasi. Grapadi Strategix tidak bertanggung jawab atas kesalahan data, ketidakakuratan proyeksi, atau kesalahan logika bisnis yang dihasilkan oleh algoritma.",
        },
        {
          subtitle: "Keputusan Bisnis:",
          text: "Segala keputusan investasi, operasional, atau keuangan yang diambil berdasarkan dokumen dari Grapadi Strategix adalah tanggung jawab sepenuhnya dari Pengguna. Kami tidak bertanggung jawab atas kerugian finansial, kegagalan bisnis, atau hilangnya kesempatan keuntungan.",
        },
        {
          subtitle: "Pihak Ketiga:",
          text: "Grapadi Strategix tidak menjamin bahwa dokumen yang dihasilkan akan diterima oleh bank, investor, atau lembaga pemerintah. Kami tidak bertanggung jawab atas penolakan pendanaan dari pihak ketiga mana pun.",
        },
      ],
    },
    {
      id: 3,
      title: "3. Kepemilikan Kekayaan Intelektual",
      icon: FileText,
      color: { light: "#8B5CF6", dark: "#A78BFA" },
      subsections: [
        {
          subtitle: "Milik Pengguna:",
          text: "Hak cipta atas ide bisnis, draf dokumen, dan hasil akhir rencana bisnis yang dibuat oleh Pengguna melalui platform sepenuhnya menjadi milik Pengguna.",
        },
        {
          subtitle: "Milik Grapadi:",
          text: 'Seluruh teknologi, algoritma, desain antarmuka, logo, dan merek "Grapadi Strategix" adalah milik PT Grapadi Konsultan (atau entitas hukum terkait) dan dilindungi oleh undang-undang HAKI.',
        },
      ],
    },
    {
      id: 4,
      title: "4. Kerahasiaan Data & Informasi (NDA)",
      icon: Lock,
      color: { light: "#F59E0B", dark: "#FBBF24" },
      content:
        "Kami berkomitmen untuk menjaga kerahasiaan input ide bisnis Anda. Data Anda dienkripsi dan tidak akan diberikan kepada pihak ketiga tanpa izin. Grapadi Strategix berhak menggunakan data anonim (data yang tidak mengidentifikasi individu/perusahaan) untuk keperluan pengembangan algoritma dan peningkatan kualitas layanan tanpa melanggar privasi Pengguna.",
    },
    {
      id: 5,
      title: "5. Bukan Layanan Penasihat Hukum atau Akuntan Publik",
      icon: Gavel,
      color: { light: "#EF4444", dark: "#F87171" },
      content:
        "Layanan Grapadi Strategix (termasuk dukungan ahli) bersifat konsultasi manajemen strategis. Kami tidak menyediakan jasa hukum formal, audit akuntansi publik, atau penasihat pajak. Pengguna disarankan untuk tetap berkonsultasi dengan ahli hukum atau akuntan bersertifikat untuk kepatuhan regulasi di wilayah masing-masing.",
    },
    {
      id: 6,
      title: "6. Akurasi Proyeksi Keuangan",
      icon: DollarSign,
      color: { light: "#06B6D4", dark: "#22D3EE" },
      content:
        "Modul keuangan kami menggunakan formula standar akuntansi umum. Namun, karena perbedaan regulasi pajak dan biaya di setiap wilayah/industri, Pengguna wajib melakukan verifikasi mandiri terhadap hasil kalkulasi sebelum menggunakannya untuk laporan resmi.",
    },
    {
      id: 7,
      title: "7. Kebijakan Pembatalan dan Pengembalian",
      icon: RefreshCw,
      color: { light: "#EC4899", dark: "#F472B6" },
      content:
        "Mengingat produk kami adalah produk digital berbasis langganan atau sekali bayar yang memberikan akses instan ke kekayaan intelektual, maka biaya yang telah dibayarkan tidak dapat ditarik kembali (non-refundable), kecuali ditentukan lain oleh kebijakan promo khusus.",
    },
    {
      id: 8,
      title: "8. Perubahan Ketentuan",
      icon: FileCheck,
      color: { light: "#14B8A6", dark: "#2DD4BF" },
      content:
        "Grapadi Strategix berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan atas platform setelah perubahan tersebut dianggap sebagai persetujuan terhadap ketentuan baru.",
    },
    {
      id: 9,
      title: "9. Tanggung Jawab Data Keuangan",
      icon: AlertTriangle,
      color: { light: "#F97316", dark: "#FB923C" },
      subsections: [
        {
          subtitle: "Input Data:",
          text: "Seluruh angka, asumsi, dan data keuangan yang dimasukkan ke dalam platform adalah tanggung jawab sepenuhnya dari Pengguna. Grapadi Strategix tidak melakukan verifikasi atas kebenaran data yang dimasukkan oleh Pengguna.",
        },
        {
          subtitle: "Hasil Kalkulasi:",
          text: "Platform kami berfungsi sebagai alat hitung otomatis berdasarkan input dari Pengguna. Hasil proyeksi keuangan (seperti Laba/Rugi, Arus Kas, dan Neraca) sepenuhnya bergantung pada akurasi data yang dimasukkan Pengguna.",
        },
        {
          subtitle: "Tanggung Jawab Akhir:",
          text: "Pengguna mengakui bahwa Grapadi Strategix tidak bertanggung jawab atas kesalahan laporan, kerugian finansial, atau kegagalan investasi yang disebabkan oleh kesalahan input maupun interpretasi hasil proyeksi keuangan tersebut. Dokumen yang dihasilkan adalah draf rencana, bukan laporan keuangan audit resmi.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="relative px-4 pt-12 md:pt-24 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, #167814 0%, transparent 70%)" }}></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, #10B517 0%, transparent 70%)" }}></div>
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-xs md:text-sm font-bold border-2 rounded-full bg-white dark:bg-gray-800" style={{ borderColor: isDarkMode ? "#10B517" : "#167814", color: isDarkMode ? "#10B517" : "#167814" }}>
              <FileCheck className="w-4 h-4 mr-2" />
              SYARAT & KETENTUAN
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Syarat dan Ketentuan Layanan
              <span className="block mt-2" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                Grapadi Strategix
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-xs md:text-lg text-gray-600 dark:text-gray-400 mb-2">Terakhir Diperbarui: 1 Januari 2026</p>
          </div>
        </div>
      </section>

      {/* Terms Content - Accordion Style */}
      <section className="px-4 py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-5xl mx-auto">
          {/* Introduction Card */}
          <div className="p-4 md:p-6 mb-6 md:mb-8 bg-white rounded-2xl shadow-sm dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
            <p className="text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-100">
              Selamat datang di Grapadi Strategix. Dengan mengakses dan menggunakan platform kami, Anda (selanjutnya disebut "Pengguna") dianggap telah membaca, memahami, dan menyetujui untuk terikat dengan Syarat dan Ketentuan ini.
            </p>
          </div>

          {/* Accordion Terms */}
          <div className="space-y-2 md:space-y-3">
            {termsData.map((term, index) => {
              const isExpanded = expandedIndex === index;
              const Icon = term.icon;
              const accentColor = isDarkMode ? term.color.dark : term.color.light;

              return (
                <div
                  key={term.id}
                  className="overflow-hidden transition-all duration-300 bg-white border-2 rounded-xl hover:shadow-lg dark:bg-gray-900"
                  style={{
                    borderColor: isExpanded ? accentColor : isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)",
                    boxShadow: isExpanded ? `0 10px 25px ${accentColor}25` : "none",
                  }}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="flex items-center justify-between w-full px-4 md:px-6 py-3 md:py-5 text-left transition-colors duration-200"
                    style={{
                      backgroundColor: isExpanded ? (isDarkMode ? `${accentColor}10` : `${accentColor}08`) : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                      <div
                        className="p-2 rounded-lg transition-all duration-300"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          transform: isExpanded ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        <Icon size={20} style={{ color: accentColor }} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xs md:text-base font-bold text-gray-900 dark:text-white transition-colors duration-200" style={{ color: isExpanded ? accentColor : "" }}>
                        {term.title}
                      </h3>
                    </div>
                    <ChevronDown
                      size={20}
                      className="flex-shrink-0 ml-4 transition-all duration-300"
                      style={{
                        color: isExpanded ? accentColor : isDarkMode ? "#9CA3AF" : "#6B7280",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <div
                      className="px-4 md:px-6 py-3 md:py-5 border-t-2"
                      style={{
                        borderColor: `${accentColor}30`,
                        backgroundColor: isDarkMode ? `${accentColor}08` : `${accentColor}05`,
                      }}
                    >
                      {term.content ? (
                        <p className="text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-100">{term.content}</p>
                      ) : (
                        <div className="space-y-4">
                          {term.subsections.map((sub, subIndex) => (
                            <div key={subIndex}>
                              <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white mb-2">{sub.subtitle}</h4>
                              <p className="text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-100">{sub.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative px-4 py-16 overflow-hidden" style={{ background: isDarkMode ? "linear-gradient(135deg, #084404 0%, #167814 50%, #10B517 100%)" : "linear-gradient(135deg, #084404 0%, #167814 50%, #10B517 100%)" }}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-white rounded-3xl rotate-45"></div>
        </div>

        <div className="container relative z-10 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-black text-white leading-tight">Hubungi Kami</h2>

            <p className="max-w-2xl mx-auto mb-8 text-lg text-white/95">
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui WhatsApp di <span className="font-bold">+62 851-9888-7963</span>
            </p>

            <a
              href="https://wa.me/6285198887963"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold transition-all duration-300 transform bg-white rounded-xl shadow-xl hover:scale-105"
              style={{ color: "#167814" }}
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Terms;
