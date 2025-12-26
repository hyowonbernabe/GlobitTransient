import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { FeaturedUnits } from '@/components/landing/FeaturedUnits'
import { LocationMap } from '@/components/landing/LocationMap'
import { ContactSection } from '@/components/landing/ContactSection'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getFeaturedUnits() {
  const units = await prisma.unit.findMany({
    where: {
      slug: {
        in: ['big-house', 'veranda-unit']
      }
    },
    orderBy: {
      basePrice: 'desc'
    }
  })
  return units
}

export default async function Home() {
  const units = await getFeaturedUnits()

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <FeaturedUnits units={units} />
        <LocationMap />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}