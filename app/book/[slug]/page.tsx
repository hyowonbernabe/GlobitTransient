import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UnitGallery } from '@/components/booking/UnitGallery'
import { BookingForm } from '@/components/booking/BookingForm'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { Users, Wind, Tv, Bath, Snowflake, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import { ParallaxHero } from '@/components/booking/ParallaxHero'

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

  const heroImage = unit.slug === 'big-house' ? '/assets/images/baguio_midground.png' : unit.slug === 'veranda-unit' ? '/assets/images/baguio_background_fog.png' : (unit.images[0] || '/assets/images/placeholder.png')

  return (
    <div className="min-h-screen bg-[#fcfdfc] font-sans text-emerald-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <ParallaxHero
          unitId={unit.id}
          unitName={unit.name}
          image={heroImage}
        >
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-16 items-start pt-12">

            <div className="w-full lg:col-span-2 space-y-16">
              <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="px-5 py-2 rounded-full border-emerald-100 bg-emerald-50 text-emerald-800 font-black text-xs uppercase tracking-widest">
                    <Users className="w-4 h-4 mr-2" />
                    Up to {unit.maxPax} Guests
                  </Badge>
                  {unit.hasOwnCR && (
                    <Badge variant="outline" className="px-5 py-2 rounded-full border-blue-100 bg-blue-50 text-blue-800 font-black text-xs uppercase tracking-widest">
                      <Bath className="w-4 h-4 mr-2" />
                      Private Bathroom
                    </Badge>
                  )}
                </div>

                <div className="prose prose-emerald max-w-none">
                  <h2 className="text-3xl font-black tracking-tight text-emerald-950 mb-6 text-center lg:text-left">Experience the Space</h2>
                  <p className="text-xl text-gray-500 font-medium leading-[1.8] whitespace-pre-wrap">
                    {unit.description}
                  </p>
                </div>
              </div>

              <UnitGallery images={unit.images} unitName={unit.name} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${unit.hasTV ? 'bg-white border-emerald-50 shadow-xl shadow-emerald-900/5' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                  <Tv className="w-8 h-8 mb-4 text-emerald-950" />
                  <p className="font-black text-xl text-emerald-950 uppercase tracking-tighter">Entertainment</p>
                  <p className="text-gray-500 font-bold">{unit.hasTV ? 'Smart TV Available' : 'No TV included'}</p>
                </div>
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${unit.hasRef ? 'bg-white border-emerald-50 shadow-xl shadow-emerald-900/5' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                  <Snowflake className="w-8 h-8 mb-4 text-emerald-950" />
                  <p className="font-black text-xl text-emerald-950 uppercase tracking-tighter">Kitchenette</p>
                  <p className="text-gray-500 font-bold">{unit.hasRef ? 'Refrigerator Included' : 'No Ref included'}</p>
                </div>
              </div>

              <div className="bg-amber-50 p-10 rounded-[3rem] border-2 border-amber-100/50 space-y-6">
                <h3 className="text-2xl font-black text-amber-950 tracking-tighter flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  Essential Guest Guide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-amber-900/60 font-black text-[10px] uppercase tracking-widest">Timings</p>
                    <p className="text-amber-950 font-bold text-lg">Check-in: 2PM • Check-out: 12PM</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-amber-900/60 font-black text-[10px] uppercase tracking-widest">Quiet Hours</p>
                    <p className="text-amber-950 font-bold text-lg">Starts at 10PM nightly</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-amber-200/50">
                  <p className="text-sm font-medium text-amber-900/60 flex items-start gap-3">
                    <span className="shrink-0 block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    Guest Note: Personal toiletries (towels, soap) are not provided. Please plan accordingly for your stay.
                  </p>
                </div>
              </div>

              <Separator className="bg-emerald-50" />

              <ReviewSection unitId={unit.id} reviews={unit.reviews} />
            </div>

            <div className="w-full lg:sticky lg:top-32">
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

          </div>
        </ParallaxHero>
      </main>

      <Footer />
    </div>
  )
}