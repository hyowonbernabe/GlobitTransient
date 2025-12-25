'use server'

import prisma from "@/lib/prisma"
import { createBookingSchema } from "@/lib/validations/booking"
import { calculateBookingPrice } from "@/lib/pricing"
import { z } from "zod"

export async function createBooking(data: z.infer<typeof createBookingSchema>) {
  // 1. Validate Input
  const result = createBookingSchema.safeParse(data)
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }

  const { unitId, checkIn, checkOut, guestName, guestMobile, guestEmail, ...rest } = result.data

  try {
    // 2. Availability Check (Server Side)
    // Check if unit is booked (CONFIRMED or PENDING)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        unitId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          { 
            // Check for overlap
            checkIn: { lte: checkOut }, 
            checkOut: { gte: checkIn } 
          }
        ]
      }
    })

    if (conflictingBooking) {
      return { error: "Sorry, these dates are no longer available." }
    }

    // 3. Global Car Policy Check
    if (rest.hasCar) {
      const carBooking = await prisma.booking.findFirst({
        where: {
          hasCar: true,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            { checkIn: { lte: checkOut }, checkOut: { gte: checkIn } }
          ]
        }
      })

      if (carBooking) {
        return { error: "Parking slot is already reserved for these dates." }
      }
    }

    // 4. Fetch Unit for Pricing
    const unit = await prisma.unit.findUnique({ where: { id: unitId } })
    if (!unit) return { error: "Unit not found." }

    // 5. Recalculate Price (Security)
    const pricing = calculateBookingPrice({
      basePrice: unit.basePrice,
      basePax: unit.basePax,
      extraPaxPrice: unit.extraPaxPrice,
      checkIn,
      checkOut,
      adults: rest.adults,
      kids: rest.kids,
      hasPWD: rest.hasPWD
    })

    // 6. User Resolution (Implicit Auth)
    // Find existing user by Mobile (primary) or Email, otherwise create
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: guestMobile },
          { email: guestEmail || undefined } // Only search email if provided
        ]
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: guestName,
          mobile: guestMobile,
          email: guestEmail || null,
          role: 'CLIENT'
        }
      })
    }

    // 7. Create Booking
    const booking = await prisma.booking.create({
      data: {
        unitId,
        userId: user.id,
        checkIn,
        checkOut,
        adults: rest.adults,
        kids: rest.kids,
        toddlers: rest.toddlers,
        hasCar: rest.hasCar,
        hasPet: rest.hasPet,
        hasPWD: rest.hasPWD,
        totalPrice: pricing.totalPrice,
        downpayment: pricing.downPayment,
        balance: pricing.totalPrice - pricing.downPayment,
        status: 'PENDING',
        paymentStatus: 'UNPAID'
      }
    })

    return { success: true, bookingId: booking.id }

  } catch (error) {
    console.error("Booking Error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}