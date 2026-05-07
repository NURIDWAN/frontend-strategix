import React from 'react'
import { Calendar, Users, Target } from 'lucide-react'

const RecentPlans = () => {
    const plans = [
        {
            id: 1,
            name: 'Rencana Ekspansi 2024',
            type: 'Ekspansi Bisnis',
            progress: 75,
            deadline: '15 Des 2024',
            team: 5,
            status: 'active'
        },
        {
            id: 2,
            name: 'Optimasi Operasional',
            type: 'Efisiensi',
            progress: 45,
            deadline: '30 Nov 2024',
            team: 3,
            status: 'active'
        },
        {
            id: 3,
            name: 'Launch Produk Baru',
            type: 'Inovasi',
            progress: 90,
            deadline: '10 Des 2024',
            team: 8,
            status: 'completed'
        }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Rencana Bisnis Aktif</h2>
                <button className="text-sm text-green-600 font-medium hover:text-green-700">
                    Lihat Semua →
                </button>
            </div>

            <div className="space-y-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-medium text-gray-900">{plan.name}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                                    {plan.status === 'active' ? 'Aktif' : 'Selesai'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{plan.type}</p>

                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Calendar size={16} />
                                    <span>{plan.deadline}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users size={16} />
                                    <span>{plan.team} anggota</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Target size={16} />
                                    <span>{plan.progress}% selesai</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-24">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${plan.progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-1">{plan.progress}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentPlans