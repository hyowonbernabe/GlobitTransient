import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"

// GET all knowledge snippets
export async function GET() {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const snippets = await prisma.knowledgeSnippet.findMany({
        orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(snippets)
}

// POST create snippet
export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { category, title, content } = await request.json()

    const snippet = await prisma.knowledgeSnippet.create({
        data: {
            category,
            title,
            content,
            isActive: true,
        },
    })

    return NextResponse.json(snippet)
}
