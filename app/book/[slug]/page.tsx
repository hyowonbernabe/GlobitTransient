import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { UnitGallery } from '@/components/booking/UnitGallery'
import { BookingForm } from '@/components/booking/BookingForm'
import { Users, Wind, Tv, Bath, Snowflake, Wifi, Info, ShieldCheck, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getUnit(slug: string) {
  const unit = await prisma.unit.findUnique({
    where: { slug },
  })
  return unit
}

// Check booking availability for blocked dates 
// (For Phase 1/2 we pass existing bookings. Implementation detail: we need to fetch them)
async function getBlockedDates(unitId: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      checkIn: { gte: new Date() } // Only future
    },
    select: { checkIn: true, checkOut: true }
  })

  return bookings.map(b => ({
    from: b.checkIn,
    to: b.checkOut
  }))
}

// Check parking availability (Global 1 slot)
async function getCarBlockedDates() {
  const bookings = await prisma.booking.findMany({
    where: {
      hasCar: true,
      status: { in: ['CONFIRMED', 'PENDING'] },
      checkIn: { gte: new Date() }
    },
    select: { checkIn: true, checkOut: true }
  })

  return bookings.map(b => ({
    from: b.checkIn,
    to: b.checkOut
  }))
}

export default async function UnitPage(props: PageProps) {
  const params = await props.params;
  const unit = await getUnit(params.slug)

  if (!unit) {
    return notFound()
  }

  const blockedDates = await getBlockedDates(unit.id)
  const carBlockedDates = await getCarBlockedDates()

  // Amenity Flags (Mapped from Config in future, currently DB columns)
  const amenities = [
    { label: "Wifi", icon: Wifi, available: true }, // Default true for modern units
    { label: "Own CR", icon: Bath, available: unit.hasOwnCR },
    { label: "TV", icon: Tv, available: unit.hasTV },
    { label: "Ref", icon: Snowflake, available: unit.hasRef },
    { label: "Heater", icon: Wind, available: unit.hasHeater },
  ].filter(a => a.available)


  const breadcrumbs = [
    { label: "Book", href: "/book" },
    { label: unit.name, href: "#" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-24 lg:pb-20 pt-4 lg:pt-8">
        <div className="container mx-auto px-4 lg:max-w-7xl">

          {/* Layout Wrapper: Mobile Flex Col (Ordered), Desktop Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* 1. Breadcrumbs (Mobile: Order 1, Desktop: Top) */}
            <div className="order-1 w-full lg:col-span-12 lg:order-none lg:mb-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>

            {/* 2. Main Hero Image (Mobile: Order 2, Desktop: Left Col) */}
            <div className="order-2 w-full lg:col-span-8 lg:order-none">
              {/* Render ONLY the Hero Image (First item) */}
              <UnitGallery images={[unit.images[0]]} unitName={unit.name} showMainImage={true} />
            </div>

            {/* 3. Booking Form (Mobile: Order 3, Desktop: Right Sticky Col) */}
            {/* Note: On Desktop, this needs to be in col-span-4. CSS Grid placement handles it. 
                On Mobile, `order-3` places it right after the Hero. */}
            <div className="order-3 w-full lg:col-span-4 lg:row-span-3 lg:col-start-9 lg:row-start-2 lg:sticky lg:top-24 lg:order-none z-10">
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
                carBlockedDates={carBlockedDates}
              />

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 grayscale opacity-70 mt-4">
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Booking</div>
                <div>•</div>
                <div>Instant Confirmation</div>
              </div>
            </div>

            {/* 4. Gallery Grid (Mobile: Order 4, Desktop: Left Col below Hero) */}
            <div className="order-4 w-full lg:col-span-8 lg:order-none -mt-4 lg:mt-0">
              {/* Render ONLY the Grid (Main Image Hidden) */}
              <UnitGallery images={unit.images} unitName={unit.name} showMainImage={false} />
            </div>

            {/* 5. Amenities & Details (Mobile: Order 5, Desktop: Left Col below Grid) */}
            <div className="order-5 w-full lg:col-span-8 lg:order-none space-y-8">

              {/* Header Info (Hidden on mobile if redundant? keeping for context) */}
              <div className="space-y-4">
                <h1 className="text-2xl md:text-4xl font-bold text-emerald-950 tracking-tight leading-tight">{unit.name}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="px-3 py-1 border-emerald-200 bg-emerald-50 text-emerald-800 gap-1.5 rounded-full">
                    <Users className="w-3 h-3" />
                    Good to {unit.basePax} - {unit.maxPax} Pax
                  </Badge>
                  {unit.hasOwnCR ? (
                    <Badge variant="outline" className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-800 gap-1.5 rounded-full">
                      <Bath className="w-3 h-3" /> Own CR
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1 text-gray-500 rounded-full">Common CR</Badge>
                  )}
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-600" /> Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {amenities.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center gap-2">
                      <item.icon className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders (Mobile Order 6 implies this should be later? 
                  Plan says: 5. Amenities, 6. Reminders. 
                  We are in 'order-5' block, we can stack them here.) */}

              {/* House Rules / Reminders */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-4">
                <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                  <Info className="w-5 h-5" /> Important Reminders
                </h3>
                <ul className="text-sm text-amber-900/80 space-y-2 list-disc list-inside marker:text-amber-600">
                  <li>Check-in: 2:00 PM | Check-out: 12:00 PM</li>
                  <li>Clean as you go policy is strictly implemented.</li>
                  <li>Toiletries (towel, soap, shampoo) are NOT provided.</li>
                  <li>Quiet hours start at 10:00 PM.</li>
                </ul>
              </div>

              {/* Description (Last item per plan) */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">About this Unit</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {unit.description}
                </p>
              </div>

              {/* Quick Contact Section */}
              <div className="mt-8 pt-8 border-t border-gray-100 w-full text-center space-y-4">
                <p className="text-sm text-gray-600 font-medium">Have questions, special requests, or planning a long-term stay?</p>
                <div className="flex flex-col items-center gap-2">
                  <a href="tel:09196813924" className="inline-flex items-center gap-2 text-base font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 hover:border-emerald-200 hover:shadow-sm">
                    <Phone className="w-5 h-5" />
                    Call: 0919 681 3924
                  </a>
                  <p className="text-xs text-gray-400">Usually active from 12 PM to 4 AM</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
