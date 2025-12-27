'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"

export async function getOperationalBookings(dateStr: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const targetDate = new Date(dateStr)
    const start = new Date(targetDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(targetDate)
    end.setHours(23, 59, 59, 999)

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                OR: [
                    { checkIn: { gte: start, lte: end } },
                    { checkOut: { gte: start, lte: end } }
                ]
            },
            include: {
                unit: true,
                user: true,
                agent: { select: { name: true, agentCode: true } }
            },
            orderBy: {
                checkIn: 'asc'
            }
        })

        // Filter by exact date on server side to be safe
        const checkingIn = bookings.filter(b =>
            b.checkIn.toLocaleDateString() === targetDate.toLocaleDateString()
        )

        const checkingOut = bookings.filter(b =>
            b.checkOut.toLocaleDateString() === targetDate.toLocaleDateString()
        )

        // Return plain objects
        return {
            data: {
                checkingIn: JSON.parse(JSON.stringify(checkingIn)),
                checkingOut: JSON.parse(JSON.stringify(checkingOut))
            }
        }
    } catch (error) {
        console.error("Operations Fetch Error:", error)
        return { error: "Failed to fetch operational data." }
    }
}
