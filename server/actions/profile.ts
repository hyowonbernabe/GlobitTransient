'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"
import { passwordSchema } from "@/lib/validations/profile"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updatePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const rawData = Object.fromEntries(formData.entries())
  const validated = passwordSchema.safeParse(rawData)

  if (!validated.success) {
    return { error: "Invalid input data." }
  }

  const { currentPassword, newPassword } = validated.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.password) {
      return { error: "User not found." }
    }

    // Verify old password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return { error: "Incorrect current password." }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error("Password Update Error:", error)
    return { error: "Failed to update password." }
  }
}

export async function updateSystemPreferences(formData: FormData) {
  // Placeholder for future system-wide settings (e.g., default commission rate)
  // Currently, these might be stored in env vars or a separate Settings table.
  // For now, we'll just simulate a success.
  return { success: true }
}