import React from 'react';
import AppImage from '@/components/ui/AppImage';

export default function WatermarkLogo() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <AppImage
        src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
        alt="Watermark logo transparan LNAKRI NGO di latar belakang halaman"
        width={500}
        height={500}
        className="opacity-[0.035] select-none"
        priority={false}
      />
    </div>
  );
}