import { Suspense } from 'react';
import HomeContent from './components/HomeContent';
import BannerCarousel from './components/BannerCarousel';
import SettingsBanner from './components/SettingsBanner';
import PageSkeleton from '@/components/skeletons/PageSkeleton';

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettingsBanner />
      <BannerCarousel />
      <HomeContent />
    </Suspense>
  );
}
