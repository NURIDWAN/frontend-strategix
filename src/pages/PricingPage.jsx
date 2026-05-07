import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, X, Zap, Shield, Sparkles, TrendingUp } from "lucide-react";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import WhatsAppWidget from "../components/Layout/WhatsAppWidget";
import singapayApi from "../services/singapayApi";

const freePlan = {
  id: "free",
  name: "Free",
  price: "0",
  period: "Gratis Selamanya",
  description: "Sempurna untuk memulai dan eksplorasi platform",
  features: [
    { text: "Semua Fitur Lengkap", available: true },
    { text: "Analisis Bisnis Mendalam", available: true },
    { text: "Manajemen Keuangan", available: true },
    { text: "Forecast AI (5 Tahun)", available: true },
    { text: "Perencanaan Strategis", available: true },
    { text: "Export PDF", available: true },
    { text: "PDF Tanpa Watermark", available: false },
    { text: "Priority Support", available: false },
  ],
  cta: "Mulai Gratis",
  ctaLink: "/register",
  popular: false,
  gradient: "from-gray-500 to-gray-600",
  icon: Shield,
};

const defaultProPlans = [
  {
    id: 2,
    name: "Pro Monthly",
    price: "200.000",
    period: "per bulan",
    description: "Untuk profesional yang butuh laporan tanpa watermark",
    features: [
      { text: "Semua Fitur Lengkap", available: true },
      { text: "Analisis Bisnis Mendalam", available: true },
      { text: "Manajemen Keuangan", available: true },
      { text: "Forecast AI (5 Tahun)", available: true },
      { text: "Perencanaan Strategis", available: true },
      { text: "Export PDF", available: true },
      { text: "PDF Tanpa Watermark", available: true, highlight: true },
      { text: "Priority Support", available: true },
    ],
    cta: "Beli Sekarang",
    ctaLink: "/checkout/2",
    popular: true,
    gradient: "from-blue-500 to-indigo-600",
    icon: Zap,
  },
  {
    id: 3,
    name: "Pro Yearly",
    price: "1.680.000",
    originalPrice: "2.400.000",
    period: "per tahun",
    savings: "Hemat Rp 720.000",
    savingsPercent: "30%",
    description: "Best value! Hemat hingga 25% untuk komitmen tahunan",
    features: [
      { text: "Semua Fitur Lengkap", available: true },
      { text: "Analisis Bisnis Mendalam", available: true },
      { text: "Manajemen Keuangan", available: true },
      { text: "Forecast AI (5 Tahun)", available: true },
      { text: "Perencanaan Strategis", available: true },
      { text: "Export PDF", available: true },
      { text: "PDF Tanpa Watermark", available: true, highlight: true },
      { text: "Priority Support", available: true },
    ],
    cta: "Beli Sekarang",
    ctaLink: "/checkout/3",
    popular: false,
    gradient: "from-green-500 to-emerald-600",
    icon: TrendingUp,
    bestValue: true,
  },
];

const formatPriceDisplay = (price) => {
  return new Intl.NumberFormat("id-ID").format(price || 0);
};

