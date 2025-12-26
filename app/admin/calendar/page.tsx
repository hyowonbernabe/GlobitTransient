import prisma from '@/lib/prisma'
import { AdminCalendar } from '@/components/admin/AdminCalendar'
import { ManualBookingDialog } from '@/components/admin/ManualBookingDialog'

export const dynamic = 'force-dynamic'

interface CalendarBookingData {
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
        notes: true, // Fetch notes to check for Manual Booking name
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

  // Explicitly cast to avoid 'any' type errors during build
  const bookings = bookingsRaw as unknown as CalendarBookingData[]

  // Flatten booking data for the component
  const formattedBookings = bookings.map((b) => {
    // If it's a manual booking, the real name might be in notes
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

export default async function CalendarPage() {
  const { bookings, units } = await getCalendarData()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-500">View occupancy and manage schedule.</p>
        </div>
        <ManualBookingDialog units={units} />
      </div>

      <AdminCalendar bookings={bookings} units={units} />
    </div>
  )
}