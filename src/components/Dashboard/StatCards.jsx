import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

const StatCards = () => {
    const stats = [
        {
            title: 'Total Pendapatan',
            value: 'Rp 125.4Jt',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Total Pengeluaran',
            value: 'Rp 89.2Jt',
            change: '+8.3%',
            trend: 'up',
            icon: PieChart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Laba Bersih',
            value: 'Rp 36.2Jt',
            change: '+23.1%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Rencana Aktif',
            value: '3',
            change: '+1 baru',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                const isPositive = stat.trend === 'up'

                return (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {isPositive ? <TrendingUp size={14} className="lg:w-4" /> : <TrendingDown size={14} className="lg:w-4" />}
                                    <span className="text-xs lg:text-sm font-medium">{stat.change}</span>
                                </div>
                            </div>
                            <div className={`p-2 lg:p-3 rounded-lg ${stat.bgColor}`}>
                                <Icon size={20} className={`lg:w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default StatCards