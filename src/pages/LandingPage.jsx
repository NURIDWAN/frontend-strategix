import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BarChart3, DollarSign, TrendingUp, Shield, Users, Rocket, CheckCircle, ArrowRight, LineChart, Target, Zap, Calendar, FileText, Star, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { useSeo } from "../hooks/useSeo";
import WhatsAppWidget from "../components/Layout/WhatsAppWidget";

function LandingPage({ isDarkMode, toggleDarkMode }) {
  useSeo("home");
  const [searchParams] = useSearchParams();

  // Check for affiliate referral code in URL (?ref=slug)
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Save to localStorage for 30 days
      localStorage.setItem('affiliate_ref', refCode);
      localStorage.setItem('affiliate_ref_timestamp', Date.now().toString());
      console.log('[LandingPage] Affiliate ref saved from URL:', refCode);
    }
  }, [searchParams]);
  const features = [
    {
      icon: BarChart3,
      title: "Analisis Bisnis Mendalam",
      description: "Dapatkan wawasan strategis tentang potensi model bisnis Anda dengan analisis data yang powerful. Simulasikan performa rencana Anda sebelum eksekusi.",
    },
    {
      icon: DollarSign,
      title: "Proyeksi Keuangan",
      description: "Susun rencana laba rugi dan arus kas (cash flow) secara otomatis. Hitung metrik kelayakan investasi seperti NPV, IRR, dan Payback Period secara instan.",
    },
    {
      icon: TrendingUp,
      title: "Forecast & Prediksi AI",
      description: "Prediksi pertumbuhan rencana bisnis Anda hingga 5 tahun ke depan dengan algoritma AI yang akurat untuk mendukung pengambilan keputusan strategis.",
    },
    {
      icon: LineChart,
      title: "Laporan Otomatis",
      description: "Hasilkan dokumen Business Plan (PDF) profesional yang mencakup visualisasi data keuangan lengkap, siap dipresentasikan kepada investor atau perbankan.",
    },
    {
      icon: Target,
      title: "Perencanaan Strategis",
      description: "Kelola visi dan misi bisnis Anda melalui modul strategi terstruktur. Tetapkan target jangka panjang dan pantau progres penyusunan rencana Anda.",
    },
    {
      icon: Gift,
      title: "Program Afiliasi",
      description: "Dapatkan penghasilan pasif dengan mengajak rekan bisnis bergabung. Pantau komisi Anda secara real-time melalui dashboard afiliasi yang transparan.",
    },
  ];

  const benefits = [
    {
      icon: Gift,
      title: "Program Afiliasi",
      description: "Dapatkan passive income dengan mengajak bisnis lain bergabung dan raih komisi menarik.",
    },
    {
      icon: Shield,
      title: "Keamanan Data Terjamin",
      description: "Data bisnis Anda dilindungi dengan enkripsi tingkat enterprise dan backup otomatis.",
    },
    {
      icon: Rocket,
      title: "Implementasi Cepat",
      description: "Mulai gunakan platform dalam hitungan menit tanpa setup yang rumit.",
    },
    {
      icon: FileText,
      title: "Dukungan 24/7",
      description: "Tim support kami siap membantu kapanpun Anda membutuhkan bantuan.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <style>{`
        /* Color Palette Variables */
        :root {
          --primary-green: #167814;
          --dark-green: #084404;
          --accent-green: #10B517;
        }
        
        @media (prefers-color-scheme: dark) {
          :root {
            --primary-green: #10B517;
            --dark-green: #167814;
            --accent-green: #0d9414;
          }
        }

        /* Custom Green Utilities */
        .custom-green { color: var(--primary-green) !important; }
        .custom-green-dark { color: var(--dark-green) !important; }
        .custom-green-accent { color: var(--accent-green) !important; }
        .custom-green-bg { background-color: rgba(22, 120, 20, 0.08) !important; }
        .custom-green-bg-solid { background-color: var(--primary-green) !important; }
        .custom-green-border { border-color: var(--primary-green) !important; }
        .custom-green-border:hover { border-color: var(--accent-green) !important; }
        
        @media (prefers-color-scheme: dark) {
          .custom-green-bg { background-color: rgba(16, 181, 23, 0.15) !important; }
          .custom-green-bg-solid { background-color: var(--primary-green) !important; }
        }

        /* Smooth Animations */
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Professional Hover Effects */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
      {/* Navigation */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section - Corporate Professional */}
      <section className="relative px-4 pt-12 pb-8 md:pt-20 md:pb-12 overflow-hidden">
        {/* Background Image (Optional - if office-bg.jpg exists) */}
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]">
          <img src="/assets/images/office-bg.jpg" alt="" className="object-cover w-full h-full" onError={(e) => (e.target.style.display = "none")} />
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, #167814 0%, transparent 70%)" }}></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, #10B517 0%, transparent 70%)" }}></div>
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Content */}
            <div className="text-left animate-fade-in">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold mb-4 border-2 custom-green-border custom-green bg-white dark:bg-gray-800">
                <Zap className="w-2.5 h-2.5 mr-1.5" />
                PLATFORM MANAJEMEN BISNIS #1
              </div>

              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3 leading-[1.1] tracking-tight">
                Susun Rencana Bisnis
                <span className="block mt-0.5" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  Lebih Cerdas
                </span>
              </h1>

              <p className="mb-6 text-xs md:text-base font-light leading-relaxed text-gray-600 dark:text-gray-400">
                Platform all-in-one untuk penyusunan strategi, proyeksi keuangan otomatis (NPV, IRR, Payback Period), dan analisis SWOT berbasis AI.
                <span className="block mt-0.5 font-semibold text-gray-900 dark:text-white">Semua dalam satu solusi terintegrasi.</span>
              </p>

              <div className="flex flex-col gap-2 mb-6 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-base font-bold text-white transition-all duration-300 transform shadow-xl group rounded-xl hover:scale-105 hover:shadow-2xl"
                  style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}
                >
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 sm:ml-3 transition-transform group-hover:translate-x-1" size={18} />
                </Link>
                <button
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="inline-flex items-center justify-center px-5 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-base font-bold transition-all duration-300 border-2 rounded-xl hover:scale-105"
                  style={{
                    borderColor: isDarkMode ? "#10B517" : "#167814",
                    color: isDarkMode ? "#10B517" : "#167814",
                  }}
                >
                  Lihat Fitur
                </button>
              </div>


              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="custom-green" />
                  <span className="font-semibold">Akses Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="custom-green" />
                  <span className="font-semibold">Setup Instant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="custom-green" />
                  <span className="font-semibold">500+ Bisnis Bergabung</span>
                </div>
              </div>
            </div>

            {/* Right Column - Carousel Mockup Laptop */}
            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <MockupCarousel isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Bold Layout */}
      <section id="about" className="px-4 py-8 md:py-12 bg-white dark:bg-gray-800">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-8 md:mb-10 text-center">
            <h2 className="mb-4 text-2xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Mengapa
              <span className="block mt-0.5" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                Grapadi Strategix?
              </span>
            </h2>
            <p className="max-w-3xl mx-auto text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400">Fitur dan kemampuan unggulan yang membuat kami berbeda</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: Zap,
                title: "Teknologi AI yang Berbeda",
                description: "Satu-satunya platform yang menyusun draf rencana bisnis komprehensif dalam hitungan menit menggunakan kecerdasan buatan.",
              },
              {
                icon: Target,
                title: "Metode Strategix",
                description: "Proses otomatis yang menggabungkan input ide Anda dengan riset pasar cerdas untuk proyeksi keuangan yang akurat.",
              },
              {
                icon: Users,
                title: "Dukungan Ahli Berpengalaman",
                description: "Anda tidak sendirian. Tim konsultan senior kami siap mendampingi untuk memvalidasi dan menyempurnakan rencana bisnis Anda.",
              },
              {
                icon: CheckCircle,
                title: "Standar Investor & Bank",
                description: "Hasil dokumen dirancang sesuai standar profesional untuk memudahkan Anda mendapatkan pendanaan atau kerja sama strategis.",
              },
              {
                icon: TrendingUp,
                title: "Kisah Sukses Pengguna",
                description: "Lihat bagaimana para wirausaha mengubah ide menjadi unit bisnis nyata dengan perencanaan yang matang.",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-4 md:p-6 text-left transition-all duration-300 bg-white border-2 border-gray-200 group rounded-2xl dark:bg-gray-700 hover-lift dark:border-gray-600"
                >
                  <div className="flex items-center justify-center w-10 md:w-12 h-10 md:h-12 mb-3 md:mb-4 transition-all duration-300 rounded-xl group-hover:scale-110" style={{ backgroundColor: isDarkMode ? "rgba(16, 181, 23, 0.15)" : "rgba(22, 120, 20, 0.1)" }}>
                    <Icon className="custom-green" size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="mb-2 md:mb-3 text-sm md:text-base font-black text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Modern Grid */}
      <section id="features" className="px-4 py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-8 md:mb-10 text-center">
            <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase rounded-full custom-green-bg custom-green">Fitur Unggulan</div>
            <h2 className="mb-2 text-2xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Platform Lengkap untuk
              <span className="block mt-0.5" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                Kesuksesan Bisnis Anda
              </span>
            </h2>
            <p className="max-w-3xl mx-auto text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400">Dari perencanaan hingga eksekusi - semua tools yang Anda butuhkan dalam satu dashboard terintegrasi</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-3 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="relative p-4 md:p-6 overflow-hidden bg-white border-2 border-gray-200 group dark:bg-gray-800 rounded-2xl hover-lift dark:border-gray-700 hover:border-opacity-0">
                  {/* Hover gradient overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, transparent 0%, ${isDarkMode ? "rgba(16, 181, 23, 0.05)" : "rgba(22, 120, 20, 0.05)"} 100%)` }}
                  ></div>

                  <div className="relative z-10">
                    <div
                      className="flex items-center justify-center w-12 md:w-14 h-12 md:h-14 mb-3 md:mb-4 transition-all duration-300 rounded-2xl group-hover:scale-110"
                      style={{ backgroundColor: isDarkMode ? "rgba(16, 181, 23, 0.15)" : "rgba(22, 120, 20, 0.1)" }}
                    >
                      <Icon className="custom-green" size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="mb-3 md:mb-4 text-sm md:text-base font-black text-gray-900 transition-colors duration-300 dark:text-white group-hover:custom-green">{feature.title}</h3>
                    <p className="text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section - Value Propositions */}
      <section className="px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase rounded-full custom-green-bg custom-green">Keunggulan Kompetitif</div>
            <h2 className="mb-2 text-2xl font-black tracking-tight text-gray-900 md:text-3xl dark:text-white">
              Teknologi & Inovasi untuk
              <span className="block mt-0.5" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                Pertumbuhan Bisnis Anda
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Value 1 - AI Analytics */}
            <div className="relative p-5 overflow-hidden bg-white border-2 border-gray-200 rounded-lg group dark:bg-gray-800 dark:border-gray-700 hover-lift">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle, ${isDarkMode ? "#10B517" : "#167814"} 0%, transparent 70%)` }}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-3 transition-all duration-300 rounded-lg shadow-lg group-hover:scale-110" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                  <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="mb-2 text-base font-black text-gray-900 dark:text-white">AI-Powered Analytics</h3>
                <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  Manfaatkan kekuatan Artificial Intelligence untuk analisis bisnis yang lebih akurat. Algoritma kami terus belajar dari data untuk memberikan insight yang relevan.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  <TrendingUp size={16} strokeWidth={2.5} />
                  <span>95% akurasi prediksi</span>
                </div>
              </div>
            </div>

            {/* Value 2 - All-in-One */}
            <div className="relative p-5 overflow-hidden bg-white border-2 border-gray-200 rounded-lg group dark:bg-gray-800 dark:border-gray-700 hover-lift">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle, ${isDarkMode ? "#10B517" : "#167814"} 0%, transparent 70%)` }}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-3 transition-all duration-300 rounded-lg shadow-lg group-hover:scale-110" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                  <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="mb-2 text-base font-black text-gray-900 dark:text-white">All-in-One Platform</h3>
                <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">Satu platform untuk semua kebutuhan. Dari perencanaan strategis hingga forecast dan reporting - semua terintegrasi dalam satu dashboard.</p>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  <CheckCircle size={16} strokeWidth={2.5} />
                  <span>10+ modul terintegrasi</span>
                </div>
              </div>
            </div>

            {/* Value 3 - Security */}
            <div className="relative p-5 overflow-hidden bg-white border-2 border-gray-200 rounded-lg group dark:bg-gray-800 dark:border-gray-700 hover-lift">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle, ${isDarkMode ? "#10B517" : "#167814"} 0%, transparent 70%)` }}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-3 transition-all duration-300 rounded-lg shadow-lg group-hover:scale-110" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                  <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="mb-2 text-base font-black text-gray-900 dark:text-white">Enterprise Security</h3>
                <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">Data bisnis Anda dilindungi dengan enkripsi tingkat enterprise, backup otomatis, dan infrastruktur cloud terpercaya 24/7.</p>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  <Shield size={16} strokeWidth={2.5} />
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
            </div>

            {/* Value 4 - Support */}
            <div className="relative p-5 overflow-hidden bg-white border-2 border-gray-200 rounded-lg group dark:bg-gray-800 dark:border-gray-700 hover-lift">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle, ${isDarkMode ? "#10B517" : "#167814"} 0%, transparent 70%)` }}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-3 transition-all duration-300 rounded-lg shadow-lg group-hover:scale-110" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                  <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="mb-2 text-base font-black text-gray-900 dark:text-white">Expert Support 24/7</h3>
                <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">Tim support berpengalaman siap membantu kapan saja. Live chat, email, atau phone support dengan respons dalam 30 menit.</p>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  <Star size={16} strokeWidth={2.5} />
                  <span>4.9/5 rating kepuasan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Bold Numbers */}
          <div className="pt-12 mt-12 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="p-4 text-center group hover-lift rounded-2xl">
                <div className="mb-2 text-2xl font-black" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  250+
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Bisnis Terdaftar</div>
              </div>
              <div className="p-6 text-center group hover-lift rounded-2xl">
                <div className="mb-3 text-2xl font-black" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  500+
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Business Plans</div>
              </div>
              <div className="p-4 text-center group hover-lift rounded-2xl">
                <div className="mb-2 text-2xl font-black" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  40%
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Peningkatan Efisiensi</div>
              </div>
              <div className="p-4 text-center group hover-lift rounded-2xl">
                <div className="mb-2 text-2xl font-black" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  90%
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Report Section - Promotional */}
      <section className="px-4 py-10 md:py-14 bg-white dark:bg-gray-800">
        <div className="container max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-full">
              <div className="inline-flex items-center px-3 py-1.5 mb-4 text-xs font-bold tracking-wider uppercase rounded-full custom-green-bg custom-green">
                Hasil Nyata
              </div>
              <h2 className="mb-3 text-xl md:text-3xl font-black leading-tight text-gray-900 dark:text-white">
                Contoh Laporan Bisnis
                <span className="block mt-0.5" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                  Profesional & Komprehensif
                </span>
              </h2>
              <p className="mb-6 text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Lihat hasil akhir yang akan Anda dapatkan. Grapadi Strategix menghasilkan laporan rencana bisnis standar investor yang siap digunakan.
              </p>

              <div className="text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-6">
                <p className="font-semibold text-gray-900 dark:text-white mb-4">Apa yang Anda dapatkan:</p>
              </div>

              <ul className="space-y-2.5 md:space-y-3 inline-block text-left mb-8">
                {[
                  "Analisis SWOT & Pasar Mendalam",
                  "Proyeksi Keuangan Otomatis",
                  "Layout Profesional",
                  "Export ke PDF"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="w-full flex justify-center">
                <a
                  href={`${import.meta.env.BASE_URL}assets/docs/sample-report.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3.5 text-xs md:text-base font-bold text-white transition-all duration-300 transform shadow-lg group rounded-lg hover:scale-105"
                  style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}
                >
                  <FileText className="mr-2" size={18} />
                  Unduh Contoh Laporan (PDF)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Professional */}
      <section
        id="contact"
        className="relative px-4 py-12 overflow-hidden"
        style={{ background: isDarkMode ? "linear-gradient(135deg, #084404 0%, #167814 50%, #10B517 100%)" : "linear-gradient(135deg, #084404 0%, #167814 50%, #10B517 100%)" }}
      >
        {/* Optional Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img src="/assets/images/office-bg-2.jpg" alt="" className="object-cover w-full h-full mix-blend-overlay" onError={(e) => (e.target.style.display = "none")} />
        </div>

        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 transform border-4 border-white top-20 left-20 rounded-3xl rotate-12"></div>
          <div className="absolute border-4 border-white rounded-full bottom-20 right-20 w-80 h-80"></div>
          <div className="absolute transform rotate-45 -translate-x-1/2 -translate-y-1/2 border-4 border-white top-1/2 left-1/2 w-96 h-96 rounded-3xl"></div>
        </div>

        <div className="container relative z-10 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1.5 mb-4 text-xs font-black tracking-wider text-white uppercase rounded-full bg-white/20 backdrop-blur-sm">
              <Rocket className="w-3 h-3 mr-1.5" />
              Mulai Transformasi Digital Anda
            </div>

            <h2 className="mb-4 text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
              Siap Mengoptimalkan
              <span className="block mt-0.5">Bisnis Anda?</span>
            </h2>

            <p className="max-w-3xl mx-auto mb-6 text-sm font-light leading-relaxed text-white/95">
              Bergabung dengan <span className="font-black">500+ bisnis</span> yang sudah mencapai pertumbuhan signifikan dengan Grapadi Strategix
            </p>

            {/* CTA Buttons - Bold Design */}
            <div className="flex flex-col justify-center gap-2 mb-6 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-black transition-all duration-300 transform bg-white rounded-md shadow-2xl group hover:bg-gray-50 hover:scale-105"
                style={{ color: "#167814" }}
              >
                <CheckCircle className="mr-1.5 transition-transform group-hover:rotate-12" size={18} strokeWidth={3} />
                Mulai Gratis
                <ArrowRight className="ml-1.5 transition-transform group-hover:translate-x-1" size={18} strokeWidth={3} />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 text-sm font-black text-white transition-all duration-300 transform border-2 border-white rounded-md group backdrop-blur-sm bg-white/10 hover:bg-white hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#167814";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }}
              >
                Masuk ke Akun
              </Link>
            </div>

            {/* Trust Indicators - Bold */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-base font-bold text-white">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-white" strokeWidth={3} />
                <span>Platform Terpercaya</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-white" strokeWidth={3} />
                <span>Data Aman & Terenkripsi</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-white" strokeWidth={3} />
                <span>Support 24/7</span>
              </div>
            </div>

            {/* Stats - Compact Version */}
            <div className="grid grid-cols-4 gap-8 pt-16 mt-16 border-t-2 border-white/20">
              {[
                { icon: Users, number: "250+", label: "Bisnis" },
                { icon: TrendingUp, number: "40%", label: "Efisiensi" },
                { icon: Star, number: "4.9/5", label: "Rating" },
                { icon: Zap, number: "24/7", label: "Support" },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="text-center group">
                    <Icon className="w-10 h-10 mx-auto mb-3 text-white transition-transform group-hover:scale-110" strokeWidth={2.5} />
                    <div className="mb-2 text-2xl font-black text-white">{stat.number}</div>
                    <div className="text-sm font-bold tracking-wider uppercase text-white/80">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Widget */}
      <WhatsAppWidget />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Carousel Component for Laptop Mockups
function MockupCarousel({ isDarkMode }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[500px] group">
      {/* Mockup Images */}
      <div className="relative w-full h-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((num, index) => (
          <div
            key={num}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? "opacity-100 translate-x-0 scale-100" : index < currentSlide ? "opacity-0 -translate-x-full scale-95" : "opacity-0 translate-x-full scale-95"
              }`}
          >
            <img
              src={`/assets/images/dashboard-mockup-${num}.png`}
              alt={`Dashboard Feature ${num}`}
              className="object-contain w-full h-full drop-shadow-2xl"
              onError={(e) => {
                // Fallback placeholder
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            {/* Fallback Placeholder */}
            <div
              className="absolute inset-0 items-center justify-center"
              style={{
                display: "none",
                background: `linear-gradient(135deg, ${isDarkMode ? "#10B517" : "#167814"} 0%, ${isDarkMode ? "#0d9414" : "#084404"} 100%)`,
              }}
            >
              <div className="p-8 text-center text-white">
                <BarChart3 size={80} className="mx-auto mb-4 opacity-80" />
                <p className="text-lg font-bold">Mockup {num}</p>
                <p className="mt-2 text-sm opacity-80">Upload: dashboard-mockup-{num}.png</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute z-10 flex items-center justify-center w-12 h-12 transition-opacity duration-300 -translate-y-1/2 rounded-full shadow-lg opacity-0 left-4 top-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group-hover:opacity-100 hover:scale-110"
        style={{ color: isDarkMode ? "#10B517" : "#167814" }}
      >
        <ChevronLeft size={24} strokeWidth={3} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute z-10 flex items-center justify-center w-12 h-12 transition-opacity duration-300 -translate-y-1/2 rounded-full shadow-lg opacity-0 right-4 top-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group-hover:opacity-100 hover:scale-110"
        style={{ color: isDarkMode ? "#10B517" : "#167814" }}
      >
        <ChevronRight size={24} strokeWidth={3} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute z-10 flex gap-2 -translate-x-1/2 -bottom-8 left-1/2">
        {[...Array(totalSlides)].map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8" : "hover:opacity-75"}`}
            style={{
              backgroundColor: index === currentSlide ? (isDarkMode ? "#10B517" : "#167814") : isDarkMode ? "rgba(16, 181, 23, 0.3)" : "rgba(22, 120, 20, 0.3)",
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default LandingPage;
