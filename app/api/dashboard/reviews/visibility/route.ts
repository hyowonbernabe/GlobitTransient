import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reviewId, isVisible } = await request.json()

    await prisma.review.update({
        where: { id: reviewId },
        data: { isVisible },
    })

    return NextResponse.json({ success: true })
}
