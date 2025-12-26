'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { confirmBooking } from "@/lib/booking-service"

const getAuthHeader = () => {
  const apiKey = process.env.PAYMONGO_SECRET_KEY
  if (!apiKey) throw new Error("PAYMONGO_SECRET_KEY is missing")
  return `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
}

export async function initiateCheckout(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { unit: true, user: true }
    })

    if (!booking) return { error: "Booking not found." }

    // Race Condition Check
    const conflict = await prisma.booking.findFirst({
      where: {
        unitId: booking.unitId,
        status: 'CONFIRMED',
        id: { not: bookingId },
        OR: [
          { checkIn: { lte: booking.checkOut }, checkOut: { gte: booking.checkIn } }
        ]
      }
    })

    if (conflict) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      })
      return { error: "Slot taken by another user." }
    }

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000"
    
    const validImages = booking.unit.images.filter(img => img.startsWith('http') || img.startsWith('https'))

    const payload = {
      data: {
        attributes: {
          line_items: [
            {
              currency: 'PHP',
              amount: booking.downpayment, 
              description: `Downpayment for ${booking.unit.name}`,
              name: 'Booking Downpayment',
              quantity: 1,
              ...(validImages.length > 0 && { images: [validImages[0]] })
            }
          ],
          payment_method_types: ['gcash', 'card', 'paymaya', 'grab_pay'],
          success_url: `${baseUrl}/payment/${bookingId}?success=true`,
          cancel_url: `${baseUrl}/payment/${bookingId}?cancelled=true`,
          description: `Booking ID: ${booking.id}`,
          billing: {
            name: booking.user.name,
            email: booking.user.email,
            phone: booking.user.mobile
          },
          metadata: {
            booking_id: booking.id
          },
          send_email_receipt: true
        }
      }
    }

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    const data = await response.json()

    if (data.errors) {
      console.error("PayMongo Error:", JSON.stringify(data.errors, null, 2))
      return { error: "Payment gateway error. Please contact support." }
    }

    await prisma.booking.update({
        where: { id: booking.id },
        data: { checkoutSessionId: data.data.id }
    })

    return { success: true, url: data.data.attributes.checkout_url }

  } catch (error) {
    console.error("Gateway Init Error:", error)
    return { error: "Failed to connect to payment gateway." }
  }
}

export async function checkPaymentStatus(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    })

    if (!booking) return { status: 'error', message: 'Booking not found' }
    if (booking.status === 'CONFIRMED') return { status: 'confirmed' }
    if (!booking.checkoutSessionId) return { status: 'pending' }

    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${booking.checkoutSessionId}`, {
      headers: { 'Authorization': getAuthHeader() },
      cache: 'no-store'
    })
    
    const data = await response.json()
    const paymentStatus = data.data?.attributes?.payment_status 

    if (paymentStatus === 'paid') {
       await confirmBooking(bookingId, `[PayMongo] Paid via Session ${booking.checkoutSessionId}`)
       revalidatePath(`/payment/${bookingId}`)
       return { status: 'confirmed' }
    }

    return { status: 'pending' }

  } catch (error) {
    console.error("Check Status Error:", error)
    return { status: 'error', message: 'Failed to check status' }
  }
}

export async function verifyTransaction(sessionId: string, bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }})
    if (booking?.status === 'CONFIRMED') return { success: true }

    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${sessionId}`, {
      headers: { 'Authorization': getAuthHeader() },
      cache: 'no-store'
    })
    
    const data = await response.json()
    const paymentStatus = data.data?.attributes?.payment_status 

    if (paymentStatus === 'paid') {
      await confirmBooking(bookingId, `[PayMongo] Paid via Session ${sessionId}`)
      revalidatePath(`/payment/${bookingId}`)
      revalidatePath('/track')
      return { success: true }
    } else {
      return { error: "Payment not completed yet." }
    }
  } catch (error) {
    console.error("Verification Error:", error)
    return { error: "Failed to verify payment." }
  }
}

export async function finalizePayment(bookingId: string, paymentMethod: string) {
    return { success: true } 
}