import { useState } from "react";
import { ChevronDown, Zap, Target, Users, CheckCircle, TrendingUp } from "lucide-react";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

function FAQ({ isDarkMode, toggleDarkMode }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categoryIcons = {
    "Tentang Produk": Zap,
    "Proses & Fitur": Target,
    "Dukungan Ahli": Users,
    "Keamanan & Teknis": CheckCircle,
  };

  const faqData = [
    {
      category: "Tentang Produk",
      questions: [
        {
          q: "Apa itu Grapadi Strategix?",
          a: "Grapadi Strategix adalah platform perencanaan bisnis berbasis AI yang membantu pengusaha menyusun dokumen Business Plan profesional secara otomatis, cepat, dan akurat sesuai standar industri.",
        },
        {
          q: "Apakah rencana bisnis yang dihasilkan AI cukup akurat?",
          a: "Ya. AI kami dilatih menggunakan metodologi konsultasi bisnis yang teruji. Namun, yang membedakan kami adalah adanya opsi pendampingan dari ahli berpengalaman untuk memvalidasi dan menyempurnakan draf tersebut agar benar-benar siap pakai.",
        },
      ],
    },
    {
      category: "Proses & Fitur",
      questions: [
        {
          q: "Berapa lama waktu yang dibutuhkan untuk membuat satu Business Plan?",
          a: "Dengan teknologi AI kami, draf awal rencana bisnis Anda bisa selesai dalam hitungan menit setelah Anda menginput informasi dasar mengenai ide bisnis Anda.",
        },
        {
          q: "Apakah saya bisa mengubah dokumen setelah dihasilkan oleh AI?",
          a: "Tentu saja. Anda memiliki kendali penuh untuk mengedit, menambah, atau menyesuaikan setiap bagian dari dokumen tersebut melalui dashboard yang intuitif.",
        },
        {
          q: "Apa saja yang termasuk dalam dokumen Business Plan-nya?",
          a: "Dokumen mencakup analisis pasar, strategi pemasaran, rencana operasional, hingga proyeksi keuangan (laba rugi, arus kas, dan neraca) yang komprehensif.",
        },
      ],
    },
    {
      category: "Dukungan Ahli",
      questions: [
        {
          q: "Bagaimana cara saya mendapatkan bantuan dari ahli berpengalaman?",
          a: "Kami menyediakan sesi konsultasi atau peninjauan dokumen oleh tim konsultan senior kami (tergantung paket layanan yang Anda pilih) untuk memastikan strategi Anda memiliki landasan yang kuat.",
        },
        {
          q: "Apakah saya tetap butuh konsultan jika sudah pakai AI?",
          a: "AI sangat membantu dalam kecepatan dan struktur data. Namun, peran ahli kami adalah memberikan insight strategis dan sentuhan personal yang seringkali menjadi penentu keberhasilan saat berhadapan dengan investor atau bank.",
        },
      ],
    },
    {
      category: "Keamanan & Teknis",
      questions: [
        {
          q: "Apakah data ide bisnis saya aman?",
          a: "Keamanan data adalah prioritas kami. Semua informasi yang Anda masukkan dienkripsi secara ketat dan tidak akan dibagikan kepada pihak ketiga manapun.",
        },
        {
          q: "Dapatkah saya mengunduh hasilnya dalam format apa?",
          a: "Hasil rencana bisnis Anda dapat diunduh dalam format profesional seperti PDF atau Word, sehingga siap untuk langsung dipresentasikan atau dicetak.",
        },
      ],
    },
  ];

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, #167814 0%, transparent 70%)" }}></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, #10B517 0%, transparent 70%)" }}></div>
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-bold bg-white border-2 rounded-full dark:bg-gray-800" style={{ borderColor: isDarkMode ? "#10B517" : "#167814", color: isDarkMode ? "#10B517" : "#167814" }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              BANTUAN & DUKUNGAN
            </div>

            <h1 className="mb-6 text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-gray-900 dark:text-white">
              Pertanyaan yang Sering Diajukan
              <span className="block mt-2" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                (FAQ)
              </span>
            </h1>

            <p className="max-w-3xl mx-auto mb-8 text-sm md:text-lg text-gray-600 dark:text-gray-400">
              Temukan jawaban untuk pertanyaan umum tentang Grapadi Strategix, fitur-fitur kami, dan bagaimana platform kami dapat membantu kesuksesan bisnis Anda.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="px-4 py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-5xl mx-auto">
          {faqData.map((section, sectionIndex) => {
            const IconComponent = categoryIcons[section.category];
            const categoryColors = {
              "Tentang Produk": { light: "#FF6B6B", lightBg: "rgba(255, 107, 107, 0.1)", dark: "#FF6B6B", darkBg: "rgba(255, 107, 107, 0.15)" },
              "Proses & Fitur": { light: "#4ECDC4", lightBg: "rgba(78, 205, 196, 0.1)", dark: "#4ECDC4", darkBg: "rgba(78, 205, 196, 0.15)" },
              "Dukungan Ahli": { light: "#95E1D3", lightBg: "rgba(149, 225, 211, 0.1)", dark: "#95E1D3", darkBg: "rgba(149, 225, 211, 0.15)" },
              "Keamanan & Teknis": { light: "#6C63FF", lightBg: "rgba(108, 99, 255, 0.1)", dark: "#6C63FF", darkBg: "rgba(108, 99, 255, 0.15)" },
            };

            const colors = categoryColors[section.category];
            const iconColor = isDarkMode ? colors.dark : colors.light;
            const bgColor = isDarkMode ? colors.darkBg : colors.lightBg;

            return (
              <div key={sectionIndex} className="mb-16">
                <div className="flex items-center gap-4 mb-8 group/header">
                  <div
                    className="relative p-3 overflow-hidden transition-all duration-500 transform shadow-md rounded-xl group/header-hover:scale-110 hover:shadow-lg"
                    style={{
                      backgroundColor: bgColor,
                      border: `1px solid ${iconColor}40`,
                      boxShadow: `0 4px 8px ${iconColor}20`,
                    }}
                  >
                    {/* Animated background gradient */}
                    <div
                      className="absolute inset-0 transition-opacity duration-500 opacity-0 group/header-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at center, ${iconColor}10 0%, transparent 70%)`,
                      }}
                    ></div>

                    <IconComponent size={24} strokeWidth={2} className="relative z-10 transition-all duration-500 transform group/header-hover:rotate-12" style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base md:text-lg md:text-xl font-semibold text-gray-900 transition-colors duration-300 dark:text-white" style={{ color: iconColor }}>
                      {section.category}
                    </h2>
                    <div className="w-12 h-1 mt-2 transition-all duration-300 rounded-full group/header-hover:w-16" style={{ backgroundColor: iconColor }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.questions.map((item, questionIndex) => {
                    const globalIndex = sectionIndex * 10 + questionIndex;
                    const isExpanded = expandedIndex === globalIndex;
                    const categoryColors = {
                      "Tentang Produk": { light: "#FF6B6B", dark: "#FF6B6B" },
                      "Proses & Fitur": { light: "#4ECDC4", dark: "#4ECDC4" },
                      "Dukungan Ahli": { light: "#95E1D3", dark: "#95E1D3" },
                      "Keamanan & Teknis": { light: "#6C63FF", dark: "#6C63FF" },
                    };

                    const colors = categoryColors[section.category];
                    const accentColor = isDarkMode ? colors.dark : colors.light;

                    return (
                      <div
                        key={questionIndex}
                        className="overflow-hidden transition-all duration-300 bg-white border-2 rounded-xl hover:shadow-lg dark:bg-gray-800 group/item"
                        style={{
                          borderColor: isExpanded ? accentColor : isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)",
                          boxShadow: isExpanded ? `0 10px 25px ${accentColor}25` : "none",
                          backgroundColor: isExpanded ? (isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)") : "",
                        }}
                      >
                        <button
                          onClick={() => toggleAccordion(globalIndex)}
                          className="flex items-center justify-between w-full px-4 md:px-6 py-4 md:py-5 text-left transition-colors duration-200 hover:bg-opacity-50"
                          style={{
                            backgroundColor: isExpanded ? (isDarkMode ? `${accentColor}10` : `${accentColor}08`) : "transparent",
                          }}
                        >
                          <h3 className="flex-1 text-xs md:text-base font-semibold text-gray-900 transition-colors duration-200 dark:text-white" style={{ color: isExpanded ? accentColor : "" }}>
                            {item.q}
                          </h3>
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
                            className="px-4 md:px-6 py-4 md:py-5 transition-all duration-300 border-t-2"
                            style={{
                              borderColor: `${accentColor}30`,
                              backgroundColor: isDarkMode ? `${accentColor}08` : `${accentColor}05`,
                            }}
                          >
                            <p className="text-xs md:text-sm font-light leading-relaxed text-gray-700 dark:text-gray-300">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-16 overflow-hidden" style={{ background: isDarkMode ? "linear-gradient(135deg, #084404 0%, #167814 50%, #10B517 100%)" : "linear-gradient(135deg, #084404 0%, #167814 50%, #10B517 100%)" }}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 border-4 border-white rounded-full"></div>
          <div className="absolute transform rotate-45 -translate-x-1/2 -translate-y-1/2 border-4 border-white top-1/2 left-1/2 w-96 h-96 rounded-3xl"></div>
        </div>

        <div className="container relative z-10 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl">Masih Ada Pertanyaan?</h2>

            <p className="max-w-2xl mx-auto mb-8 text-lg text-white/95">Tim support kami siap membantu Anda. Hubungi kami melalui WhatsApp untuk konsultasi gratis dan respon cepat dalam 30 menit.</p>

            <a
              href="https://wa.me/6285198887963"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold transition-all duration-300 transform bg-white shadow-xl rounded-xl hover:scale-105"
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

export default FAQ;
