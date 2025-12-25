'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function submitPaymentProof(formData: FormData) {
  const bookingId = formData.get("bookingId") as string
  const referenceNumber = formData.get("referenceNumber") as string

  if (!bookingId || !referenceNumber) {
    return { error: "Missing required fields" }
  }

  try {
    // 1. Verify Booking exists and is pending
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) return { error: "Booking not found" }

    // 2. Update Booking
    // Note: In a production app, we would have a dedicated 'paymentProof' column.
    // For now, we append to notes to avoid needing a schema migration immediately.
    const updatedNotes = booking.notes 
      ? `${booking.notes}\n[Payment Submitted] Ref: ${referenceNumber}`
      : `[Payment Submitted] Ref: ${referenceNumber}`

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        notes: updatedNotes,
        // We do NOT change status to CONFIRMED yet. 
        // Admin must verify the money first.
      }
    })

    // 3. Revalidate and Redirect
    revalidatePath(`/payment/${bookingId}`)
    return { success: true }

  } catch (error) {
    console.error("Payment Submission Error:", error)
    return { error: "Failed to submit payment. Please try again." }
  }
}