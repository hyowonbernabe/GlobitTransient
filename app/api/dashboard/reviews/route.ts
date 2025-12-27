import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"

    // Admins see all reviews, agents/users see only visible ones
    const reviews = await prisma.review.findMany({
        where: isAdmin ? {} : { isVisible: true },
        include: {
            user: { select: { name: true } },
            unit: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
}
