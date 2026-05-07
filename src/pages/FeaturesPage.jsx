import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, DollarSign, TrendingUp, LineChart, Target, Gift, X, CheckCircle, ArrowRight, Zap, Clock, TrendingDown, FileText, Users, Shield, Calendar, Award, Sparkles } from "lucide-react";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import WhatsAppWidget from "../components/Layout/WhatsAppWidget";

function FeaturesPage({ isDarkMode, toggleDarkMode }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      id: 1,
      icon: BarChart3,
      title: "Analisis Bisnis Mendalam",
      shortDesc: "Dapatkan wawasan strategis tentang potensi model bisnis Anda dengan analisis data yang powerful. Simulasikan performa rencana Anda sebelum eksekusi.",
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      detail: {
        headline: "Analisis Bisnis Mendalam: Buat Keputusan Berdasarkan Data, Bukan Asumsi!",
        subheadline: "Platform lengkap untuk menganalisis bisnis Anda. Input data, sistem mengolah, Anda dapat insight mendalam untuk keputusan yang tepat.",
        benefits: [
          {
            icon: Target,
            title: "Input Data Terstruktur",
            desc: "Form lengkap untuk input analisis pasar, kompetitor, SWOT, dan target market. Sistem guide Anda step-by-step.",
          },
          {
            icon: TrendingUp,
            title: "Analisis Kompetitor",
            desc: "Input data kompetitor (harga, strategi, positioning). Sistem visualisasikan perbandingan untuk identifikasi gap dan peluang.",
          },
          {
            icon: Award,
            title: "SWOT Analysis Framework",
            desc: "Template terstruktur untuk analisis Strengths, Weaknesses, Opportunities, dan Threats bisnis Anda dengan panduan lengkap.",
          },
          {
            icon: Sparkles,
            title: "Market Size Calculator",
            desc: "Hitung TAM, SAM, dan SOM dari data yang Anda input. Visualisasi chart otomatis untuk presentasi ke investor.",
          },
        ],
        howItWorks: [
          "Input data bisnis: nama, kategori, visi-misi, dan deskripsi bisnis",
          "Input analisis pasar: target market, segmentasi, market size (TAM/SAM/SOM)",
          "Input kompetitor: nama, pricing, strategi, kekuatan & kelemahan",
          "Sistem generate visualisasi dan insights dari semua data yang Anda input",
        ],
        simulation: {
          title: "Manfaat Analisis Terstruktur",
          items: [
            "Analisis kompetitor sistematis: Identifikasi 3-5 gap market baru",
            "SWOT yang jelas: Fokus pada strength, mitigasi weakness",
            "Data market size: Lebih mudah pitch ke investor (success rate +40%)",
            "Semua data terintegrasi di satu dashboard, hemat waktu analisis",
          ],
          result: "Total impact: Decision making 2x lebih cepat dan 50% lebih akurat!",
        },
        cta: "Mulai Analisis Gratis",
      },
    },
    {
      id: 2,
      icon: DollarSign,
      title: "Proyeksi Keuangan",
      shortDesc: "Susun rencana laba rugi dan arus kas (cash flow) secara otomatis. Hitung metrik kelayakan investasi seperti NPV, IRR, dan Payback Period secara instan.",
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      detail: {
        headline: "Manajemen Keuangan Terstruktur: Catat, Analisis, Optimasi!",
        subheadline: "Sistem pencatatan keuangan lengkap dari input transaksi hingga laporan profesional. Semua data keuangan bisnis Anda dalam satu platform.",
        benefits: [
          {
            icon: DollarSign,
            title: "Input Transaksi Mudah",
            desc: "Form sederhana untuk catat pendapatan & pengeluaran. Pilih kategori, input nominal, dan sistem otomatis hitung total.",
          },
          {
            icon: TrendingDown,
            title: "Analisis Pengeluaran",
            desc: "Dashboard menampilkan breakdown pengeluaran per kategori. Lihat mana yang paling besar, evaluasi, dan optimalkan.",
          },
          {
            icon: FileText,
            title: "Simulasi Keuangan",
            desc: "Input proyeksi pendapatan & biaya bulanan. Sistem hitung profit margin, break-even point, dan cash flow projection.",
          },
          {
            icon: Clock,
            title: "Summary Real-Time",
            desc: "Dashboard otomatis tampilkan total income, expense, profit, dan margin. Update setiap kali ada transaksi baru.",
          },
        ],
        howItWorks: [
          "Buat kategori keuangan: Fixed cost, Variable cost, Revenue streams",
          "Input transaksi harian/bulanan dengan detail lengkap",
          "Untuk planning: buat simulasi keuangan dengan proyeksi 3-5 tahun",
          "Dashboard menampilkan summary, chart, dan insights dari data Anda",
        ],
        simulation: {
          title: "Manfaat Pencatatan Sistematis",
          items: [
            "Tidak ada transaksi terlewat: Akurasi laporan 100%",
            "Analisis pengeluaran: Identifikasi 3-5 area untuk efisiensi",
            "Laporan siap cetak: Hemat biaya akuntan Rp 2-5 juta/bulan",
            "Data terstruktur: Lebih mudah apply pinjaman bank atau investor",
          ],
          result: "Total benefit: Hemat Rp 30-60 juta/tahun + decision making lebih baik!",
        },
        cta: "Mulai Kelola Keuangan",
      },
    },
    {
      id: 3,
      icon: TrendingUp,
      title: "Forecast & Prediksi AI",
      shortDesc: "Prediksi pertumbuhan rencana bisnis Anda hingga 5 tahun ke depan dengan algoritma AI yang akurat untuk mendukung pengambilan keputusan strategis.",
      gradient: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      detail: {
        headline: "Forecast & Prediksi AI: Prediksi 5 Tahun ke Depan dengan Algoritma ARIMA!",
        subheadline: "Satu-satunya fitur dengan teknologi AI! Input data historis Anda, ARIMA algorithm memprediksi income, expense, dan profit 5 tahun kedepan dengan akurasi tinggi.",
        benefits: [
          {
            icon: TrendingUp,
            title: "Prediksi 5 Tahun dengan AI",
            desc: "Input data pendapatan & pengeluaran historis (min 3 bulan). AI ARIMA algorithm prediksi 60 bulan (5 tahun) kedepan dengan confidence level tinggi.",
          },
          {
            icon: Calendar,
            title: "Tren Bulanan & Tahunan",
            desc: "Lihat prediksi per bulan dan summary per tahun. Visualisasi chart interaktif untuk analisis tren jangka panjang.",
          },
          {
            icon: Zap,
            title: "Auto-Generate dari Simulasi",
            desc: "Sudah punya simulasi keuangan? Langsung forecast tanpa input ulang. Sistem otomatis ambil data untuk prediksi AI.",
          },
          {
            icon: Award,
            title: "Insights Otomatis",
            desc: "AI generate insights: kapan profit tertinggi, kapan perlu hati-hati cash flow, rekomendasi strategi per periode.",
          },
        ],
        howItWorks: [
          "Input data historis: pendapatan, pengeluaran, profit bulanan (min 3 bulan)",
          "Pilih forecast method: ARIMA (recommended), Manual, atau Exponential Smoothing",
          "AI ARIMA analyze pattern dan generate prediksi 60 bulan kedepan",
          "Dashboard tampilkan chart prediksi, yearly summary, dan confidence interval",
        ],
        simulation: {
          title: "Keuntungan Prediksi Jangka Panjang",
          items: [
            "Planning 5 tahun: Investor lebih percaya dengan data prediksi",
            "Identifikasi tren: Anticipate profit drop atau opportunity surge",
            "Scenario planning: Simulasi impact dari keputusan bisnis besar",
            "Ekspansi terencana: Tahu kapan timing tepat untuk scale up",
          ],
          result: "Total value: Rp 100-200 juta dari keputusan yang lebih tepat dengan data prediksi!",
        },
        cta: "Coba Prediksi AI Sekarang",
      },
    },
    {
      id: 4,
      icon: LineChart,
      title: "Laporan Otomatis",
      shortDesc: "Hasilkan dokumen Business Plan (PDF) profesional yang mencakup visualisasi data keuangan lengkap, siap dipresentasikan kepada investor atau perbankan.",
      gradient: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      detail: {
        headline: "Export PDF Profesional: Semua Data Jadi Satu Dokumen Lengkap!",
        subheadline: "Sudah input banyak data? Export semuanya jadi PDF profesional 30-50 halaman. Business plan + laporan keuangan + forecast, semua dalam satu dokumen!",
        benefits: [
          {
            icon: FileText,
            title: "Business Plan Lengkap",
            desc: "Semua yang sudah Anda input (analisis bisnis, market, produk, strategi marketing, operational plan, team structure) otomatis compile jadi business plan.",
          },
          {
            icon: BarChart3,
            title: "Laporan Keuangan Komprehensif",
            desc: "Transaksi keuangan, simulasi, proyeksi, summary - semua di-compile dengan chart dan tabel yang mudah dibaca.",
          },
          {
            icon: Sparkles,
            title: "Forecast 5 Tahun",
            desc: "Hasil prediksi AI ARIMA untuk 5 tahun kedepan, complete dengan yearly summary dan chart tren, langsung masuk PDF.",
          },
          {
            icon: Shield,
            title: "Template Profesional",
            desc: "Design berkualitas konsultan dengan cover page, table of contents, charts, dan visualisasi data professional. Siap untuk investor!",
          },
        ],
        howItWorks: [
          "Lengkapi semua section: Business Plan (7 sections) + Financial Management + Forecast",
          "Klik 'Generate PDF' - pilih mode Free atau Pro",
          "Sistem compile semua data Anda jadi dokumen 30-50 halaman dengan struktur profesional",
          "Download PDF - langsung siap untuk presentasi, submission ke bank, atau pitch ke investor",
        ],
        simulation: {
          title: "Value Dokumen Profesional",
          items: [
            "Jasa konsultan business plan: Rp 15-30 juta → Input sendiri, export gratis",
            "Hemat waktu 40+ jam compile manual data ke Word/Excel",
            "Designer profesional: Rp 3-5 juta → Template sudah bagus",
            "Revisi unlimited: Update data, re-generate PDF tanpa biaya tambahan",
          ],
          result: "Total saving: Rp 20-40 juta + 40 jam waktu Anda per dokumen!",
        },
        cta: "Generate PDF Sekarang",
      },
    },
    {
      id: 5,
      icon: Target,
      title: "Perencanaan Strategis",
      shortDesc: "Kelola visi dan misi bisnis Anda melalui modul strategi terstruktur. Tetapkan target jangka panjang dan pantau progres penyusunan rencana Anda.",
      gradient: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      textColor: "text-cyan-600 dark:text-cyan-400",
      detail: {
        headline: "Perencanaan Strategis: Input Goal, Plan, dan Track Progress!",
        subheadline: "Tools lengkap untuk planning operasional dan team structure. Input rencana kerja, workflow, struktur organisasi - semua tervisualisasi otomatis.",
        benefits: [
          {
            icon: Target,
            title: "Operational Plan Builder",
            desc: "Input operational plan: aktivitas, timeline, resources, budget. Sistem generate workflow diagram otomatis untuk visualisasi.",
          },
          {
            icon: Calendar,
            title: "Workflow Visualization",
            desc: "Dari data operational plan yang Anda input, sistem auto-generate workflow diagram dengan Mermaid. Visual flowchart profesional!",
          },
          {
            icon: Users,
            title: "Team Structure Builder",
            desc: "Input struktur organisasi: role, nama, tanggung jawab. Sistem generate org chart otomatis dengan hierarki yang jelas.",
          },
          {
            icon: TrendingUp,
            title: "Integration dengan Financial",
            desc: "Operational budget dan team cost otomatis integrate ke financial simulation. Lihat impact plan ke bottom line.",
          },
        ],
        howItWorks: [
          "Input Operational Plans: aktivitas apa, siapa PIC, berapa budget, timeline",
          "Sistem generate workflow diagram dari data Anda (Mermaid flowchart)",
          "Input Team Structure: department, role, nama, salary (opsional)",
          "Sistem generate org chart dan integrate cost ke financial projection",
        ],
        simulation: {
          title: "Manfaat Planning Terstruktur",
          items: [
            "Workflow diagram: Lebih mudah onboard team baru (hemat 5 jam training)",
            "Org chart: Investor lebih percaya dengan struktur yang jelas",
            "Budget planning: Tahu pasti berapa cost operational & team per bulan",
            "Semua masuk PDF: Operational plan + workflow + org chart siap presentasi",
          ],
          result: "Total benefit: Planning 3x lebih cepat + eksekusi lebih smooth!",
        },
        cta: "Mulai Planning Sekarang",
      },
    },
    {
      id: 6,
      icon: Gift,
      title: "Program Afiliasi",
      shortDesc: "Dapatkan penghasilan pasif dengan mengajak rekan bisnis bergabung. Pantau komisi Anda secara real-time melalui dashboard afiliasi yang transparan.",
      gradient: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      detail: {
        headline: "Program Afiliasi Grapadi Strategix: Ubah Koneksi Anda Menjadi Penghasilan Pasif!",
        subheadline:
          "Apakah Anda memiliki jaringan pengusaha, UMKM, atau mahasiswa yang sedang merintis bisnis? Bergabunglah dengan Program Afiliasi Grapadi Strategix dan dapatkan komisi sebesar 17% untuk setiap penjualan yang berasal dari referensi Anda!",
        benefits: [
          {
            icon: DollarSign,
            title: "Komisi Tinggi 17%",
            desc: "Kami memberikan apresiasi yang sangat kompetitif. Setiap kali seseorang berlangganan Grapadi Strategix melalui link Anda, 17% dari nilai transaksi langsung masuk ke kantong Anda.",
          },
          {
            icon: Sparkles,
            title: "Produk Inovatif & Mudah Dijual",
            desc: "Menjual Software Business Plan AI jauh lebih mudah dibandingkan cara manual. Solusi kami adalah apa yang dibutuhkan setiap pebisnis saat ini: Cepat, Akurat, dan Profesional.",
          },
          {
            icon: Zap,
            title: "Tanpa Modal & Tanpa Risiko",
            desc: "Anda tidak perlu mengeluarkan uang sepeser pun. Cukup daftar, sebarkan link unik Anda, dan biarkan sistem kami bekerja untuk Anda.",
          },
          {
            icon: Users,
            title: "Dukungan Penuh",
            desc: "Kami menyediakan materi promosi (banner, copywriting, dan video) yang siap Anda gunakan untuk meyakinkan calon pembeli.",
          },
        ],
        howItWorks: [
          "Daftar: Bergabung dalam hitungan detik melalui dashboard afiliasi kami",
          "Sebarkan: Bagikan link afiliasi Anda di media sosial, grup WhatsApp, blog, atau website",
          "Hasilkan: Setiap ada transaksi sukses dari link tersebut, komisi 17% akan otomatis tercatat di akun Anda",
          "Cairkan: Tarik komisi Anda secara berkala dengan proses yang transparan dan cepat",
        ],
        simulation: {
          title: "Simulasi Penghasilan Anda",
          items: [
            "Jika harga paket layanan Grapadi Strategix adalah Rp 1.000.000,-",
            "Setiap satu orang yang membeli lewat link Anda = Rp 170.000,-",
            "10 orang dalam sebulan = Rp 1.700.000,- per bulan",
            "Bayangkan jika 50 orang dalam setahun = Rp 8.500.000,- per tahun!",
          ],
          result: "Hanya dengan berbagi link! Tanpa modal, tanpa risiko, tanpa effort berlebihan!",
        },
        cta: "Daftar Program Afiliasi",
      },
    },
  ];

  const openModal = (feature) => {
    setSelectedFeature(feature);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedFeature(null);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <style>{`
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

        .custom-green { color: var(--primary-green) !important; }
        .custom-green-bg-solid { background-color: var(--primary-green) !important; }

        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-backdrop {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-drawer {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }

        .modal-content {
          animation: contentFadeIn 0.5s ease-out 0.2s both;
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .modal-drawer {
            width: 100% !important;
          }
        }
      `}</style>

      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="relative px-4 pt-12 md:pt-24 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, #167814 0%, transparent 70%)" }}></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, #10B517 0%, transparent 70%)" }}></div>
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-xs md:text-sm font-bold bg-white border-2 rounded-full custom-green-border custom-green dark:bg-gray-800">
              <Sparkles className="w-4 h-4 mr-2" />
              FITUR LENGKAP PLATFORM
            </div>

            <h1 className="mb-6 text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-gray-900 dark:text-white">
              Semua Yang Anda Butuhkan
              <span className="block mt-2" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                Untuk Kesuksesan Bisnis
              </span>
            </h1>

            <p className="max-w-3xl mx-auto mb-8 text-xs md:text-lg text-gray-600 dark:text-gray-400">
              Platform all-in-one dengan 6 fitur powerful yang dirancang untuk mempercepat pertumbuhan bisnis Anda.
              <span className="block mt-2 font-semibold text-gray-900 dark:text-white">Klik setiap card untuk detail lengkap dan simulasi benefit!</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-2 md:gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => openModal(feature)}
                  className={`feature-card relative p-6 md:p-8 text-left bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group`}
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`${feature.bgColor} w-14 md:w-16 h-14 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`${feature.textColor}`} size={28} strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 text-lg md:text-xl font-black text-gray-900 transition-colors dark:text-white group-hover:custom-green">{feature.title}</h3>

                    {/* Short Description */}
                    <p className="mb-4 text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.shortDesc}</p>

                    {/* CTA */}
                    <div className="flex items-center text-xs md:text-sm font-bold transition-all custom-green group-hover:gap-2">
                      Lihat Detail
                      <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal Drawer */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-end modal-backdrop" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          {/* Backdrop - Click to close */}
          <div className="absolute inset-0" onClick={closeModal}></div>

          {/* Drawer */}
          <div className="modal-drawer relative w-full md:w-[600px] lg:w-[700px] h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            {/* Close Button */}
            <button onClick={closeModal} className="sticky z-10 flex items-center justify-center float-right w-10 h-10 transition-colors bg-gray-100 rounded-full top-4 right-4 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={20} />
            </button>

            {/* Content */}
            <div className="clear-both p-4 md:p-6 modal-content">
              {/* Icon */}
              <div className={`${selectedFeature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                {(() => {
                  const Icon = selectedFeature.icon;
                  return <Icon className={selectedFeature.textColor} size={32} strokeWidth={2.5} />;
                })()}
              </div>

              {/* Headline */}
              <h2 className="mb-2 text-xl font-black leading-tight text-gray-900 md:text-2xl dark:text-white">{selectedFeature.detail.headline}</h2>

              {/* Subheadline */}
              <p className="mb-6 text-sm leading-relaxed text-gray-600 md:text-base dark:text-gray-400">{selectedFeature.detail.subheadline}</p>

              {/* Benefits Section */}
              <div className="mb-6 md:mb-8">
                <h3 className="flex items-center mb-4 text-lg font-black text-gray-900 dark:text-white">
                  <Sparkles className="mr-2 custom-green" size={20} />
                  Kenapa Harus Menggunakan?
                </h3>
                <div className="space-y-4">
                  {selectedFeature.detail.benefits.map((benefit, index) => {
                    const BenefitIcon = benefit.icon;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className={`${selectedFeature.bgColor} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <BenefitIcon className={selectedFeature.textColor} size={20} />
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">{benefit.title}</h4>
                          <p className="text-xs leading-relaxed text-gray-600 md:text-sm dark:text-gray-400">{benefit.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How It Works */}
              <div className="mb-6 md:mb-8">
                <h3 className="flex items-center mb-4 text-lg font-black text-gray-900 dark:text-white">
                  <Zap className="mr-2 custom-green" size={20} />
                  Bagaimana Cara Kerjanya?
                </h3>
                <div className="space-y-3">
                  {selectedFeature.detail.howItWorks.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold text-white rounded-full" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                        {index + 1}
                      </div>
                      <p className="pt-0.5 text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation/ROI */}
              <div
                className="p-4 mb-6 rounded-2xl"
                style={{
                  background: isDarkMode ? "linear-gradient(135deg, rgba(16, 181, 23, 0.1) 0%, rgba(16, 181, 23, 0.05) 100%)" : "linear-gradient(135deg, rgba(22, 120, 20, 0.1) 0%, rgba(22, 120, 20, 0.05) 100%)",
                }}
              >
                <h3 className="flex items-center mb-3 text-lg font-black text-gray-900 dark:text-white">
                  <TrendingUp className="mr-2 custom-green" size={20} />
                  {selectedFeature.detail.simulation.title}
                </h3>
                <ul className="mb-3 space-y-2">
                  {selectedFeature.detail.simulation.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="custom-green flex-shrink-0 mt-0.5" size={16} strokeWidth={2.5} />
                      <span className="text-xs text-gray-700 md:text-sm dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3 text-center rounded-xl" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                  <p className="text-sm font-black text-white md:text-base">{selectedFeature.detail.simulation.result}</p>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to="/register"
                className="block w-full py-2.5 text-sm font-black text-center text-white transition-all duration-300 shadow-xl md:text-base rounded-xl hover:scale-105"
                style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}
                onClick={closeModal}
              >
                {selectedFeature.detail.cta}
                <ArrowRight className="inline ml-2" size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <WhatsAppWidget />
      <Footer />
    </div>
  );
}

export default FeaturesPage;
