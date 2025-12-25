'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function markCommissionPaid(commissionId: string) {
  try {
    await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID_OUT',
        paidAt: new Date()
      }
    })

    revalidatePath("/admin/claims")
    return { success: true }
  } catch (error) {
    console.error("Commission Payment Error:", error)
    return { error: "Failed to update commission status." }
  }
}

export async function rejectCommission(commissionId: string) {
  try {
    await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'REJECTED'
      }
    })

    revalidatePath("/admin/claims")
    return { success: true }
  } catch (error) {
    console.error("Commission Rejection Error:", error)
    return { error: "Failed to reject commission." }
  }
}