import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

// PATCH update unit
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, capacity, pricePerNight, images } = await request.json()

    const unit = await prisma.unit.update({
        where: { id: params.id },
        data: {
            name,
            description,
            capacity,
            pricePerNight: pricePerNight * 100, // Convert to cents
            images,
        },
    })

    return NextResponse.json(unit)
}

// DELETE unit
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check for associated bookings
    const bookingCount = await prisma.booking.count({
        where: { unitId: params.id },
    })

    if (bookingCount > 0) {
        return NextResponse.json(
            { error: `Cannot delete unit with ${bookingCount} booking(s)` },
            { status: 400 }
        )
    }

    await prisma.unit.delete({
        where: { id: params.id },
    })

    return NextResponse.json({ success: true })
}
