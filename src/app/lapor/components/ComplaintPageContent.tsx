'use client';
import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Shield, AlertTriangle, FileText, Search, MessageSquare } from 'lucide-react';
import ComplaintForm from './ComplaintForm';
import MbgReportForm from './MbgReportForm';
import LegalAidForm from './LegalAidForm';
import LegalProtectionForm from './LegalProtectionForm';
import StatusTracker from './StatusTracker';
import ConsultationForm from './ConsultationForm';

const tabs = [
  { id: 'keluhan', label: 'Keluhan Korupsi', icon: <Shield size={16} />, color: 'text-red-700', active: 'bg-red-700 text-white border-red-700', hash: '' },
  { id: 'mbg', label: 'Pantau MBG SPPG', icon: <AlertTriangle size={16} />, color: 'text-amber-600', active: 'bg-amber-600 text-white border-amber-600', hash: 'mbg' },
  { id: 'bantuan-hukum', label: 'Bantuan Hukum', icon: <FileText size={16} />, color: 'text-blue-700', active: 'bg-blue-700 text-white border-blue-700', hash: 'bantuan-hukum' },
  { id: 'perlindungan', label: 'Perlindungan Saksi', icon: <Shield size={16} />, color: 'text-green-700', active: 'bg-green-700 text-white border-green-700', hash: 'perlindungan' },
  { id: 'status', label: 'Cek Status', icon: <Search size={16} />, color: 'text-purple-700', active: 'bg-purple-700 text-white border-purple-700', hash: 'status' },
  { id: 'konsultasi', label: 'Konsultasi', icon: <MessageSquare size={16} />, color: 'text-indigo-700', active: 'bg-indigo-700 text-white border-indigo-700', hash: 'konsultasi' },
];

export default function ComplaintPageContent() {
  const [activeTab, setActiveTab] = useState('keluhan');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/organization-profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'keluhan': return <ComplaintForm />;
      case 'mbg': return <MbgReportForm />;
      case 'bantuan-hukum': return <LegalAidForm />;
      case 'perlindungan': return <LegalProtectionForm />;
      case 'status': return <StatusTracker />;
      case 'konsultasi': return <ConsultationForm />;
      default: return <ComplaintForm />;
    }
  };

  const tagline = profile?.complaintPageTagline || 'JANGAN TAKUT BERSUARA!!';
  const title = profile?.complaintPageTitle || 'Keluhan & Pelaporan Masyarakat';
  const subtitle = profile?.complaintPageSubtitle || 'Laporkan dugaan korupsi, penyimpangan MBG, atau ajukan bantuan hukum. Semua laporan ditangani secara profesional dan rahasia.';

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0f2540] py-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AppImage
            src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
            alt="LNAKRI logo watermark di halaman keluhan masyarakat"
            width={300}
            height={300}
            className="opacity-5"
          />
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 lg:px-8 text-center">
          {/* Logo kecil kiri atas */}
          <div className="absolute left-4 lg:left-8 top-0">
            <AppImage
              src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
              alt="Logo kecil LNAKRI di pojok kiri atas halaman form keluhan"
              width={36}
              height={36}
              className="opacity-70"
            />
          </div>
          <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-700 px-3 py-1 rounded-full mb-4 border border-yellow-400/30">
            {tagline}
          </span>
          <h1 className="text-2xl lg:text-4xl font-800 text-white mb-3">{title}</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm lg:text-base">
            {subtitle}
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs?.map(tab => (
              <button
                key={`tab-${tab?.id}`}
                onClick={() => setActiveTab(tab?.id)}
                id={tab?.hash || undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-700 whitespace-nowrap transition-all duration-150 border flex-shrink-0
                  ${activeTab === tab?.id ? tab?.active : `bg-white border-gray-200 ${tab?.color} hover:bg-gray-50`}`}
              >
                {tab?.icon}
                {tab?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10">
        {renderContent()}
      </div>
    </div>
  );
}