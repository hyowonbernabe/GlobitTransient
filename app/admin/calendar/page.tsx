import prisma from '@/lib/prisma'
import { AdminCalendar } from '@/components/admin/AdminCalendar'

export const dynamic = 'force-dynamic'

async function getCalendarData() {
  const [bookings, units] = await Promise.all([
    prisma.booking.findMany({
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        unitId: true,
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

  // Flatten booking data for the component
  const formattedBookings = bookings.map(b => ({
    id: b.id,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    status: b.status,
    unitId: b.unitId,
    guestName: b.user.name
  }))

  return { bookings: formattedBookings, units }
}

export default async function CalendarPage() {
  const { bookings, units } = await getCalendarData()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
        <p className="text-gray-500">View occupancy and schedule.</p>
      </div>

      <AdminCalendar bookings={bookings} units={units} />
    </div>
  )
}