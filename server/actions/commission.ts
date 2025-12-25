'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/server/actions/notification"

export async function markCommissionPaid(commissionId: string) {
  try {
    const commission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID_OUT',
        paidAt: new Date()
      },
      include: {
        agent: true,
        booking: { include: { user: true } }
      }
    })

    // TRIGGER NOTIFICATION (To Agent)
    await createNotification(
      commission.agentId,
      "Commission Paid",
      `Your commission for ${commission.booking.user.name} has been paid out.`,
      "/portal/dashboard",
      "SUCCESS"
    )

    revalidatePath("/admin/claims")
    return { success: true }
  } catch (error) {
    console.error("Commission Payment Error:", error)
    return { error: "Failed to update commission status." }
  }
}

export async function rejectCommission(commissionId: string) {
  try {
    const commission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'REJECTED'
      },
      include: {
        agent: true,
        booking: { include: { user: true } }
      }
    })

    // TRIGGER NOTIFICATION (To Agent)
    await createNotification(
      commission.agentId,
      "Claim Rejected",
      `Your claim for ${commission.booking.user.name} was rejected by admin.`,
      "/portal/claims",
      "ERROR"
    )

    revalidatePath("/admin/claims")
    return { success: true }
  } catch (error) {
    console.error("Commission Rejection Error:", error)
    return { error: "Failed to reject commission." }
  }
}