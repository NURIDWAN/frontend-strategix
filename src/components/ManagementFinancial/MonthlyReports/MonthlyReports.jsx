import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getMonthlyReport } from '../../../services/managementFinancial/monthlyReportApi';
import { ArrowLeft, Printer, Calendar as CalendarIcon, TrendingUp, BarChart3, Wallet, Landmark, Info, Filter } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function number(n) {
  return (n ?? 0).toLocaleString('id-ID');
}

function currency(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n ?? 0);
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const helpers = {
  is: 'Laporan Laba Rugi menunjukkan kinerja keuangan bisnis Anda selama periode tertentu. Ini mencakup pendapatan, biaya operasional, dan laba bersih yang dihasilkan setiap bulan.',
  cf: 'Laporan Arus Kas melacak pergerakan uang masuk dan keluar dari bisnis Anda. Ini membantu memastikan Anda memiliki cukup kas untuk operasi harian dan investasi.',
  bs: 'Neraca menunjukkan posisi keuangan bisnis Anda pada akhir setiap bulan, mencakup aset, liabilitas, dan ekuitas pemilik.',
  tr: 'Grafik Tren memvisualisasikan perubahan metrik keuangan utama sepanjang tahun, membantu Anda mengidentifikasi pola dan tren bisnis.',
};

