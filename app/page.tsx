import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { FeaturedUnits } from '@/components/landing/FeaturedUnits'
import { LocationMap } from '@/components/landing/LocationMap'
import { FAQSection } from '@/components/landing/FAQSection'
import { ContactSection } from '@/components/landing/ContactSection'
import { StickyCTA } from '@/components/landing/StickyCTA'
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
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
            <Navbar />

            <main className="flex-1 bg-white">
                <Hero />
                <FeaturedUnits units={units} />
                <LocationMap />
                <FAQSection />
                <ContactSection />
            </main>

            <Footer />
        </div>
    )
}
