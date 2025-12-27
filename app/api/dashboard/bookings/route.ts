import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"

    const bookings = await prisma.booking.findMany({
        where: isAdmin ? {} : { agentId: session.user.id },
        include: {
            unit: { select: { name: true } },
            user: { select: { name: true, mobile: true } },
            agent: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    const formattedBookings = bookings.map((b) => ({
        id: b.id.slice(0, 8),
        fullId: b.id,
        paymongoRef: b.checkoutSessionId?.slice(0, 12) || "N/A",
        guestName: b.user.name || "Walk-in",
        guestPhone: b.user.mobile || "—",
        unitName: b.unit.name,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        pax: b.pax,
        hasCar: b.hasCar,
        hasPet: b.hasPet,
        hasPWD: b.hasPWD,
        totalPrice: b.totalPrice,
        downpayment: b.downpayment,
        balance: b.balance,
        paymentStatus: b.paymentStatus,
        status: b.status,
        agentName: b.agent?.name || "—",
        createdAt: b.createdAt,
    }))

    return NextResponse.json(formattedBookings)
}
