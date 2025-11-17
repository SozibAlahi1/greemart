import { Suspense } from 'react';
import HomeContent from './components/HomeContent';
import BannerCarousel from './components/BannerCarousel';
import SettingsBanner from './components/SettingsBanner';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <SettingsBanner />
      <BannerCarousel />
      <HomeContent />
    </Suspense>
  );
}
