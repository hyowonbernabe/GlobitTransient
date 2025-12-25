'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notifyAdmins } from "@/server/actions/notification"

export async function submitPaymentProof(formData: FormData) {
  const bookingId = formData.get("bookingId") as string
  const referenceNumber = formData.get("referenceNumber") as string

  if (!bookingId || !referenceNumber) {
    return { error: "Missing required fields" }
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { unit: true, user: true }
    })

    if (!booking) return { error: "Booking not found" }

    const updatedNotes = booking.notes 
      ? `${booking.notes}\n[Payment Submitted] Ref: ${referenceNumber}`
      : `[Payment Submitted] Ref: ${referenceNumber}`

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        notes: updatedNotes,
      }
    })

    // TRIGGER NOTIFICATION
    await notifyAdmins(
      "Payment Received",
      `${booking.user.name} submitted proof for ${booking.unit.name}. Ref: ${referenceNumber}`,
      "/admin/bookings",
      "WARNING" // Use warning color to grab attention for action needed
    )

    revalidatePath(`/payment/${bookingId}`)
    return { success: true }

  } catch (error) {
    console.error("Payment Submission Error:", error)
    return { error: "Failed to submit payment. Please try again." }
  }
}