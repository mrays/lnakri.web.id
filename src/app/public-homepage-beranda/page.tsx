import React from 'react';
import PublicNav from './components/PublicNav';
import HeroBanner from './components/HeroBanner';
import NewsSection from './components/NewsSection';
import FeatureCards from './components/FeatureCards';
import AnnouncementSection from './components/AnnouncementSection';
import OrgProfile from './components/OrgProfile';
import FoundersSection from './components/FoundersSection';
import DonationSection from './components/DonationSection';
import AiConsultant from './components/AiConsultant';
import JagaIntegration from './components/JagaIntegration';
import PublicFooter from './components/PublicFooter';
import WatermarkLogo from '@/components/WatermarkLogo';

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-gray-50 watermark-bg">
      <WatermarkLogo />
      <PublicNav />
      <HeroBanner />
      <FeatureCards />
      <NewsSection />
      <AnnouncementSection />
      <OrgProfile />
      <FoundersSection />
      <JagaIntegration />
      <DonationSection />
      <AiConsultant />
      <PublicFooter />
    </div>
  );
}