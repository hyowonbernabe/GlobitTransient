import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

// PATCH update snippet
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { category, title, content } = await request.json()

    const snippet = await prisma.knowledgeSnippet.update({
        where: { id: params.id },
        data: {
            category,
            title,
            content,
        },
    })

    return NextResponse.json(snippet)
}

// DELETE snippet
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.knowledgeSnippet.delete({
        where: { id: params.id },
    })

    return NextResponse.json({ success: true })
}
