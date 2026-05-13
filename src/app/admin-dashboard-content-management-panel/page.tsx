'use client';
import React, { useEffect, useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import DashboardOverview from './components/DashboardOverview';
import NewsManagement from './components/NewsManagement';
import ComplaintManagement from './components/ComplaintManagement';
import AnnouncementManagement from './components/AnnouncementManagement';
import FounderManagement from './components/FounderManagement';
import OrgProfileEditor from './components/OrgProfileEditor';
import SuggestionInbox from './components/SuggestionInbox';
import WatermarkLogo from '@/components/WatermarkLogo';

export type AdminSection = 'dashboard' | 'news' | 'complaints' | 'announcements' | 'founders' | 'profile' | 'suggestions';

export default function AdminDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  useEffect(() => {
    const authState = window.localStorage.getItem('lnakri_admin_auth');
    setIsLoggedIn(authState === '1');
    setCheckingAuth(false);
  }, []);

  const handleLogin = () => {
    window.localStorage.setItem('lnakri_admin_auth', '1');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('lnakri_admin_auth');
    setIsLoggedIn(false);
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Memeriksa sesi admin...</div>;
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardOverview />;
      case 'news': return <NewsManagement />;
      case 'complaints': return <ComplaintManagement />;
      case 'announcements': return <AnnouncementManagement />;
      case 'founders': return <FounderManagement />;
      case 'profile': return <OrgProfileEditor />;
      case 'suggestions': return <SuggestionInbox />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="watermark-bg">
      <WatermarkLogo />
      <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={handleLogout}>
        {renderSection()}
      </AdminLayout>
    </div>
  );
}