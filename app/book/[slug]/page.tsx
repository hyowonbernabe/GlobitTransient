import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UnitGallery } from '@/components/booking/UnitGallery'
import { BookingForm } from '@/components/booking/BookingForm'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { Users, Wind, Tv, Bath, Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getUnitDetails(slug: string) {
  const unit = await (prisma as any).unit.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true }
          }
        }
      },
      bookings: {
        where: {
          status: 'CONFIRMED',
          checkOut: { gte: new Date() }
        },
        select: {
          checkIn: true,
          checkOut: true
        }
      }
    }
  })
  return unit
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const unit = await getUnitDetails(params.slug)

  if (!unit) {
    return {
      title: 'Unit Not Found | Globit Transient',
    }
  }

  const price = new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(unit.basePrice / 100)

  return {
    title: `${unit.name} - ${price}/night | Globit Transient`,
    description: unit.description.substring(0, 160),
    openGraph: {
      title: unit.name,
      description: `Stay at ${unit.name} for only ${price}. Good for ${unit.basePax} pax.`,
      images: unit.images.length > 0 ? [unit.images[0]] : ['/assets/images/placeholder.png'],
    },
  }
}

export default async function UnitPage(props: PageProps) {
  const params = await props.params;
  const unit = await getUnitDetails(params.slug)

  if (!unit) {
    return notFound()
  }

  const blockedDates = unit.bookings.map((b: any) => ({
    from: b.checkIn,
    to: b.checkOut
  }))

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-8">
          
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">
            
            <div className="w-full order-1 lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-emerald-950">{unit.name}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="px-3 py-1 border-emerald-200 bg-emerald-50 text-emerald-800">
                    <Users className="w-3 h-3 mr-2" />
                    Good for {unit.basePax} (Max {unit.maxPax})
                  </Badge>
                  {unit.hasOwnCR ? (
                    <Badge variant="outline" className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-800">
                      <Bath className="w-3 h-3 mr-2" />
                      Own CR
                    </Badge>
                  ) : (
                     <Badge variant="outline" className="px-3 py-1 text-gray-500">
                      Common CR
                    </Badge>
                  )}
                </div>
              </div>

              <UnitGallery images={unit.images} unitName={unit.name} />
            </div>

            <div className="w-full order-2 lg:order-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-3">
               <BookingForm 
                 pricing={{
                   id: unit.id,
                   basePrice: unit.basePrice,
                   basePax: unit.basePax,
                   extraPaxPrice: unit.extraPaxPrice,
                   maxPax: unit.maxPax,
                   hasCarConfig: true
                 }}
                 blockedDates={blockedDates}
               />
            </div>

            <div className="w-full order-3 lg:order-3 lg:col-span-2 space-y-12">
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div>
                   <h2 className="text-xl font-bold text-gray-900 mb-3">About this Unit</h2>
                   <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                     {unit.description}
                   </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg border ${unit.hasTV ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-50'}`}>
                    <Tv className="w-5 h-5 mb-2 text-gray-700" />
                    <span className="text-sm font-medium">TV</span>
                    <span className="block text-xs text-gray-500">{unit.hasTV ? 'Available' : 'Not Included'}</span>
                  </div>
                  <div className={`p-4 rounded-lg border ${unit.hasRef ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-50'}`}>
                    <Snowflake className="w-5 h-5 mb-2 text-blue-500" />
                    <span className="text-sm font-medium">Refrigerator</span>
                    <span className="block text-xs text-gray-500">{unit.hasRef ? 'Available' : 'Not Included'}</span>
                  </div>
                  <div className={`p-4 rounded-lg border ${unit.hasHeater ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-50'}`}>
                    <Wind className="w-5 h-5 mb-2 text-orange-500" />
                    <span className="text-sm font-medium">Heater</span>
                    <span className="block text-xs text-gray-500">{unit.hasHeater ? 'Available' : 'Not Included'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 space-y-3">
                 <h3 className="font-bold text-yellow-900">Important Reminders</h3>
                 <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
                   <li>Check-in: 2:00 PM | Check-out: 12:00 PM</li>
                   <li>Quiet hours start at 10:00 PM</li>
                   <li>Clean as you go policy</li>
                   <li>Toiletries (towel, soap, shampoo) are NOT provided.</li>
                 </ul>
              </div>

              <Separator />

              <ReviewSection unitId={unit.id} reviews={unit.reviews} />

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}