import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { LocationMap } from '@/components/landing/LocationMap'
import { ContactSection } from '@/components/landing/ContactSection'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <LocationMap />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}