'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Phone, Shield } from 'lucide-react';

const navLinks = [
  { label: 'Beranda', href: '#beranda', key: 'nav-beranda' },
  { label: 'Berita', href: '#berita', key: 'nav-berita' },
  { label: 'Pengumuman', href: '#pengumuman', key: 'nav-pengumuman' },
  { label: 'Profil', href: '#profil', key: 'nav-profil' },
  { label: 'Pendiri', href: '#pendiri', key: 'nav-pendiri' },
  { label: 'Donasi', href: '#donasi', key: 'nav-donasi' },
  { label: 'JAGA', href: '#jaga', key: 'nav-jaga' },
];

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <AppLogo src="/assets/images/a21354667_lnakrilogo-1776577431349.png" size={40} />
            <div>
              <span className="font-display text-base font-800 text-[#1a3a5c] leading-tight block">LNAKRI NGO</span>
              <span className="text-xs text-gray-500 leading-tight block">Lembaga Nasional Anti Korupsi RI</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks?.map(link => (
              <a key={link?.key} href={link?.href} className="text-sm font-600 text-gray-700 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-150">
                {link?.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="https://wa.me/6282295592545" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-600 px-4 py-2 rounded-lg transition-all duration-150">
              <Phone size={14} />
              <span>WA Hotline</span>
            </a>
            <Link href="/lapor"
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-sm font-600 px-4 py-2 rounded-lg transition-all duration-150">
              <Shield size={14} />
              <span>Laporkan Korupsi</span>
            </Link>
            <Link href="/backend"
              className="flex items-center gap-2 border border-[#1a3a5c] text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white text-sm font-600 px-4 py-2 rounded-lg transition-all duration-150">
              Admin
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-1 animate-fade-in">
            {navLinks?.map(link => (
              <a key={link?.key} href={link?.href} onClick={() => setMobileOpen(false)}
                className="block text-sm font-600 text-gray-700 hover:text-red-700 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-all duration-150">
                {link?.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 px-2">
              <Link href="/lapor"
                className="btn-primary justify-center text-sm">
                <Shield size={14} /> Laporkan Korupsi
              </Link>
              <Link href="/backend"
                className="btn-secondary justify-center text-sm">
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}