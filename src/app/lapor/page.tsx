import React from 'react';
import WatermarkLogo from '@/components/WatermarkLogo';
import PublicNav from '../public-homepage-beranda/components/PublicNav';
import PublicFooter from '../public-homepage-beranda/components/PublicFooter';
import ComplaintPageContent from './components/ComplaintPageContent';

export default function KeluhanPage() {
  return (
    <div className="min-h-screen bg-gray-50 watermark-bg">
      <WatermarkLogo />
      <PublicNav />
      <ComplaintPageContent />
      <PublicFooter />
    </div>
  );
}