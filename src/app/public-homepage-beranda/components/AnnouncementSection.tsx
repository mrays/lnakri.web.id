'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronRight } from 'lucide-react';

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: 'Mendesak', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  penting: { label: 'Penting', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  info: { label: 'Informasi', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
};

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (res.ok) {
        // Filter only active announcements for public view
        setAnnouncements(data.announcements.filter((ann: any) => ann.active));
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pengumuman" className="py-16 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-xs font-700 uppercase tracking-widest text-[#1a3a5c] bg-[#1a3a5c]/10 px-3 py-1 rounded-full">Pengumuman</span>
            <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">Pengumuman Resmi LNAKRI</h2>
          </div>
          <Bell size={28} className="text-[#1a3a5c] opacity-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-2 text-center py-10 text-gray-500">Memuat pengumuman...</div>
          ) : announcements.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500">Belum ada pengumuman aktif.</div>
          ) : (
            announcements.map(ann => {
              const prio = priorityConfig[ann.priority] || priorityConfig.info;
              return (
                <div key={ann.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md p-6 transition-all duration-200 group">
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${prio.dot}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-xs font-700 px-2.5 py-0.5 rounded-full ${prio.color}`}>{prio.label}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={11} />{ann.date}</span>
                      </div>
                      <h3 className="font-700 text-[#1a3a5c] text-base mb-2 group-hover:text-red-700 transition-colors cursor-pointer">
                        {ann.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{ann.content}</p>
                      <button className="mt-3 text-red-700 text-sm font-600 hover:text-red-800 flex items-center gap-1">
                        Baca Selengkapnya <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}