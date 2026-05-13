'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Newspaper, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const dailyVisits = [
  { day: 'Sen 13', visits: 342 }, { day: 'Sel 14', visits: 289 }, { day: 'Rab 15', visits: 412 },
  { day: 'Kam 16', visits: 378 }, { day: 'Jum 17', visits: 521 }, { day: 'Sab 18', visits: 198 },
  { day: 'Min 19', visits: 267 },
];

const monthlyVisits = [
  { month: 'Jan', visits: 4821 }, { month: 'Feb', visits: 5234 }, { month: 'Mar', visits: 4987 },
  { month: 'Apr', visits: 6341 }, { month: 'Mei', visits: 5876 }, { month: 'Jun', visits: 6789 },
  { month: 'Jul', visits: 7234 }, { month: 'Agu', visits: 6543 }, { month: 'Sep', visits: 7890 },
  { month: 'Okt', visits: 8234 }, { month: 'Nov', visits: 7654 }, { month: 'Des', visits: 9012 },
];

const yearlyVisits = [
  { year: '2020', visits: 18420 }, { year: '2021', visits: 24560 }, { year: '2022', visits: 38900 },
  { year: '2023', visits: 52340 }, { year: '2024', visits: 67890 }, { year: '2025', visits: 84210 },
  { year: '2026', visits: 34560 },
];

type ChartRange = 'daily' | 'monthly' | 'yearly';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-600 text-gray-500 mb-1">{label}</p>
        <p className="text-base font-800 text-[#1a3a5c]">{payload[0].value.toLocaleString('id-ID')} kunjungan</p>
      </div>
    );
  }
  return null;
};

export default function DashboardOverview() {
  const [chartRange, setChartRange] = useState<ChartRange>('monthly');
  const [stats, setStats] = useState({
    totalComplaints: 0,
    diprosesComplaints: 0,
    selesaiComplaints: 0,
    totalNews: 0,
    mbgComplaints: 0,
    visits: 6341,
    recentComplaints: [] as any[],
    recentNews: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-stats');
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const chartData = chartRange === 'daily' ? dailyVisits : chartRange === 'monthly' ? monthlyVisits : yearlyVisits;
  const xKey = chartRange === 'daily' ? 'day' : chartRange === 'monthly' ? 'month' : 'year';

  const kpiCards = [
    { id: 'kpi-keluhan', label: 'Total Keluhan Masuk', value: stats.totalComplaints.toLocaleString('id-ID'), icon: <MessageSquare size={20} />, color: 'bg-blue-50 text-blue-700', border: 'border-l-4 border-l-blue-500', trend: '+12% bulan ini' },
    { id: 'kpi-diproses', label: 'Sedang Diproses', value: stats.diprosesComplaints.toLocaleString('id-ID'), icon: <Clock size={20} />, color: 'bg-amber-50 text-amber-700', border: 'border-l-4 border-l-amber-500', trend: '7 baru hari ini' },
    { id: 'kpi-selesai', label: 'Keluhan Selesai', value: stats.selesaiComplaints.toLocaleString('id-ID'), icon: <CheckCircle size={20} />, color: 'bg-green-50 text-green-700', border: 'border-l-4 border-l-green-500', trend: '+8% bulan ini' },
    { id: 'kpi-berita', label: 'Berita Dipublikasikan', value: stats.totalNews.toLocaleString('id-ID'), icon: <Newspaper size={20} />, color: 'bg-purple-50 text-purple-700', border: 'border-l-4 border-l-purple-500', trend: '3 berita baru' },
    { id: 'kpi-kunjungan', label: 'Kunjungan Bulan Ini', value: stats.visits.toLocaleString('id-ID'), icon: <Eye size={20} />, color: 'bg-red-50 text-red-700', border: 'border-l-4 border-l-red-600', trend: '+23% vs bulan lalu' },
    { id: 'kpi-mbg', label: 'Laporan MBG Masuk', value: stats.mbgComplaints.toLocaleString('id-ID'), icon: <AlertTriangle size={20} />, color: 'bg-orange-50 text-orange-700', border: 'border-l-4 border-l-orange-500', trend: '12 belum ditangani' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-[#1a3a5c]">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-0.5">Ringkasan aktivitas LNAKRI NGO per 19 April 2026</p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          Diperbarui: 05:47 WIB
        </div>
      </div>

      {/* KPI Grid: 6 cards → 3×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {kpiCards.map(card => (
          <div key={card.id} className={`bg-white rounded-xl shadow-sm ${card.border} p-5 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
              <span className="text-xs text-gray-400 font-600">{card.trend}</span>
            </div>
            <div className="text-3xl font-800 text-[#1a3a5c] tabular-nums">{card.value}</div>
            <div className="text-sm text-gray-500 font-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Visitor Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-700 text-[#1a3a5c] text-base">Grafik Kunjungan Website</h3>
            <p className="text-gray-500 text-xs mt-0.5">Statistik pengunjung LNAKRI NGO</p>
          </div>
          <div className="flex gap-2">
            {(['daily', 'monthly', 'yearly'] as ChartRange[]).map(range => (
              <button key={`chart-range-${range}`} onClick={() => setChartRange(range)}
                className={`text-xs font-700 px-3 py-1.5 rounded-lg transition-all duration-150 ${chartRange === range ? 'bg-[#1a3a5c] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {range === 'daily' ? 'Harian' : range === 'monthly' ? 'Bulanan' : 'Tahunan'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          {chartRange === 'yearly' ? (
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c0392b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="visits" stroke="#c0392b" strokeWidth={2.5} dot={{ fill: '#c0392b', r: 4 }} />
            </LineChart>
          ) : chartRange === 'daily' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visits" fill="#1a3a5c" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visits" stroke="#1a3a5c" strokeWidth={2} fill="url(#monthGrad)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-700 text-[#1a3a5c] text-base mb-4">Keluhan Terbaru</h3>
          <div className="space-y-3">
            {stats.recentComplaints.map(item => (
              <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-[#1a3a5c]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1a3a5c] font-700 text-xs">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-600 text-[#1a3a5c]">{item.name}</span>
                    <span className={`status-${item.status}`}>
                      {item.status === 'diterima' ? 'Diterima' : item.status === 'diproses' ? 'Diproses' : 'Selesai'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.subject}</p>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-700 text-[#1a3a5c] text-base mb-4">Berita Terpublikasi Terbaru</h3>
          <div className="space-y-3">
            {stats.recentNews.map(item => (
              <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Newspaper size={14} className="text-red-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-[#1a3a5c] line-clamp-1">{item.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{item.author}</span>
                    <span>{item.date}</span>
                    <span className="flex items-center gap-1"><Eye size={10} />{item.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}