'use server'

import prisma from "@/lib/prisma"
import { z } from "zod"

const trackSchema = z.object({
  bookingId: z.string().min(5, "Please enter a valid Booking ID"),
})

export async function trackBooking(formData: FormData) {
  const bookingId = formData.get("bookingId") as string

  const result = trackSchema.safeParse({ bookingId })
  if (!result.success) {
    return { error: "Invalid Booking ID format." }
  }

  try {
    // We strictly select only necessary fields for privacy
    // Users with just an ID shouldn't see sensitive info like internal notes
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        downpayment: true,
        balance: true,
        adults: true,
        kids: true,
        unit: {
          select: {
            name: true,
            images: true,
            slug: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })

    if (!booking) {
      return { error: "Booking not found. Please check your ID and try again." }
    }

    return { success: true, booking }

  } catch (error) {
    console.error("Track Error:", error)
    return { error: "An unexpected error occurred." }
  }
}