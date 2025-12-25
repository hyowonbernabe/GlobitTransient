'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema for searching
const searchSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  bookingRef: z.string().optional(), // Could be part of the ID or mobile
})

export async function searchBookings(formData: FormData) {
  const guestName = formData.get("guestName") as string
  
  if (!guestName || guestName.length < 2) {
    return { error: "Please enter a valid guest name." }
  }

  try {
    // Find bookings that:
    // 1. Match the guest name (partial)
    // 2. Do NOT have an agent attached yet
    // 3. Are relatively recent (created in last 30 days)
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: null, // Critical: Only orphan bookings
        user: {
          name: { contains: guestName, mode: 'insensitive' }
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
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
      where: { id: bookingId }
    })

    if (!booking) return { error: "Booking not found." }
    if (booking.agentId) return { error: "This booking is already claimed." }

    // 1. Calculate potential commission (e.g., 5% of total price)
    // We fetch the agent's rate first
    const agent = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!agent) return { error: "Agent profile error." }

    const commissionAmount = Math.round(booking.totalPrice * agent.commissionRate)

    // 2. Create Commission Record (Status: PENDING)
    await prisma.commission.create({
      data: {
        amount: commissionAmount,
        status: 'PENDING',
        bookingId: booking.id,
        agentId: session.user.id
      }
    })

    // 3. Link Booking to Agent immediately? 
    // Usually, we wait for Admin approval. But to prevent double claims, we can link it now.
    // Or, cleaner: We rely on the Commission 'PENDING' status. 
    // If we link it now, it shows up in "My Bookings" immediately. 
    // Let's link it now for simpler logic, Admin can revert if rejected.
    await prisma.booking.update({
      where: { id: bookingId },
      data: { agentId: session.user.id }
    })

    revalidatePath("/portal/claims")
    revalidatePath("/portal/bookings")
    return { success: true }

  } catch (error) {
    console.error("Claim Error:", error)
    return { error: "Failed to submit claim." }
  }
}