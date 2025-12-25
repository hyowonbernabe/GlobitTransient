import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UnitCard } from '@/components/booking/UnitCard'
import { Users, Search } from 'lucide-react'

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic'

async function getUnits() {
  const units = await prisma.unit.findMany({
    orderBy: {
      basePrice: 'asc',
    },
  })
  return units
}

export default async function BookPage() {
  const allUnits = await getUnits()

  // Filter Logic for "Spotlight" units
  const featuredUnits = allUnits.filter(u => 
    u.slug === 'big-house' || u.slug === 'veranda-unit'
  )
  
  // The rest of the units
  const standardUnits = allUnits.filter(u => 
    u.slug !== 'big-house' && u.slug !== 'veranda-unit'
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Page Header */}
        <div className="bg-emerald-900 text-white py-12 px-4 mb-8">
          <div className="container mx-auto space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Select Your Unit</h1>
            <p className="text-emerald-100 max-w-xl">
              From cozy couple rooms to full house rentals. Find the perfect space for your Baguio getaway.
            </p>
            
            {/* Simple Stats */}
            <div className="flex gap-6 pt-2 text-sm text-emerald-200">
               <div className="flex items-center gap-2">
                 <Users className="w-4 h-4" />
                 <span>Total Capacity: 50+ Pax</span>
               </div>
               <div className="flex items-center gap-2">
                 <Search className="w-4 h-4" />
                 <span>{allUnits.length} Units Available</span>
               </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 space-y-12">
          
          {/* Spotlight Section */}
          {featuredUnits.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-amber-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Most Popular Choices
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
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">
                All Available Rooms
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {standardUnits.map(unit => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}