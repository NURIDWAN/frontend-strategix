import { useState, useEffect } from "react";
import {
  FileText,
  Workflow,
  Target,
  Users,
  DollarSign,
  BarChart3,
  Building,
  Package,
  Files,
  Download,
  FileDown,
} from "lucide-react";
import Background from "../components/BusinessPlan/BusinessBackground/Background";
import MarketAnalysis from "../components/BusinessPlan/MarketAnalysis/MarketAnalysis";
import ProductService from "../components/BusinessPlan/ProductService/ProductService";
import MarketingStrategies from "../components/BusinessPlan/MarketingStrategies/MarketingStrategies";
import OperationalPlan from '../components/BusinessPlan/OperationalPlan/OperationalPlan';
import TeamStructure from '../components/BusinessPlan/TeamStructure/TeamStructure';
// TODO: Comment - FinancialPlan nonaktif di Business Plan
// import FinancialPlan from '../components/BusinessPlan/FinancialPlan/FinancialPlan';
import PdfBusinessPlan from '../components/BusinessPlan/PdfBusinessPlan/PdfBusinessPlan';

const BusinessPlan = ({ activeSubSection, setActiveSubSection }) => {
  const [view, setView] = useState("main");

  // Sync view dengan activeSubSection dari parent
  useEffect(() => {
    if (activeSubSection) {
      setView(activeSubSection);
    } else {
      setView("main");
    }
  }, [activeSubSection]);

  const handleSubSectionClick = (subSectionId) => {
    setActiveSubSection(subSectionId);
    setView(subSectionId);
  };

  const handleBackToMain = () => {
    setActiveSubSection("");
    setView("main");
  };

  const renderMainView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Rencana Bisnis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola semua aspek rencana bisnis Anda di satu tempat
        </p>
      </div>

      {/* Quick Actions Section
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📊 PDF Business Plan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Generate laporan bisnis profesional dalam format PDF dengan semua data terintegrasi
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubSectionClick("pdf-business-plan")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <FileDown size={18} />
              Generate PDF
            </button>
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latar Belakang Bisnis Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-green-300 dark:hover:border-green-600"
          onClick={() => handleSubSectionClick("business-background")}
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Building
              className="text-green-600 dark:text-green-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Latar Belakang Bisnis
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Kelola informasi dasar bisnis, visi, misi, dan nilai-nilai perusahaan
          </p>
          <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
            <span>Kelola Bisnis</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Analisis Pasar Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-purple-300 dark:hover:border-purple-600"
          onClick={() => handleSubSectionClick("market-analysis")}
        >
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <BarChart3
              className="text-purple-600 dark:text-purple-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analisis Pasar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Analisis target pasar, kompetitor, dan keunggulan kompetitif
          </p>
          <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
            <span>Kelola Analisis</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Produk & Layanan Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-orange-300 dark:hover:border-orange-600"
          onClick={() => handleSubSectionClick("product-service")}
        >
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Package
              className="text-orange-600 dark:text-orange-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Produk & Layanan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Kelola produk, layanan, harga, dan strategi pengembangan
          </p>
          <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium">
            <span>Kelola Produk/Layanan</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Strategi Pemasaran Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-pink-300 dark:hover:border-pink-600"
          onClick={() => handleSubSectionClick("marketing-strategies")}
        >
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Target
              className="text-pink-600 dark:text-pink-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Strategi Pemasaran
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Strategi promosi, media, harga, dan rencana kolaborasi
          </p>
          <div className="flex items-center text-pink-600 dark:text-pink-400 text-sm font-medium">
            <span>Kelola Strategi</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Rencana Operasional Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-teal-300 dark:hover:border-teal-600"
          onClick={() => handleSubSectionClick("operational-plan")}
        >
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Workflow className="text-teal-600 dark:text-teal-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Rencana Operasional
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Proses bisnis, alur kerja, dan manajemen operasional
          </p>
          <div className="flex items-center text-teal-600 dark:text-teal-400 text-sm font-medium">
            <span>Kelola Operasional</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Struktur Organisasi & Tim Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-600"
          onClick={() => handleSubSectionClick('team-structure')}
        >
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Struktur Organisasi & Tim
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Kelola struktur tim, jabatan, dan latar belakang anggota
          </p>
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            <span>Kelola Tim</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* TODO: Comment - FinancialPlan nonaktif di Business Plan */}
        {/* 
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-emerald-300 dark:hover:border-emerald-600"
          onClick={() => handleSubSectionClick('financial-plan')}
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Rencana Keuangan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Kelola sumber modal, estimasi biaya, pendapatan, dan analisis laba/rugi
          </p>
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <span>Kelola Keuangan</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
        */}

        {/* PDF Business Plan Card */}
        {/* <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300 dark:hover:border-blue-600"
          onClick={() => handleSubSectionClick("pdf-business-plan")}
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileDown className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            PDF Business Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Generate laporan bisnis profesional dengan semua data terintegrasi dalam format PDF
          </p>
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
            <span>Generate PDF</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div> */}
      </div>
    </div>
  );

  const renderSubSection = () => {
    switch (view) {
      case 'business-background':
        return <Background onBack={handleBackToMain} />;
      case 'market-analysis':
        return <MarketAnalysis onBack={handleBackToMain} />;
      case 'product-service':
        return <ProductService onBack={handleBackToMain} />;
      case 'operational-plan':
        return <OperationalPlan onBack={handleBackToMain} />;
      case 'marketing-strategies':
        return <MarketingStrategies onBack={handleBackToMain} />;
      case 'team-structure':
        return <TeamStructure onBack={handleBackToMain} />;
      // TODO: Comment - FinancialPlan nonaktif di Business Plan
      // case 'financial-plan':
      //   return <FinancialPlan onBack={handleBackToMain} />;
      case 'pdf-business-plan':
        return <PdfBusinessPlan onBack={handleBackToMain} />;
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderSubSection()}
      </div>
    </div>
  );
};

export default BusinessPlan;