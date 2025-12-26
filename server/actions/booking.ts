'use server'

import prisma from "@/lib/prisma"
import { createBookingSchema } from "@/lib/validations/booking"
import { calculateBookingPrice } from "@/lib/pricing"
import { notifyAdmins } from "@/server/actions/notification"
import { z } from "zod"
import { cookies } from "next/headers"

export async function createBooking(data: z.infer<typeof createBookingSchema>) {
  const result = createBookingSchema.safeParse(data)
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }

  const { unitId, checkIn, checkOut, guestName, guestMobile, guestEmail, ...rest } = result.data

  try {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        unitId,
        status: { in: ['CONFIRMED'] },
        OR: [
          { checkIn: { lte: checkOut }, checkOut: { gte: checkIn } }
        ]
      }
    })

    if (conflictingBooking) {
      return { error: "Sorry, these dates are already taken." }
    }

    if (rest.hasCar) {
      const carBooking = await prisma.booking.findFirst({
        where: {
          hasCar: true,
          status: { in: ['CONFIRMED'] },
          OR: [
            { checkIn: { lte: checkOut }, checkOut: { gte: checkIn } }
          ]
        }
      })

      if (carBooking) {
        return { error: "The parking slot is already confirmed for these dates." }
      }
    }

    const unit = await prisma.unit.findUnique({ where: { id: unitId } })
    if (!unit) return { error: "Unit not found." }

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

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: guestMobile },
          { email: guestEmail || undefined } 
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

    // === AGENT ATTRIBUTION LOGIC ===
    let agentId = null;
    const cookieStore = await cookies(); // Fix: await cookies() in Next.js 15
    const agentCode = cookieStore.get('globit_agent_ref')?.value;

    if (agentCode) {
      const agent = await prisma.user.findUnique({
        where: { agentCode }
      });
      if (agent && agent.role === 'AGENT') {
        agentId = agent.id;
      }
    }

    const booking = await prisma.booking.create({
      data: {
        unitId,
        userId: user.id,
        agentId, // Attach Agent here
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

    await notifyAdmins(
      "New Reservation Request",
      `${guestName} requested ${unit.name}. Payment pending.`,
      "/admin/bookings",
      "INFO"
    )

    return { success: true, bookingId: booking.id }

  } catch (error) {
    console.error("Booking Error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}