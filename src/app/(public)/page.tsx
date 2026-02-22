import HeroSection from '@/components/sections/HeroSection'
import CategoriesSection from '@/components/sections/CategoriesSection'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import ServiciosSection from '@/components/sections/ServiciosSection'
import StatsSection from '@/components/sections/StatsSection'
import TestimoniosSection from '@/components/sections/TestimoniosSection'
import NewsletterSection from '@/components/sections/NewsletterSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <ServiciosSection />
      <StatsSection />
      <TestimoniosSection />
      <NewsletterSection />
    </>
  )
}
