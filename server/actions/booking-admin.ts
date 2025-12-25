'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function approveBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) return { error: "Booking not found" }

    // When approving, we assume the 50% downpayment is verified
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PARTIAL', // Marks that DP is received
        // Optionally, we could create a Commission record here if an agent is attached
        // but typically commissions are created/calculated when the booking is completed.
      }
    })

    // If an agent was attached, ensure the commission record exists or is pending
    if (booking.agentId) {
        // Logic to create commission record if not exists could go here
        // For now, we assume the initial booking creation handled the commission setup logic
        // or we handle it on "checkout/complete".
    }

    revalidatePath("/admin/bookings")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/calendar")
    return { success: true }
  } catch (error) {
    console.error("Booking Approval Error:", error)
    return { error: "Failed to approve booking." }
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED'
      }
    })

    revalidatePath("/admin/bookings")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/calendar")
    return { success: true }
  } catch (error) {
    console.error("Booking Cancellation Error:", error)
    return { error: "Failed to cancel booking." }
  }
}