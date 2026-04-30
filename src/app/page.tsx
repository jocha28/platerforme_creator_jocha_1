import HeroSection from '@/components/home/HeroSection'
import TrendingCarousel from '@/components/home/TrendingCarousel'
import RecentlyPlayedSection from '@/components/home/RecentlyPlayedSection'
import WeeklyTopSection from '@/components/home/WeeklyTopSection'
import WeeklyTopReleasesSection from '@/components/home/WeeklyTopReleasesSection'
import DailyMixSection from '@/components/home/DailyMixSection'
import CataloguePlaylistsSection from '@/components/home/CataloguePlaylistsSection'
import RecommendedSection from '@/components/home/RecommendedSection'
import DiscographyBento from '@/components/home/DiscographyBento'

export default function HomePage() {
  return (
    <div className="pt-16">
      <HeroSection />
      <TrendingCarousel />
      <RecentlyPlayedSection />
      <WeeklyTopSection />
      <WeeklyTopReleasesSection />
      <DailyMixSection />
      <CataloguePlaylistsSection />
      <RecommendedSection />
      <DiscographyBento />
      <div className="h-12" />
    </div>
  )
}

