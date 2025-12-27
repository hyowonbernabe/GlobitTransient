import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"

    const commissions = await prisma.commission.findMany({
        where: isAdmin ? {} : { agentId: session.user.id },
        include: {
            agent: { select: { name: true } },
            booking: {
                select: {
                    id: true,
                    user: { select: { name: true } },
                    unit: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    const formattedCommissions = commissions.map((c) => ({
        id: c.id,
        agentName: c.agent.name || "Unknown",
        bookingId: c.booking.id.slice(0, 8),
        guestName: c.booking.user.name || "Walk-in",
        unitName: c.booking.unit.name,
        amount: c.amount,
        status: c.status,
        paidAt: c.paidAt,
        createdAt: c.createdAt,
    }))

    return NextResponse.json(formattedCommissions)
}
