import HeroSection from '@/components/home/HeroSection'
import TrendingCarousel from '@/components/home/TrendingCarousel'
import RecommendedSection from '@/components/home/RecommendedSection'
import DiscographyBento from '@/components/home/DiscographyBento'

export default function HomePage() {
  return (
    <div className="pt-16">
      <HeroSection />
      <TrendingCarousel />
      <RecommendedSection />
      <DiscographyBento />
      <div className="h-12" />
    </div>
  )
}
