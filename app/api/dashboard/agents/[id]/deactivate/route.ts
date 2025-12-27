import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Deactivate by changing role to CLIENT
    await prisma.user.update({
        where: { id: params.id },
        data: { role: "CLIENT" },
    })

    return NextResponse.json({ success: true })
}
