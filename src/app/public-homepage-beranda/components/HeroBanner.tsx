'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { Shield, AlertTriangle, FileText, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/whatsapp';

const slides = [
  {
    id: 'slide-001',
    title: 'SIAP MEMBANTU DAN BERANTAS KORUPSI',
    subtitle: 'JANGAN TAKUT BERSUARA!!',
    desc: 'Lembaga Nasional Anti Korupsi RI hadir untuk menerima laporan, melindungi saksi, dan menginvestigasi korupsi di seluruh Indonesia.',
    bg: 'from-[#1a3a5c] to-[#0f2540]',
    cta: { label: 'Laporkan Sekarang', href: '/lapor', icon: <Shield size={16} /> },
    badge: 'Terdaftar Kemenkumham No. AHU-0001643.AH.01.07.TAHUN 2017',
  },
  {
    id: 'slide-002',
    title: 'PANTAU MBG SPPG SELURUH INDONESIA',
    subtitle: 'Silahkan Laporkan — Langsung Ditindak!!',
    desc: 'Program pemantauan Makan Bergizi Gratis (MBG) dan SPPG di seluruh wilayah Indonesia. Laporkan penyimpangan yang Anda temukan.',
    bg: 'from-red-800 to-red-900',
    cta: { label: 'Lapor MBG', href: '/lapor#mbg', icon: <AlertTriangle size={16} /> },
    badge: 'Program Pemantauan Nasional',
  },
  {
    id: 'slide-003',
    title: 'PERLINDUNGAN HUKUM UNTUK SAKSI',
    subtitle: 'Berani Bersaksi, Kami Lindungi',
    desc: 'Draft perlindungan hukum tersedia untuk saksi dan pemberi informasi korupsi. Identitas Anda terjaga dengan keamanan penuh.',
    bg: 'from-[#1a3a5c] to-[#2a5080]',
    cta: { label: 'Ajukan Perlindungan', href: '/lapor#perlindungan', icon: <FileText size={16} /> },
    badge: 'Kerahasiaan Terjamin',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [phone, setPhone] = useState('082295592545');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/organization-profile');
        const data = await res.json();
        if (res.ok && data.profile?.phone) {
          setPhone(data.profile.phone);
        }
      } catch (error) {
        console.error('Failed to fetch profile in HeroBanner:', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides?.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides?.[current];
  const formattedWa = normalizeWhatsAppNumber(phone);

  return (
    <section id="beranda" className="relative pt-16 overflow-hidden">
      <div className={`relative min-h-[520px] lg:min-h-[600px] bg-gradient-to-br ${slide?.bg} transition-all duration-700`}>
        {/* Watermark logo in hero */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AppImage
            src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
            alt="LNAKRI Logo watermark background"
            width={400}
            height={400}
            className="opacity-5 select-none"
          />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="inline-block bg-white/20 text-white text-xs font-600 px-3 py-1 rounded-full mb-5 border border-white/30">
              {slide?.badge}
            </span>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-800 text-white leading-tight mb-3 animate-slide-up">
              {slide?.title}
            </h1>
            <p className="text-xl lg:text-2xl font-600 text-yellow-300 mb-4">{slide?.subtitle}</p>
            <p className="text-base lg:text-lg text-white/85 mb-8 max-w-2xl leading-relaxed">{slide?.desc}</p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href={slide?.cta?.href}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-700 px-6 py-3 rounded-xl transition-all duration-150 shadow-lg">
                {slide?.cta?.icon}
                {slide?.cta?.label}
              </Link>
              <a href={buildWhatsAppUrl(formattedWa)} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-600 px-6 py-3 rounded-xl transition-all duration-150">
                <Phone size={16} />
                Hubungi Kami
              </a>
            </div>

            {/* Org info */}
            <div className="mt-8 flex flex-wrap gap-6 text-white/70 text-sm">
              <span>📅 Berdiri: 17 Januari 2017 di Jakarta</span>
              <span>📞 WA: {phone}</span>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          <button onClick={() => setCurrent(prev => (prev - 1 + slides?.length) % slides?.length)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          {slides?.map((s, i) => (
            <button key={s?.id} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/50'}`} />
          ))}
          <button onClick={() => setCurrent(prev => (prev + 1) % slides?.length)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {/* Stats bar */}
      <div className="bg-[#1a3a5c] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Laporan Diterima', value: '2.847', key: 'stat-laporan' },
              { label: 'Kasus Ditangani', value: '1.203', key: 'stat-kasus' },
              { label: 'Perlindungan Hukum', value: '389', key: 'stat-perlindungan' },
              { label: 'Provinsi Terjangkau', value: '34', key: 'stat-provinsi' },
            ]?.map(stat => (
              <div key={stat?.key}>
                <div className="text-2xl font-800 text-yellow-300">{stat?.value}</div>
                <div className="text-xs text-white/70 mt-0.5">{stat?.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
