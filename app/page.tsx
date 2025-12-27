import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/landing/Hero"
import { FeaturedUnits } from "@/components/landing/FeaturedUnits"
import { LocationMap } from "@/components/landing/LocationMap"
import { GallerySection } from "@/components/landing/GallerySection" // Import Gallery
import { FAQSection } from "@/components/landing/FAQSection"
import { ContactSection } from "@/components/landing/ContactSection"
// Removed StickyCTA import
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch featured units with their reviews
  const featuredUnitsData = await prisma.unit.findMany({
    where: {
      slug: {
        in: ['big-house', 'veranda-unit']
      }
    },
    include: {
      reviews: {
        select: {
          rating: true
        }
      }
    }
  });

  // Calculate stats manually since we are using 'include' not 'aggregate' per unit in a single query comfortably with findMany in basic Prisma
  const sortedUnits = featuredUnitsData.map(unit => {
    const totalReviews = unit.reviews.length;
    const avgRating = totalReviews > 0 
      ? unit.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
      : 0;

    return {
      ...unit,
      reviewCount: totalReviews,
      avgRating: avgRating
    };
  }).sort((a, b) => {
      // Sort logic: Big House first
      if (a.slug === 'big-house') return -1;
      if (b.slug === 'big-house') return 1;
      return 0;
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <FeaturedUnits units={sortedUnits} />
      <LocationMap />
      <GallerySection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  )
}