'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"

export async function approveBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) return { error: "Booking not found" }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PARTIAL', 
      }
    })

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
  
  // Parse amount (expecting standard float string, convert to centavos)
  const amount = amountStr ? Math.round(parseFloat(amountStr) * 100) : 0

  try {
    // 1. Check Availability
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

    // 2. Resolve User (Walk-In placeholder)
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

    // 3. Create Booking
    await prisma.booking.create({
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
            paymentStatus: amount > 0 ? 'FULL' : 'UNPAID', // Assume manual entry implies settlement or cash
            notes: `Manual Booking: ${guestName}\n${notes}`
        }
    })

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
    // 1. Check Availability
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

    // 2. Resolve User (Maintenance placeholder)
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

    // 3. Create Block (Booking with 0 price)
    await prisma.booking.create({
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

    revalidatePath("/admin/calendar")
    revalidatePath("/portal/calendar")
    return { success: true }

  } catch (error) {
    console.error("Block Dates Error:", error)
    return { error: "Failed to block dates." }
  }
}