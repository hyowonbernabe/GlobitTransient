'use server'

import prisma from "@/lib/prisma"
import { agentSchema } from "@/lib/validations/agent"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createAgent(formData: FormData) {
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
    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { error: "Email already registered." }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: hashedPassword,
        role: 'AGENT',
        commissionRate: data.commissionRate / 100, // Convert percentage to decimal (e.g., 5 -> 0.05)
        agentCode: data.agentCode || `AGT-${Math.floor(Math.random() * 10000)}`
      }
    })

    revalidatePath("/admin/agents")
    return { success: true }
  } catch (error) {
    console.error("Create Agent Error:", error)
    return { error: "Failed to create agent." }
  }
}

export async function deleteAgent(agentId: string) {
  try {
    // Verify it's actually an agent before deleting to prevent accidents
    const agent = await prisma.user.findUnique({
      where: { id: agentId }
    })

    if (agent?.role !== 'AGENT') {
        return { error: "Cannot delete non-agent users via this action." }
    }

    await prisma.user.delete({
      where: { id: agentId }
    })
    
    revalidatePath("/admin/agents")
    return { success: true }
  } catch (error) {
    console.error("Delete Agent Error:", error)
    return { error: "Failed to delete agent." }
  }
}