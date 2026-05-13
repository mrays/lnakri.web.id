'use client';
import React, { useState, useEffect } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import type { AdminSection } from '../page';
import {
  LayoutDashboard, Newspaper, MessageSquare, Bell, Users, Building2,
  Inbox, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const baseNavItems: { key: AdminSection; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'news', label: 'Manajemen Berita', icon: <Newspaper size={18} /> },
  { key: 'complaints', label: 'Keluhan Masuk', icon: <MessageSquare size={18} /> },
  { key: 'announcements', label: 'Pengumuman', icon: <Bell size={18} /> },
  { key: 'founders', label: 'Data Pendiri', icon: <Users size={18} /> },
  { key: 'profile', label: 'Profil Organisasi', icon: <Building2 size={18} /> },
  { key: 'suggestions', label: 'Kotak Saran', icon: <Inbox size={18} /> },
];

export default function AdminLayout({
  children,
  activeSection,
  onSectionChange,
  onLogout,
}: {
  children: React.ReactNode;
  activeSection: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  onLogout: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ complaints: 0, suggestions: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/sidebar-counts');
        const data = await res.json();
        if (res.ok) {
          setCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar counts:', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems = baseNavItems.map(item => ({
    ...item,
    badge: item.key === 'complaints' ? counts.complaints : item.key === 'suggestions' ? counts.suggestions : undefined
  }));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col bg-[#0f2540] transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${!sidebarOpen && 'justify-center px-0'}`}>
          <AppLogo src="/assets/images/a21354667_lnakrilogo-1776577431349.png" size={36} />
          {sidebarOpen && (
            <div>
              <div className="text-white font-800 text-sm leading-tight">LNAKRI NGO</div>
              <div className="text-white/50 text-xs">Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={`nav-${item.key}`}
              onClick={() => onSectionChange(item.key)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-600 transition-all duration-150 group relative
                ${activeSection === item.key
                  ? 'bg-red-700 text-white shadow-md'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                }
                ${!sidebarOpen && 'justify-center px-0'}
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
              {sidebarOpen && item.badge && (
                <span className="bg-yellow-400 text-[#0f2540] text-xs font-800 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-[#0f2540] text-xs font-800 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 bg-gray-900 text-white text-xs font-600 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white text-sm font-600 transition-all"
          >
            {sidebarOpen ? (
              <><ChevronRight size={18} className="rotate-180" /><span>Ciutkan</span></>
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-700/20 hover:text-red-300 text-sm font-600 transition-all ${!sidebarOpen && 'justify-center'}`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-[#0f2540] flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AppLogo src="/assets/images/a21354667_lnakrilogo-1776577431349.png" size={32} />
                <div className="text-white font-800 text-sm">LNAKRI Admin</div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-2">
              {navItems.map(item => (
                <button key={`mob-nav-${item.key}`} onClick={() => { onSectionChange(item.key); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-600 transition-all duration-150
                    ${activeSection === item.key ? 'bg-red-700 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-yellow-400 text-[#0f2540] text-xs font-800 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="border-t border-white/10 p-3">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-700/20 text-sm font-600 transition-all">
                <LogOut size={18} /><span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu size={20} />
            </button>
            {/* Logo kecil di kiri atas */}
            <div className="flex items-center gap-2">
              <AppImage
                src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
                alt="Logo kecil LNAKRI di header admin panel"
                width={28}
                height={28}
                className="opacity-80"
              />
              <div>
                <div className="text-sm font-700 text-[#1a3a5c]">
                  {navItems.find(n => n.key === activeSection)?.label || 'Dashboard'}
                </div>
                <div className="text-xs text-gray-500">Admin LNAKRI NGO</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
              Online
            </div>
            <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-white text-sm font-700">
              A
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-1.5 text-sm font-600 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}