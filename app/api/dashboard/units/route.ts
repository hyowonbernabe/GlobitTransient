import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

// GET all units
export async function GET() {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const units = await prisma.unit.findMany({
        include: {
            _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(units)
}

// POST create unit
export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, capacity, pricePerNight, images } = await request.json()

    const unit = await prisma.unit.create({
        data: {
            name,
            description,
            capacity,
            pricePerNight: pricePerNight * 100, // Convert to cents
            images: images || [],
            isActive: true,
        },
    })

    return NextResponse.json(unit)
}
