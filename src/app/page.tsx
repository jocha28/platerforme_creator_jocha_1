import HeroSection from '@/components/home/HeroSection'
import TrendingCarousel from '@/components/home/TrendingCarousel'
import DailyMixSection from '@/components/home/DailyMixSection'
import CataloguePlaylistsSection from '@/components/home/CataloguePlaylistsSection'
import RecommendedSection from '@/components/home/RecommendedSection'
import DiscographyBento from '@/components/home/DiscographyBento'

export default function HomePage() {
  return (
    <div className="pt-16">
      <HeroSection />
      <TrendingCarousel />
      <DailyMixSection />
      <CataloguePlaylistsSection />
      <RecommendedSection />
      <DiscographyBento />
      <div className="h-12" />
    </div>
  )
}