const mapApiPackageToDisplayPlan = (pkg, index, allPackages) => {
  const isYearly = pkg.duration_days >= 365;
  const isMonthly = pkg.duration_days >= 28 && pkg.duration_days < 365;

  // Compute savings for yearly vs monthly
  let savings = null;
  let savingsPercent = null;
  let originalPrice = null;
  if (isYearly) {
    const monthlyPkg = allPackages.find(
      (p) => p.duration_days >= 28 && p.duration_days < 365
    );
    if (monthlyPkg) {
      const monthlyAnnual = monthlyPkg.price * 12;
      if (monthlyAnnual > pkg.price) {
        savings = `Hemat Rp ${formatPriceDisplay(monthlyAnnual - pkg.price)}`;
        savingsPercent = `${Math.round(((monthlyAnnual - pkg.price) / monthlyAnnual) * 100)}%`;
        originalPrice = formatPriceDisplay(monthlyAnnual);
      }
    }
  }

  // Build features: use package features if available, otherwise default Pro features
  const displayFeatures = [
    ...((pkg.features && pkg.features.length > 0)
      ? pkg.features.map((f) => ({ text: f, available: true }))
      : [
          { text: "Semua Fitur Lengkap", available: true },
          { text: "Analisis Bisnis Mendalam", available: true },
          { text: "Manajemen Keuangan", available: true },
          { text: "Forecast AI (5 Tahun)", available: true },
          { text: "Perencanaan Strategis", available: true },
          { text: "Export PDF", available: true },
        ]),
    { text: "PDF Tanpa Watermark", available: true, highlight: true },
    ...(pkg.consultation_credits > 0 
      ? [{ text: `${pkg.consultation_credits} Sesi Konsultasi Pakar`, available: true, highlight: true }] 
      : []),
    { text: "Priority Support", available: true },
  ];

  return {
    id: pkg.id,
    name: pkg.name,
    price: formatPriceDisplay(pkg.price),
    period: isYearly ? "per tahun" : isMonthly ? "per bulan" : `per ${pkg.duration_days} hari`,
    description: pkg.description || (isMonthly ? "Untuk profesional yang butuh laporan tanpa watermark" : "Best value untuk komitmen jangka panjang"),
    features: displayFeatures,
    cta: "Beli Sekarang",
    ctaLink: `/checkout/${pkg.id}`,
    popular: isMonthly && index === 0,
    gradient: isYearly ? "from-green-500 to-emerald-600" : "from-blue-500 to-indigo-600",
    icon: isYearly ? TrendingUp : Zap,
    bestValue: isYearly,
    ...(originalPrice && { originalPrice }),
    ...(savings && { savings }),
    ...(savingsPercent && { savingsPercent }),
  };
};

