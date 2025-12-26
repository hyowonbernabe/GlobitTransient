import prisma from '@/lib/prisma'
import { AdminCalendar } from '@/components/admin/AdminCalendar'
import { ManualBookingDialog } from '@/components/admin/ManualBookingDialog'

export const dynamic = 'force-dynamic'

// Define interface to fix implicit 'any' error during build
interface CalendarBooking {
  id: string
  checkIn: Date
  checkOut: Date
  status: string
  unitId: string
  notes: string | null
  user: {
    name: string | null
  }
}

async function getCalendarData() {
  const [bookingsRaw, units] = await Promise.all([
    prisma.booking.findMany({
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        unitId: true,
        notes: true,
        user: {
          select: { name: true }
        }
      }
    }),
    prisma.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  // Explicitly cast to avoid 'any' type errors
  const bookings = bookingsRaw as unknown as CalendarBooking[]

  // Flatten booking data
  const formattedBookings = bookings.map((b) => {
    // If it's a manual booking, try to find name in notes
    const manualNameMatch = b.notes?.match(/Manual Booking: (.*?)(\n|$)/)
    const displayName = manualNameMatch ? manualNameMatch[1] : b.user.name

    return {
        id: b.id,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
        unitId: b.unitId,
        guestName: displayName
    }
  })

  return { bookings: formattedBookings, units }
}

export default async function AgentCalendarPage() {
  const { bookings, units } = await getCalendarData()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>
          <p className="text-gray-500">Check dates or block a unit for a walk-in guest.</p>
        </div>
        <ManualBookingDialog units={units} />
      </div>

      <AdminCalendar bookings={bookings} units={units} />
    </div>
  )
}