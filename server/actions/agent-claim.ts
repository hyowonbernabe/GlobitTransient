'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import { notifyAdmins } from '@/server/actions/notification'
import { z } from 'zod'

// Schema for searching
const searchSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  bookingRef: z.string().optional(),
})

export async function searchBookings(formData: FormData) {
  const guestName = formData.get("guestName") as string
  
  if (!guestName || guestName.length < 2) {
    return { error: "Please enter a valid guest name." }
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: null, 
        user: {
          name: { contains: guestName, mode: 'insensitive' }
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        }
      },
      take: 5,
      include: {
        unit: { select: { name: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, bookings }
  } catch (error) {
    console.error("Search Error:", error)
    return { error: "Failed to search bookings." }
  }
}

export async function submitClaim(bookingId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    })

    if (!booking) return { error: "Booking not found." }
    if (booking.agentId) return { error: "This booking is already claimed." }

    const agent = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!agent) return { error: "Agent profile error." }

    const commissionAmount = Math.round(booking.totalPrice * agent.commissionRate)

    await prisma.commission.create({
      data: {
        amount: commissionAmount,
        status: 'PENDING',
        bookingId: booking.id,
        agentId: session.user.id
      }
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: { agentId: session.user.id }
    })

    // TRIGGER NOTIFICATION
    await notifyAdmins(
      "Commission Claim",
      `${agent.name} claimed booking for ${booking.user.name}. Review needed.`,
      "/admin/claims",
      "INFO"
    )

    revalidatePath("/portal/claims")
    revalidatePath("/portal/bookings")
    return { success: true }

  } catch (error) {
    console.error("Claim Error:", error)
    return { error: "Failed to submit claim." }
  }
}