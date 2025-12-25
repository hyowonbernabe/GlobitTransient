'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { sendBookingConfirmation } from "@/server/actions/email"
import { logActivity } from "@/server/actions/audit"

export async function approveBooking(bookingId: string) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        unit: true
      }
    })

    if (!booking) return { error: "Booking not found" }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PARTIAL', 
      }
    })

    // Send Email Notification
    if (booking.user.email) {
      await sendBookingConfirmation({
        bookingId: booking.id,
        guestName: booking.user.name || 'Guest',
        guestEmail: booking.user.email,
        unitName: booking.unit.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice,
        balance: booking.balance
      })
    }

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "APPROVE_BOOKING",
      "BOOKING",
      bookingId,
      `Approved booking for ${booking.user.name} in ${booking.unit.name}`
    )

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
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED'
      }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "CANCEL_BOOKING",
      "BOOKING",
      bookingId,
      "Cancelled booking reservation"
    )

    revalidatePath("/admin/bookings")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/calendar")
    return { success: true }
  } catch (error) {
    console.error("Booking Cancellation Error:", error)
    return { error: "Failed to cancel booking." }
  }
}

export async function createManualBooking(formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'AGENT') {
    return { error: "Unauthorized" }
  }

  const unitId = formData.get('unitId') as string
  const checkIn = new Date(formData.get('checkIn') as string)
  const checkOut = new Date(formData.get('checkOut') as string)
  const guestName = formData.get('guestName') as string
  const notes = formData.get('notes') as string
  const amountStr = formData.get('amount') as string
  
  const amount = amountStr ? Math.round(parseFloat(amountStr) * 100) : 0

  try {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        unitId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          { checkIn: { lte: checkOut }, checkOut: { gte: checkIn } }
        ]
      }
    })

    if (conflictingBooking) {
      return { error: "Dates are already booked for this unit." }
    }

    let user = await prisma.user.findFirst({
        where: { email: 'walkin@globit.com' }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Walk-In Guest',
                email: 'walkin@globit.com',
                role: 'CLIENT',
                mobile: '0000000000'
            }
        })
    }

    const booking = await prisma.booking.create({
        data: {
            unitId,
            userId: user.id,
            checkIn,
            checkOut,
            adults: 1, 
            kids: 0,
            toddlers: 0,
            totalPrice: amount,
            downpayment: 0, 
            balance: amount, 
            status: 'CONFIRMED', 
            paymentStatus: amount > 0 ? 'FULL' : 'UNPAID',
            notes: `Manual Booking: ${guestName}\n${notes}`
        }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "MANUAL_BOOKING",
      "BOOKING",
      booking.id,
      `Manual booking created for ${guestName} (${amount / 100} PHP)`
    )

    revalidatePath("/admin/calendar")
    revalidatePath("/portal/calendar")
    return { success: true }

  } catch (error) {
    console.error("Manual Booking Error:", error)
    return { error: "Failed to create manual booking." }
  }
}

export async function blockUnitDates(formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'AGENT') {
    return { error: "Unauthorized" }
  }

  const unitId = formData.get('unitId') as string
  const checkIn = new Date(formData.get('checkIn') as string)
  const checkOut = new Date(formData.get('checkOut') as string)
  const reason = formData.get('reason') as string || 'Maintenance'
  const notes = formData.get('notes') as string

  try {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        unitId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          { checkIn: { lte: checkOut }, checkOut: { gte: checkIn } }
        ]
      }
    })

    if (conflictingBooking) {
      return { error: "Dates are already booked/blocked for this unit." }
    }

    let user = await prisma.user.findFirst({
        where: { email: 'maintenance@globit.com' }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'System Maintenance',
                email: 'maintenance@globit.com',
                role: 'ADMIN',
                mobile: '0000000000'
            }
        })
    }

    const booking = await prisma.booking.create({
        data: {
            unitId,
            userId: user.id,
            checkIn,
            checkOut,
            adults: 0,
            kids: 0,
            toddlers: 0,
            totalPrice: 0,
            downpayment: 0,
            balance: 0,
            status: 'CONFIRMED',
            paymentStatus: 'FULL',
            notes: `Blocked: ${reason}\n${notes}`
        }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "BLOCK_DATES",
      "UNIT",
      unitId,
      `Blocked dates for ${reason}`
    )

    revalidatePath("/admin/calendar")
    revalidatePath("/portal/calendar")
    return { success: true }

  } catch (error) {
    console.error("Block Dates Error:", error)
    return { error: "Failed to block dates." }
  }
}