function Metrics({ data }) {
  const totals = useMemo(() => {
    if (!data) return { revenue: 0, netIncome: 0, cashEnd: 0, totalAssets: 0 };

    const revenue = Array.from({ length: 12 }).reduce((acc, _, i) => acc + (data.incomeStatement?.[i + 1]?.revenue || 0), 0);
    const netIncome = Array.from({ length: 12 }).reduce((acc, _, i) => acc + (data.incomeStatement?.[i + 1]?.netIncome || 0), 0);

    const lastIdx = [...Array(12).keys()].reverse().find(i => data.cashFlow?.[i + 1]) ?? 11;
    const cashEnd = data.cashFlow?.[lastIdx + 1]?.cashEnding || 0;
    const totalAssets = data.balanceSheet?.[lastIdx + 1]?.assets?.total || 0;

    return { revenue, netIncome, cashEnd, totalAssets };
  }, [data]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{currency(totals.revenue)}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/20">
            <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Bersih</p>
            <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{currency(totals.netIncome)}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg dark:bg-teal-900/20">
            <BarChart3 className="text-teal-600 dark:text-teal-400" size={24} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kas Akhir Tahun</p>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{currency(totals.cashEnd)}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Aset Akhir Tahun</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currency(totals.totalAssets)}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
            <Landmark className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TableRow({ month, data, className = '' }) {
  return (
    <tr className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${className}`}>
      {Array.isArray(month) ? month.map((cell, i) => (
        <td key={i} className={`px-4 py-3 ${i === 0 ? 'text-left font-medium text-gray-900 dark:text-gray-100' : 'text-right text-gray-700 dark:text-gray-300'}`}>
          {cell}
        </td>
      )) : (
        <>
          <td className="px-4 py-3 font-medium text-left text-gray-900 dark:text-gray-100">{month}</td>
          {data.map((cell, i) => (
            <td key={i} className={`px-4 py-3 text-right text-gray-700 dark:text-gray-300 ${i === data.length - 1 ? 'font-semibold text-gray-900 dark:text-white' : ''}`}>
              {cell}
            </td>
          ))}
        </>
      )}
    </tr>
  );
}

function IncomeStatement({ data, filterMonth }) {
  const filteredData = filterMonth ? { [filterMonth]: data?.[filterMonth] } : data;

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Laporan Laba Rugi Bulanan</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{helpers.is}</p>
          </div>
          <Info size={18} className="flex-shrink-0 mt-1 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
              <th className="px-4 py-3 font-semibold text-left text-gray-900 dark:text-white">Bulan</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Pendapatan</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">HPP</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Laba Kotor</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Beban Operasional</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Laba Operasi</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Pendapatan Lain</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Beban Bunga</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Pajak</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Laba Bersih</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1;
              if (filterMonth && m !== filterMonth) return null;
              const row = filteredData?.[m] || {};
              return (
                <TableRow
                  key={m}
                  month={monthNames[i]}
                  data={[
                    number(row.revenue),
                    number(row.cogs),
                    number(row.grossProfit),
                    number(row.opex),
                    number(row.operatingIncome),
                    number(row.otherIncome),
                    number(row.interest),
                    number(row.tax),
                    number(row.netIncome),
                  ]}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashFlow({ data, filterMonth }) {
  const filteredData = filterMonth ? { [filterMonth]: data?.[filterMonth] } : data;

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Laporan Arus Kas Bulanan</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fokus ke cash in – cash out untuk melihat kestabilan cashflow bisnis</p>
          </div>
          <Info size={18} className="flex-shrink-0 mt-1 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 dark:border-teal-700">
              <th className="px-4 py-3 font-semibold text-left text-gray-900 dark:text-white">Bulan</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Kas Masuk</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Pendapatan</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Modal Tambahan</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Kas Keluar</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Net Cash Flow</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Kas Awal</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Kas Akhir</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1;
              if (filterMonth && m !== filterMonth) return null;
              const row = filteredData?.[m] || {};
              return (
                <TableRow
                  key={m}
                  month={monthNames[i]}
                  data={[
                    number(row.cashIn),
                    number(row.totalIncome),
                    number(row.additionalCapital),
                    number(row.cashOut),
                    number(row.netCashFlow),
                    number(row.cashBeginning),
                    number(row.cashEnding),
                  ]}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BalanceSheet({ data, filterMonth }) {
  const filteredData = filterMonth ? { [filterMonth]: data?.[filterMonth] } : data;

  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Neraca Sederhana</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Versi mini dari neraca akuntansi untuk melihat posisi keuangan bisnis</p>
          </div>
          <Info size={18} className="flex-shrink-0 mt-1 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border-indigo-700">
              <th className="px-4 py-3 font-semibold text-left text-gray-900 dark:text-white">Bulan</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Kas</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Aset Tetap</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Piutang</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Total Aset</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Utang</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Kewajiban Lain</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Total Liabilitas</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Ekuitas</th>
              <th className="px-4 py-3 font-semibold text-right text-gray-900 dark:text-white">Laba Ditahan</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1;
              if (filterMonth && m !== filterMonth) return null;
              const row = filteredData?.[m] || {};
              return (
                <TableRow
                  key={m}
                  month={monthNames[i]}
                  data={[
                    number(row.assets?.cash),
                    number(row.assets?.fixedAssets),
                    number(row.assets?.receivables),
                    number(row.assets?.total),
                    number(row.liabilities?.debt),
                    number(row.liabilities?.otherLiabilities),
                    number(row.liabilities?.total),
                    number(row.equity?.total),
                    number(row.equity?.retainedEarnings),
                  ]}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Trends({ trends }) {
  return (
    <div className="space-y-4">
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">{helpers.tr}</h4>
          </div>
        </div>
      </div>
      <TrendsCharts trends={trends} />
    </div>
  );
}

function TrendsCharts({ trends }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '500' },
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        borderColor: '#E5E7EB',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: { size: 11 },
        },
      },
    },
  };

  const revenueData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Pendapatan',
        data: trends?.revenue || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const netIncomeData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Laba Bersih',
        data: trends?.netIncome || [],
        borderColor: '#14B8A6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#14B8A6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const cashFlowData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Kas Akhir',
        data: trends?.cashEnding || [],
        backgroundColor: '#3B82F6',
        borderColor: '#1E40AF',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const assetsData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Total Aset',
        data: trends?.totalAssets || [],
        backgroundColor: '#6366F1',
        borderColor: '#4F46E5',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-4 lg:grid-cols-2">
      <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tren Pendapatan</h3>
        <div style={{ height: '300px' }}>
          <Line data={revenueData} options={chartOptions} />
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tren Laba Bersih</h3>
        <div style={{ height: '300px' }}>
          <Line data={netIncomeData} options={chartOptions} />
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tren Kas Akhir</h3>
        <div style={{ height: '300px' }}>
          <Bar data={cashFlowData} options={chartOptions} />
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tren Total Aset</h3>
        <div style={{ height: '300px' }}>
          <Bar data={assetsData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default function MonthlyReports({ selectedBusiness, onBack }) {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('is');
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    // Generate available years (current year - 5 to current year + 5)
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getMonthlyReport(year, {
          business_background_id: selectedBusiness?.id,
          user_id: user?.id,
        });
        if (!ignore) setData(res);
      } catch (e) {
        console.error(e);
        if (!ignore) setError('Gagal memuat laporan.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (selectedBusiness && user) {
      load();
    }
    return () => { ignore = true; };
  }, [year, selectedBusiness?.id, user?.id]);

  return (
    <div className="space-y-6">
      {/* Header + Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowLeft size={18} className="mr-2" />
              Kembali
            </button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Laporan Keuangan Bulanan</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBusiness?.name || `Bisnis #${selectedBusiness?.id || '-'}`} • Tahun {year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarIcon size={18} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="number"
              className="py-2 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg w-28 pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value || new Date().getFullYear()))}
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => window.print()}>
            <Printer size={18} className="mr-2" />
            Cetak
          </button>
        </div>
      </div>

      {/* KPI */}
      {!loading && data && <Metrics data={data} />}

      {/* Tabs + Year Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTab('is')} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tab === 'is' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>Laba Rugi</button>
          <button onClick={() => setTab('cf')} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tab === 'cf' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>Arus Kas</button>
          <button onClick={() => setTab('bs')} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tab === 'bs' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>Neraca</button>
          <button onClick={() => setTab('tr')} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tab === 'tr' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>Grafik Tren</button>
        </div>
        <div className="relative">
          <button onClick={() => setShowYearFilter(!showYearFilter)} className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all ${showYearFilter ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
            <Filter size={16} className="mr-2" />
            Filter Tahun ({year})
          </button>
          {showYearFilter && (
            <div className="absolute right-0 z-10 w-40 mt-2 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 max-h-64">
              <div className="p-2">
                {availableYears.map((y) => (
                  <button key={y} onClick={() => { setYear(y); setShowYearFilter(false); }} className={`w-full px-3 py-2 text-sm text-left rounded ${year === y ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{y}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="p-6 text-center bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <span className="text-gray-600 dark:text-gray-300">Memuat...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">{error}</div>
      )}

      {!loading && data && (
        <div className="space-y-4">
          {tab === 'is' && <IncomeStatement data={data.incomeStatement} />}
          {tab === 'cf' && <CashFlow data={data.cashFlow} />}
          {tab === 'bs' && <BalanceSheet data={data.balanceSheet} />}
          {tab === 'tr' && <Trends trends={data.trends} />}
        </div>
      )}
    </div>
  );
}
