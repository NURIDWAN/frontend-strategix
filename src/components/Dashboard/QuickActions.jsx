import React from 'react'
import { Plus, FileText, BarChart3, TrendingUp } from 'lucide-react'

const QuickActions = ({ setActiveSection, setActiveSubSection }) => {
    const quickLinks = [
        {
            icon: Plus,
            label: 'Buat Business Plan',
            description: 'Mulai rencana bisnis baru',
            color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100',
            section: 'business-plan',
            subSection: 'business-background'
        },
        {
            icon: FileText,
            label: 'Simulasi Keuangan',
            description: 'Tambah simulasi keuangan baru',
            color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100',
            section: 'management-financial',
            subSection: 'financial-simulation'
        },
        {
            icon: TrendingUp,
            label: 'Generate Forecast',
            description: 'Buat forecast baru',
            color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100',
            section: 'forecast',
            subSection: 'daftar-forecast'
        },
        {
            icon: BarChart3,
            label: 'Lihat Laporan',
            description: 'Analisis data terbaru',
            color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100',
            section: 'export-pdf-lengkap',
            subSection: ''
        }
    ]


    const handleAction = (section, subSection, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log(`[QuickActions] Navigating to Section: ${section}, SubSection: ${subSection}`);

        if (setActiveSection) {
            setActiveSection(section);
        }
        if (setActiveSubSection) {
            setActiveSubSection(subSection || "");
        }
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h2>
                <div className="space-y-2">
                    {quickLinks.map((link, index) => {
                        const Icon = link.icon
                        return (
                            <button
                                type="button"
                                key={index}
                                onClick={(e) => handleAction(link.section, link.subSection, e)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${link.color}`}
                            >
                                <Icon size={20} />
                                <div className="text-left flex-1">
                                    <p className="font-medium text-sm">{link.label}</p>
                                    <p className="text-xs opacity-75">{link.description}</p>
                                </div>
                                <span className="text-lg">→</span>
                            </button>
                        )
                    })}
                </div>
            </div>


            {/* Status Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Ringkas</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Business Plan Aktif</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Siap</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Simulasi Terbaru</span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Dec 2025</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Forecast Tersimpan</span>
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">5 Items</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuickActions
