'use server'

import prisma from "@/lib/prisma"
import { agentSchema } from "@/lib/validations/agent"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { auth } from "@/server/auth"
import { logActivity } from "@/server/actions/audit"

export async function createAgent(formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    password: formData.get("password"),
    commissionRate: formData.get("commissionRate"),
    agentCode: formData.get("agentCode"),
  }

  const result = agentSchema.safeParse(rawData)

  if (!result.success) {
    return { error: "Validation failed. Please check your inputs." }
  }

  const data = result.data

  if (!data.password) {
    return { error: "Password is required for new agents." }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { error: "Email already registered." }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const agent = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: hashedPassword,
        role: 'AGENT',
        commissionRate: data.commissionRate / 100, 
        agentCode: data.agentCode || `AGT-${Math.floor(Math.random() * 10000)}`
      }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "CREATE_AGENT",
      "USER",
      agent.id,
      `Created agent account: ${data.name}`
    )

    revalidatePath("/admin/agents")
    return { success: true }
  } catch (error) {
    console.error("Create Agent Error:", error)
    return { error: "Failed to create agent." }
  }
}

export async function deleteAgent(agentId: string) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    const agent = await prisma.user.findUnique({
      where: { id: agentId }
    })

    if (agent?.role !== 'AGENT') {
        return { error: "Cannot delete non-agent users via this action." }
    }

    await prisma.user.delete({
      where: { id: agentId }
    })
    
    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "DELETE_AGENT",
      "USER",
      agentId,
      `Deleted agent account: ${agent.name}`
    )

    revalidatePath("/admin/agents")
    return { success: true }
  } catch (error) {
    console.error("Delete Agent Error:", error)
    return { error: "Failed to delete agent." }
  }
}