import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UnitCard } from '@/components/booking/UnitCard'
import { UnitSearchFilter } from '@/components/booking/UnitSearchFilter'
import { AnimatedHeader } from '@/components/booking/AnimatedHeader'
import { CalendarX } from 'lucide-react'

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    pax?: string
  }>
}

interface UnitData {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  basePrice: number
  basePax: number
  maxPax: number
  extraPaxPrice: number
  hasTV: boolean
  hasRef: boolean
  hasHeater: boolean
  hasOwnCR: boolean
}

async function getFilteredUnits(from?: string, to?: string, pax?: string) {
  // 1. Base Query
  const where: any = {}

  // 2. Filter by Capacity
  if (pax) {
    const guestCount = parseInt(pax)
    if (!isNaN(guestCount)) {
      where.maxPax = { gte: guestCount }
    }
  }

  // 3. Filter by Availability (Date Range)
  if (from && to) {
    const startDate = new Date(from)
    const endDate = new Date(to)

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      // Find units that HAVE bookings in this range
      const unavailableUnitIds = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED'] },
          OR: [
            {
              // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
              checkIn: { lte: endDate },
              checkOut: { gte: startDate }
            }
          ]
        },
        select: { unitId: true }
      })

      // Fix: Explicitly type the parameter to avoid implicit 'any'
      const excludedIds = unavailableUnitIds.map((b: { unitId: string }) => b.unitId)

      // Exclude these IDs from result
      where.id = { notIn: excludedIds }
    }
  }

  const units = await prisma.unit.findMany({
    where,
    orderBy: {
      basePrice: 'asc',
    },
  })

  return units as unknown as UnitData[]
}

export default async function BookPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { from, to, pax } = searchParams

  const allUnits = await getFilteredUnits(from, to, pax)

  // Filter Logic for "Spotlight" units
  const featuredUnits = allUnits.filter(u =>
    u.slug === 'big-house' || u.slug === 'veranda-unit'
  )

  // The rest of the units
  const standardUnits = allUnits.filter(u =>
    u.slug !== 'big-house' && u.slug !== 'veranda-unit'
  )

  const isFiltering = !!(from || to || pax)

  return (
    <div className="min-h-screen bg-[#fcfdfc] font-sans text-emerald-950 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Page Header - Refined & Immersive */}
        <AnimatedHeader />

        {/* Floating Search Hub is handled by UnitSearchFilter component fixed position */}
        <UnitSearchFilter />

        <div className="container mx-auto px-4 -mt-12 relative z-20 space-y-20">

          {/* No Results State */}
          {allUnits.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-emerald-50">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarX className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950 tracking-tight">No units available</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                Try adjusting your dates or guests to see what we have ready for you.
              </p>
            </div>
          )}

          {/* Spotlight Section */}
          {featuredUnits.length > 0 && (
            <section className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 ml-1">Curated Selections</p>
                  <h2 className="text-4xl font-black text-emerald-950 tracking-tighter">
                    {isFiltering ? 'Best Available Matches' : 'Guest Favorites'}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {featuredUnits.map(unit => (
                  <UnitCard key={unit.id} unit={unit} isFeatured={true} />
                ))}
              </div>
            </section>
          )}

          {/* Standard Grid */}
          {standardUnits.length > 0 && (
            <section className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700/60 ml-1">Full Collection</p>
                  <h2 className="text-4xl font-black text-emerald-950 tracking-tighter">
                    {isFiltering ? 'All Matching Options' : 'Browse All Rooms'}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {standardUnits.map(unit => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}