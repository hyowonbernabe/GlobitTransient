import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UnitCard } from '@/components/booking/UnitCard'
import { UnitSearchFilter } from '@/components/booking/UnitSearchFilter'
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
      // UPDATED: Only exclude units with CONFIRMED bookings. Pending ones are fair game.
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

      const excludedIds = unavailableUnitIds.map(b => b.unitId)
      
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
  
  return units
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Page Header */}
        <div className="bg-emerald-900 text-white pt-12 pb-16 px-4">
          <div className="container mx-auto space-y-4 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">Select Your Unit</h1>
            <p className="text-emerald-100 max-w-xl mx-auto md:mx-0">
              From cozy couple rooms to full house rentals. Find the perfect space for your Baguio getaway.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <UnitSearchFilter />

        <div className="container mx-auto px-4 mt-12 space-y-12">
          
          {/* No Results State */}
          {allUnits.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No units available</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                We couldn't find any units matching your criteria. Try adjusting your dates or guest count.
              </p>
            </div>
          )}

          {/* Spotlight Section */}
          {featuredUnits.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-amber-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {isFiltering ? 'Available Top Choices' : 'Most Popular Choices'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredUnits.map(unit => (
                  <UnitCard key={unit.id} unit={unit} isFeatured={true} />
                ))}
              </div>
            </section>
          )}

          {/* Standard Grid */}
          {standardUnits.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {isFiltering ? 'Other Available Rooms' : 'All Available Rooms'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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