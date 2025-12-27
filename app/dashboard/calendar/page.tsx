import { AdminCalendar } from "@/components/admin/AdminCalendar"
import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/admin/login")
    }

    // Fetch bookings for calendar
    const bookings = await prisma.booking.findMany({
        where: {
            status: { in: ["CONFIRMED", "COMPLETED", "PENDING"] },
        },
        select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
            user: { select: { name: true } },
            unitId: true,
        },
    })

    // Fetch units for filter
    const units = await prisma.unit.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    })

    const formattedBookings = bookings.map((b) => ({
        id: b.id,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
        guestName: b.user.name,
        unitId: b.unitId,
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-500">View confirmed bookings at a glance</p>
            </div>

            <AdminCalendar bookings={formattedBookings} units={units} />
        </div>
    )
}
