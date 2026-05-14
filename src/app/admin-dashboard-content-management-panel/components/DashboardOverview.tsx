'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  MousePointerClick,
  Newspaper,
  Users,
} from 'lucide-react';

type ChartRange = 'daily' | 'monthly' | 'yearly';
type VisitPoint = { day?: string; month?: string; year?: string; visits: number };

type DashboardStats = {
  totalComplaints: number;
  diprosesComplaints: number;
  selesaiComplaints: number;
  totalNews: number;
  mbgComplaints: number;
  visits: number;
  uniqueVisitors: number;
  visitsData: {
    daily: VisitPoint[];
    monthly: VisitPoint[];
    yearly: VisitPoint[];
  };
  topPages: {
    path: string;
    title: string;
    visits: number;
    uniqueVisitors: number;
  }[];
  recentComplaints: any[];
  recentNews: any[];
};

const defaultStats: DashboardStats = {
  totalComplaints: 0,
  diprosesComplaints: 0,
  selesaiComplaints: 0,
  totalNews: 0,
  mbgComplaints: 0,
  visits: 0,
  uniqueVisitors: 0,
  visitsData: {
    daily: [],
    monthly: [],
    yearly: [],
  },
  topPages: [],
  recentComplaints: [],
  recentNews: [],
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-600 text-gray-500 mb-1">{label}</p>
        <p className="text-base font-800 text-[#1a3a5c]">
          {payload[0].value.toLocaleString('id-ID')} kunjungan
        </p>
      </div>
    );
  }

  return null;
};

function EmptyChart() {
  return (
    <div className="h-[260px] flex items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
      <div className="text-center">
        <Eye size={28} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm font-600 text-gray-500">
          Data kunjungan akan muncul setelah ada pengunjung.
        </p>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [chartRange, setChartRange] = useState<ChartRange>('monthly');
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-stats', { cache: 'no-store' });
        const data = await res.json();

        if (res.ok) {
          setStats({ ...defaultStats, ...data });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const chartData = stats.visitsData[chartRange] || [];
  const xKey = chartRange === 'daily' ? 'day' : chartRange === 'monthly' ? 'month' : 'year';

  const updatedAt = useMemo(
    () =>
      new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }),
    []
  );

  const kpiCards = [
    {
      id: 'kpi-keluhan',
      label: 'Total Keluhan Masuk',
      value: stats.totalComplaints.toLocaleString('id-ID'),
      icon: <MessageSquare size={20} />,
      color: 'bg-blue-50 text-blue-700',
      border: 'border-l-4 border-l-blue-500',
      trend: 'Semua laporan',
    },
    {
      id: 'kpi-diproses',
      label: 'Sedang Diproses',
      value: stats.diprosesComplaints.toLocaleString('id-ID'),
      icon: <Clock size={20} />,
      color: 'bg-amber-50 text-amber-700',
      border: 'border-l-4 border-l-amber-500',
      trend: 'Butuh tindak lanjut',
    },
    {
      id: 'kpi-selesai',
      label: 'Keluhan Selesai',
      value: stats.selesaiComplaints.toLocaleString('id-ID'),
      icon: <CheckCircle size={20} />,
      color: 'bg-green-50 text-green-700',
      border: 'border-l-4 border-l-green-500',
      trend: 'Sudah ditutup',
    },
    {
      id: 'kpi-berita',
      label: 'Berita Dipublikasikan',
      value: stats.totalNews.toLocaleString('id-ID'),
      icon: <Newspaper size={20} />,
      color: 'bg-purple-50 text-purple-700',
      border: 'border-l-4 border-l-purple-500',
      trend: 'Konten publik',
    },
    {
      id: 'kpi-kunjungan',
      label: 'Kunjungan Bulan Ini',
      value: stats.visits.toLocaleString('id-ID'),
      icon: <Eye size={20} />,
      color: 'bg-red-50 text-red-700',
      border: 'border-l-4 border-l-red-600',
      trend: 'Analytics internal',
    },
    {
      id: 'kpi-visitor',
      label: 'Visitor Unik Bulan Ini',
      value: stats.uniqueVisitors.toLocaleString('id-ID'),
      icon: <Users size={20} />,
      color: 'bg-cyan-50 text-cyan-700',
      border: 'border-l-4 border-l-cyan-500',
      trend: 'Perkiraan harian',
    },
    {
      id: 'kpi-mbg',
      label: 'Laporan MBG Masuk',
      value: stats.mbgComplaints.toLocaleString('id-ID'),
      icon: <AlertTriangle size={20} />,
      color: 'bg-orange-50 text-orange-700',
      border: 'border-l-4 border-l-orange-500',
      trend: 'Kategori MBG',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-[#1a3a5c]">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Ringkasan aktivitas dan analytics internal LNAKRI NGO
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          Diperbarui: {updatedAt} WIB
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className={`bg-white rounded-xl shadow-sm ${card.border} p-5 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}
              >
                {card.icon}
              </div>
              <span className="text-xs text-gray-400 font-600">{card.trend}</span>
            </div>
            <div className="text-3xl font-800 text-[#1a3a5c] tabular-nums">{card.value}</div>
            <div className="text-sm text-gray-500 font-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.55fr] gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="font-700 text-[#1a3a5c] text-base">Grafik Kunjungan Website</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                Data asli dari tracking internal website
              </p>
            </div>
            <div className="flex gap-2">
              {(['daily', 'monthly', 'yearly'] as ChartRange[]).map((range) => (
                <button
                  key={`chart-range-${range}`}
                  onClick={() => setChartRange(range)}
                  className={`text-xs font-700 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                    chartRange === range
                      ? 'bg-[#1a3a5c] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === 'daily' ? 'Harian' : range === 'monthly' ? 'Bulanan' : 'Tahunan'}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              {chartRange === 'yearly' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#c0392b"
                    strokeWidth={2.5}
                    dot={{ fill: '#c0392b', r: 4 }}
                  />
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
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#1a3a5c"
                    strokeWidth={2}
                    fill="url(#monthGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-700 text-[#1a3a5c] text-base mb-4">Halaman Terpopuler</h3>
          {stats.topPages.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
              Belum ada data halaman bulan ini.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.topPages.map((page) => (
                <div
                  key={page.path}
                  className="border-b border-gray-50 last:border-0 pb-3 last:pb-0"
                >
                  <p className="text-sm font-700 text-[#1a3a5c] line-clamp-1">{page.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{page.path}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MousePointerClick size={12} />
                      {page.visits.toLocaleString('id-ID')} kunjungan
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {page.uniqueVisitors.toLocaleString('id-ID')} unik
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-700 text-[#1a3a5c] text-base mb-4">Keluhan Terbaru</h3>
          <div className="space-y-3">
            {stats.recentComplaints.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="w-8 h-8 bg-[#1a3a5c]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1a3a5c] font-700 text-xs">
                  {(item.name || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-600 text-[#1a3a5c]">
                      {item.name || 'Pelapor'}
                    </span>
                    <span className={`status-${item.status}`}>
                      {item.status === 'diterima'
                        ? 'Diterima'
                        : item.status === 'diproses'
                          ? 'Diproses'
                          : 'Selesai'}
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
            {stats.recentNews.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Newspaper size={14} className="text-red-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-[#1a3a5c] line-clamp-1">{item.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{item.author}</span>
                    <span>{item.date}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} />
                      {item.views}
                    </span>
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
