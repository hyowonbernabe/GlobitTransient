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

    // Base URL determination for Vercel and local
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const validImages = booking.unit.images.filter(img => img.startsWith('http'))

    const payload = {
      data: {
        attributes: {
          show_line_items: true,
          line_items: [
            {
              currency: 'PHP',
              amount: booking.downpayment,
              description: `Reservation Downpayment for ${booking.unit.name}`,
              name: 'Booking Downpayment',
              quantity: 1,
              ...(validImages.length > 0 && { images: [validImages[0]] })
            }
          ],
          payment_method_types: ['gcash', 'card', 'paymaya', 'grab_pay'],
          success_url: `${baseUrl}/payment/${bookingId}?success=true`,
          cancel_url: `${baseUrl}/payment/${bookingId}?cancelled=true`,
          description: `Booking ID: ${booking.id} - ${booking.unit.name}`,
          billing: {
            name: booking.user.name || 'Guest',
            email: booking.user.email || 'guest@example.com',
            phone: booking.user.mobile || ''
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
      console.error("❌ PayMongo Session Error:", JSON.stringify(data.errors, null, 2))
      return { error: data.errors[0]?.detail || "Payment gateway error." }
    }

    // Update booking with session ID for later verification
    await prisma.booking.update({
      where: { id: booking.id },
      data: { checkoutSessionId: data.data.id }
    })

    return { success: true, url: data.data.attributes.checkout_url }

  } catch (error) {
    console.error("❌ Gateway Init Error:", error)
    return { error: "Could not connect to payment gateway." }
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

    if (!response.ok) {
      return { status: 'pending' }
    }

    const data = await response.json()
    const attributes = data.data?.attributes

    // Robust status check: 
    // 1. Check if the session is expired/cancelled (though usually we handle success)
    // 2. Check payment intent status
    // 3. Check payments array
    const intentStatus = attributes?.payment_intent?.attributes?.status
    const payments = attributes?.payments || []
    const isPaid = intentStatus === 'succeeded' || payments.some((p: any) => p.attributes?.status === 'paid')

    if (isPaid) {
      console.log(`✅ [Status Check] Booking ${bookingId} confirmed via API poll.`)
      await confirmBooking(bookingId, `[System] Payment verified via API Polling`)
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
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (booking?.status === 'CONFIRMED') return { success: true }

    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${sessionId}`, {
      headers: { 'Authorization': getAuthHeader() },
      cache: 'no-store'
    })

    if (!response.ok) return { error: "Could not retrieve payment session." }

    const data = await response.json()
    const attributes = data.data?.attributes

    const intentStatus = attributes?.payment_intent?.attributes?.status
    const payments = attributes?.payments || []
    const isPaid = intentStatus === 'succeeded' || payments.some((p: any) => p.attributes?.status === 'paid')

    if (isPaid) {
      console.log(`✅ [Verify] Booking ${bookingId} confirmed via direct session check.`)
      await confirmBooking(bookingId, `[System] Payment verified via Direct Verification`)
      revalidatePath(`/payment/${bookingId}`)
      revalidatePath('/track')
      return { success: true }
    } else {
      return { error: "Your payment hasn't been processed yet. Please wait a few seconds." }
    }
  } catch (error) {
    console.error("Verification Error:", error)
    return { error: "Failed to verify payment." }
  }
}

export async function finalizePayment(bookingId: string, paymentMethod: string) {
  return { success: true }
}