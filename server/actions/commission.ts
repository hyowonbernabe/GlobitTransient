'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/server/actions/notification"
import { auth } from "@/server/auth"
import { logActivity } from "@/server/actions/audit"

export async function markCommissionPaid(commissionId: string) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

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

    // NOTIFY AGENT
    await createNotification(
      commission.agentId,
      "Commission Paid",
      `Your commission for ${commission.booking.user.name} has been paid out.`,
      "/portal/dashboard",
      "SUCCESS"
    )

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "PAY_COMMISSION",
      "COMMISSION",
      commissionId,
      `Paid out ${(commission.amount / 100).toFixed(2)} to ${commission.agent.name}`
    )

    revalidatePath("/admin/claims")
    return { success: true }
  } catch (error) {
    console.error("Commission Payment Error:", error)
    return { error: "Failed to update commission status." }
  }
}

export async function rejectCommission(commissionId: string) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

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

    // NOTIFY AGENT
    await createNotification(
      commission.agentId,
      "Claim Rejected",
      `Your claim for ${commission.booking.user.name} was rejected by admin.`,
      "/portal/claims",
      "ERROR"
    )

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "REJECT_COMMISSION",
      "COMMISSION",
      commissionId,
      `Rejected claim from ${commission.agent.name}`
    )

    revalidatePath("/admin/claims")
    return { success: true }
  } catch (error) {
    console.error("Commission Rejection Error:", error)
    return { error: "Failed to reject commission." }
  }
}