function PricingPage({ isDarkMode, toggleDarkMode }) {
  const [proPlans, setProPlans] = useState(defaultProPlans);

  useEffect(() => {
    // Load packages from API for all visitors (dynamic pricing)
    const fetchPackageData = async () => {
      try {
        const response = await singapayApi.getPackages();
        const resData = response.data;
        
        console.log("Pricing API Response:", resData);

        // Standardize data access: check for 'data' key (new) or 'packages' key (old/service)
        const apiPackages = resData.data || resData.packages;

        if (resData.success && Array.isArray(apiPackages) && apiPackages.length > 0) {
          const subscriptionPackages = apiPackages.filter(pkg => pkg.package_type !== 'consultation');
          const mapped = subscriptionPackages.map((pkg, i) =>
            mapApiPackageToDisplayPlan(pkg, i, subscriptionPackages)
          );
          setProPlans(mapped);
          console.log("Successfully mapped dynamic packages:", mapped);
        } else {
          console.warn("API returned success but no packages were found or active.");
        }
      } catch (err) {
        console.error("Critical error fetching dynamic packages:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        // Silently fall back to hardcoded default plans
      }
    };

    fetchPackageData();
  }, []);

  const plans = [freePlan, ...proPlans];

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
        .custom-green-bg { background-color: var(--primary-green) !important; }

        .pricing-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .popular-badge {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, #167814 0%, transparent 70%)" }}></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, #10B517 0%, transparent 70%)" }}></div>
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-bold bg-white border-2 rounded-full custom-green-border custom-green dark:bg-gray-800">
              <Sparkles className="w-4 h-4 mr-2" />
              HARGA TRANSPARAN
            </div>

            <h1 className="mb-6 text-3xl font-black leading-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
              Pilih Paket Yang Sesuai
              <span className="block mt-2" style={{ color: isDarkMode ? "#10B517" : "#167814" }}>
                Dengan Kebutuhan Anda
              </span>
            </h1>

            <p className="max-w-3xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-400">
              Semua paket mendapat akses penuh ke semua fitur platform. Perbedaan hanya pada watermark PDF.
              <span className="block mt-2 font-semibold text-gray-900 dark:text-white">Mulai gratis, upgrade kapan saja!</span>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div key={plan.id} className={`pricing-card relative bg-white dark:bg-gray-900 rounded-2xl border-2 overflow-hidden ${plan.popular ? "border-blue-500 dark:border-blue-400" : "border-gray-200 dark:border-gray-700"}`}>
                  {/* Popular Badge */}
                  {plan.popular && <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white bg-blue-500 rounded-bl-xl popular-badge">PALING POPULER</div>}

                  {/* Best Value Badge */}
                  {plan.bestValue && (
                    <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white rounded-bl-xl popular-badge" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                      BEST VALUE
                    </div>
                  )}

                  <div className="p-7">
                    {/* Icon */}
                    <div className={`w-15 h-15 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-5`}>
                      <Icon className="text-white" size={30} strokeWidth={2.5} />
                    </div>

                    {/* Plan Name */}
                    <h3 className="mb-2 text-lg font-black text-gray-900 dark:text-white">{plan.name}</h3>

                    {/* Description */}
                    <p className="h-9 mb-5 text-xs text-gray-600 dark:text-gray-400">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-5">
                      {plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg text-gray-400 line-through">Rp {plan.originalPrice}</span>
                          <span className="px-2 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: isDarkMode ? "#10B517" : "#167814" }}>
                            {plan.savingsPercent} OFF
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">Rp {plan.price}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">/ {plan.period}</span>
                      </div>
                      {plan.savings && <p className="mt-2 text-sm font-bold custom-green">{plan.savings}</p>}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={plan.ctaLink}
                      className={`block w-full py-2.5 text-xs text-center font-bold rounded-xl transition-all duration-300 hover:scale-105 mb-6 ${
                        plan.popular || plan.bestValue ? "text-white shadow-lg" : "text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                      style={plan.popular || plan.bestValue ? { backgroundColor: isDarkMode ? "#10B517" : "#167814" } : {}}
                    >
                      {plan.cta}
                    </Link>

                    {/* Features List */}
                    <div className="space-y-3.5">
                      <p className="mb-3 text-xs font-bold text-gray-900 dark:text-white">Yang Anda Dapatkan:</p>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2.5">
                          {feature.available ? (
                            <Check className={`flex-shrink-0 mt-0.5 ${feature.highlight ? "custom-green" : "text-green-500"}`} size={17} strokeWidth={2.5} />
                          ) : (
                            <X className="flex-shrink-0 mt-0.5 text-gray-300 dark:text-gray-600" size={17} strokeWidth={2.5} />
                          )}
                          <span className={`text-xs ${feature.available ? (feature.highlight ? "font-bold custom-green" : "text-gray-700 dark:text-gray-300") : "text-gray-400 dark:text-gray-500"}`}>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-8 md:py-12 bg-white dark:bg-gray-900">
        <div className="container max-w-4xl mx-auto">
          <h2 className="mb-8 text-2xl font-black text-center text-gray-900 dark:text-white">Pertanyaan Umum</h2>

          <div className="space-y-6">
            <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Apa perbedaan antara paket Free dan Pro?</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Semua paket mendapat akses penuh ke semua fitur (Analisis Bisnis, Manajemen Keuangan, Forecast AI 5 Tahun, Export PDF, dll). Perbedaan utama hanya pada <strong className="custom-green">PDF yang di-export</strong>. Paket Free
                memiliki watermark, sementara paket Pro menghasilkan PDF profesional tanpa watermark.
              </p>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Apakah saya harus berlangganan tahunan?</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Tidak. Anda bisa memilih paket bulanan (Rp 200.000/bulan) yang lebih fleksibel. Namun paket tahunan (Rp 1.680.000/tahun) memberikan <strong className="custom-green">penghematan hingga Rp 560.000</strong> (25% lebih murah)
                dan cocok untuk komitmen jangka panjang.
              </p>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Bagaimana cara upgrade dari Free ke Pro?</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sangat mudah! Cukup klik tombol "Pro" di dashboard pada fitur Export PDF Lengkap kapan saja. Semua data yang sudah Anda input akan tetap tersimpan dan langsung bisa di-export tanpa watermark setelah upgrade.
              </p>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Apakah ada biaya tersembunyi?</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tidak ada! Harga yang tertera adalah harga final. Tidak ada biaya setup, tidak ada biaya tambahan per project atau per export. Bayar sekali, pakai semua fitur sepuasnya.</p>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppWidget />
      <Footer />
    </div>
  );
}

export default PricingPage;
