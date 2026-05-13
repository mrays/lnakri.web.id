import React from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, FileText, Heart, MessageSquare, ExternalLink, Search } from 'lucide-react';

const features = [
  {
    id: 'feat-keluhan',
    icon: <Shield size={28} className="text-red-700" />,
    title: 'Keluhan Masyarakat',
    desc: 'Laporkan dugaan korupsi dengan menyertakan kronologis dan dokumen bukti. Pantau status laporan Anda.',
    href: '/lapor',
    cta: 'Buat Laporan',
    color: 'border-t-4 border-t-red-700',
    bg: 'bg-red-50',
  },
  {
    id: 'feat-mbg',
    icon: <AlertTriangle size={28} className="text-amber-600" />,
    title: 'Pantau MBG SPPG',
    desc: 'Laporkan penyimpangan program Makan Bergizi Gratis (MBG) dan SPPG di seluruh Indonesia. Langsung ditindak!',
    href: '/lapor#mbg',
    cta: 'Lapor MBG',
    color: 'border-t-4 border-t-amber-500',
    bg: 'bg-amber-50',
  },
  {
    id: 'feat-bantuan',
    icon: <FileText size={28} className="text-blue-700" />,
    title: 'Bantuan Hukum',
    desc: 'Ajukan permohonan bantuan hukum dengan mengisi jenis bantuan dan kronologis beserta bukti-bukti pendukung.',
    href: '/lapor#bantuan-hukum',
    cta: 'Ajukan Bantuan',
    color: 'border-t-4 border-t-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'feat-perlindungan',
    icon: <Shield size={28} className="text-green-700" />,
    title: 'Perlindungan Hukum Saksi',
    desc: 'Draft permohonan perlindungan hukum sebagai saksi atau pemberi informasi korupsi. Identitas terjaga.',
    href: '/lapor#perlindungan',
    cta: 'Ajukan Perlindungan',
    color: 'border-t-4 border-t-green-600',
    bg: 'bg-green-50',
  },
  {
    id: 'feat-donasi',
    icon: <Heart size={28} className="text-pink-600" />,
    title: 'Donasi',
    desc: 'Dukung perjuangan LNAKRI NGO memberantas korupsi di Indonesia melalui donasi Anda.',
    href: '#donasi',
    cta: 'Donasi Sekarang',
    color: 'border-t-4 border-t-pink-500',
    bg: 'bg-pink-50',
  },
  {
    id: 'feat-konsultasi',
    icon: <MessageSquare size={28} className="text-purple-700" />,
    title: 'Konsultasi Real Time',
    desc: 'Konsultasikan permasalahan hukum anti korupsi Anda dengan tim LNAKRI NGO secara real time.',
    href: '#konsultasi',
    cta: 'Mulai Konsultasi',
    color: 'border-t-4 border-t-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: 'feat-ai',
    icon: <Search size={28} className="text-indigo-700" />,
    title: 'AI Konsultan Hukum',
    desc: 'Dapatkan informasi hukum anti korupsi dari AI Konsultan kami yang siap membantu 24/7.',
    href: '#ai-konsultan',
    cta: 'Tanya AI',
    color: 'border-t-4 border-t-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    id: 'feat-jaga',
    icon: <ExternalLink size={28} className="text-teal-700" />,
    title: 'Integrasi JAGA.id',
    desc: 'Akses layanan publik desa melalui platform JAGA.id yang terintegrasi dengan sistem kami.',
    href: '#jaga',
    cta: 'Akses JAGA',
    color: 'border-t-4 border-t-teal-600',
    bg: 'bg-teal-50',
  },
];

export default function FeatureCards() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-700 uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full">Layanan Kami</span>
          <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">Apa yang Dapat Kami Bantu?</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto text-sm lg:text-base">
            LNAKRI NGO hadir dengan berbagai layanan untuk mendukung pemberantasan korupsi di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
          {features?.map(feat => (
            <div key={feat?.id} className={`bg-white rounded-xl shadow-sm ${feat?.color} p-6 hover:shadow-md transition-all duration-200 group`}>
              <div className={`w-14 h-14 ${feat?.bg} rounded-xl flex items-center justify-center mb-4`}>
                {feat?.icon}
              </div>
              <h3 className="font-700 text-[#1a3a5c] text-base mb-2">{feat?.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{feat?.desc}</p>
              <Link href={feat?.href}
                className="text-sm font-600 text-red-700 hover:text-red-800 flex items-center gap-1 group-hover:gap-2 transition-all duration-150">
                {feat?.cta} <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}