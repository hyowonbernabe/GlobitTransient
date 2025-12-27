import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.review.delete({
        where: { id: params.id },
    })

    return NextResponse.json({ success: true })
}
