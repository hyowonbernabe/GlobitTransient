import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/landing/Hero"
import { FeaturedUnits } from "@/components/landing/FeaturedUnits"
import { LocationMap } from "@/components/landing/LocationMap"
import { FAQSection } from "@/components/landing/FAQSection"
import { ContactSection } from "@/components/landing/ContactSection"
import { StickyCTA } from "@/components/landing/StickyCTA"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch only the featured units
  const featuredUnits = await prisma.unit.findMany({
    where: {
      slug: {
        in: ['big-house', 'veranda-unit']
      }
    }
  });

  // Sort them to ensure Big House or Veranda comes first as desired (optional)
  // Let's ensure Big House is first if both exist
  const sortedUnits = featuredUnits.sort((a, b) => {
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
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  )
}