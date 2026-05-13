'use client';
import React, { useState, useEffect } from 'react';

import AppImage from '@/components/ui/AppImage';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

const categoryColors: Record<string, string> = {
  'Investigasi': 'bg-red-100 text-red-700',
  'Pemantauan MBG': 'bg-amber-100 text-amber-700',
  'Kegiatan': 'bg-blue-100 text-blue-700',
  'Perlindungan Hukum': 'bg-green-100 text-green-700',
  'Kerjasama': 'bg-purple-100 text-purple-700',
  'Laporan': 'bg-indigo-100 text-indigo-700'
};

export default function NewsSection() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (res.ok) {
        // Filter only published news for public view
        setNewsList(data.news.filter((n: any) => n.status === 'published'));
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredNews = newsList[0];
  const sideNews = newsList.slice(1, 4);
  const bottomNews = newsList.slice(4);

  return (
    <section id="berita" className="py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-xs font-700 uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full">Berita Terkini</span>
            <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">Investigasi & Berita LNAKRI</h2>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm font-600 text-red-700 hover:text-red-800 cursor-pointer">
            Semua Berita <ChevronRight size={16} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat berita...</div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Belum ada berita yang dipublikasikan.</div>
        ) : (
          <>
            {/* Featured + Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured News (first item) */}
              {featuredNews && (
                <div className="lg:col-span-2 group cursor-pointer" onClick={() => setSelectedNews(featuredNews)}>
                  <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100">
                    <div className="relative h-64 lg:h-80 overflow-hidden">
                      <AppImage
                        src={featuredNews.image}
                        alt={featuredNews.imageAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 66vw" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-4 left-4 text-xs font-700 px-2.5 py-1 rounded-full ${categoryColors[featuredNews.category] || 'bg-gray-100 text-gray-700'}`}>
                        {featuredNews.category}
                      </span>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-700 text-xl leading-snug line-clamp-2 hover:underline cursor-pointer">
                          {featuredNews.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
                          <span className="flex items-center gap-1"><User size={12} />{featuredNews.author}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} />{featuredNews.date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{featuredNews.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{featuredNews.excerpt}</p>
                      <button className="mt-3 text-red-700 text-sm font-600 hover:text-red-800 flex items-center gap-1">
                        Baca Selengkapnya <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Side News List */}
              <div className="space-y-4">
                {sideNews.map((news) =>
                <div key={news.id} onClick={() => setSelectedNews(news)}
                className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 cursor-pointer transition-all duration-200 group">
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                      <AppImage
                      src={news.image}
                      alt={news.imageAlt}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${categoryColors[news.category] || 'bg-gray-100 text-gray-700'}`}>
                        {news.category}
                      </span>
                      <h4 className="font-600 text-[#1a3a5c] text-sm mt-1 line-clamp-2 group-hover:text-red-700 transition-colors">
                        {news.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-gray-500 text-xs">
                        <Calendar size={11} />{news.date}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {bottomNews.map((news) =>
              <div key={news.id} onClick={() => setSelectedNews(news)}
              className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md cursor-pointer transition-all duration-200 group bg-white">
                  <div className="relative h-44 overflow-hidden">
                    <AppImage
                    src={news.image}
                    alt={news.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-400"
                    sizes="(max-width: 768px) 100vw, 33vw" />
                  
                    <span className={`absolute top-3 left-3 text-xs font-700 px-2 py-0.5 rounded-full ${categoryColors[news.category] || 'bg-gray-100 text-gray-700'}`}>
                      {news.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-700 text-[#1a3a5c] text-sm leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{news.excerpt}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={11} />{news.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} />{news.date}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews &&
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto animate-fade-in" onClick={() => setSelectedNews(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full mt-8 mb-8 shadow-2xl overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-64">
              <AppImage
              src={selectedNews.image}
              alt={selectedNews.imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              priority />
            
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedNews(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                ✕
              </button>
              <span className={`absolute top-4 left-4 text-xs font-700 px-2.5 py-1 rounded-full ${categoryColors[selectedNews.category] || 'bg-gray-100 text-gray-700'}`}>
                {selectedNews.category}
              </span>
            </div>
            <div className="p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-800 text-[#1a3a5c] leading-tight mb-4">{selectedNews.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100 mb-5">
                <span className="flex items-center gap-1.5"><User size={14} className="text-red-700" />{selectedNews.author}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-red-700" />{selectedNews.date}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-red-700" />{selectedNews.time}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">{selectedNews.excerpt}</p>
              <p className="text-gray-700 leading-relaxed text-base mt-4">{selectedNews.content}</p>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={() => setSelectedNews(null)} className="btn-primary text-sm">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      }
    </section>
  );
}