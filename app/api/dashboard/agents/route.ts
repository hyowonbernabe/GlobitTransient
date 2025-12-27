import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

// GET all agents
export async function GET() {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agents = await prisma.user.findMany({
        where: {
            OR: [
                { role: "AGENT" },
                { agentCode: { not: null } }, // Include deactivated agents who have agent codes
            ],
        },
        select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            agentCode: true,
            commissionRate: true,
            role: true,
            createdAt: true,
            _count: { select: { commissions: true } },
            commissions: { select: { amount: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(agents)
}

// POST create new agent
export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, mobile, commissionRate } = await request.json()

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Generate unique agent code
    const agentCode = `AG${Date.now().toString().slice(-6)}`

    // Create agent with default password (they should change it)
    const defaultPassword = await hash("ChangeMe123!", 10)

    const agent = await prisma.user.create({
        data: {
            name,
            email,
            mobile,
            agentCode,
            commissionRate: commissionRate || 0.05,
            role: "AGENT",
            password: defaultPassword,
        },
    })

    return NextResponse.json({ success: true, agentCode: agent.agentCode })
}
