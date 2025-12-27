import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logs = await prisma.auditLog.findMany({
        include: {
            user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 500, // Limit to latest 500 logs
    })

    return NextResponse.json(logs)
}
