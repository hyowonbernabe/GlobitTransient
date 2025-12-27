import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

// PATCH update agent
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, mobile, commissionRate } = await request.json()

    await prisma.user.update({
        where: { id: params.id },
        data: {
            name,
            mobile,
            commissionRate,
        },
    })

    return NextResponse.json({ success: true })
}
