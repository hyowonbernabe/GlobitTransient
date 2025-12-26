'use server'

import prisma from "@/lib/prisma"
import { sendBookingConfirmation } from "@/server/actions/email"
import { createNotification } from "@/server/actions/notification"
import { revalidatePath } from "next/cache"

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

    // 1. Race Condition Check
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
      return { error: "This slot was just taken by another user. Please re-book." }
    }

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000"
    
    // 2. Prepare Images
    const validImages = booking.unit.images
      .filter(img => img.startsWith('http') || img.startsWith('https'))

    // 3. Create PayMongo Session
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

    // 4. Save Session ID to DB (Critical for verification)
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

// Polling Action: Called by the client to check if payment went through
export async function checkPaymentStatus(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    })

    if (!booking) return { status: 'error', message: 'Booking not found' }
    if (booking.status === 'CONFIRMED') return { status: 'confirmed' }
    if (!booking.checkoutSessionId) return { status: 'pending' }

    // If not confirmed in DB yet, ask PayMongo
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${booking.checkoutSessionId}`, {
      headers: { 'Authorization': getAuthHeader() },
      cache: 'no-store'
    })
    
    const data = await response.json()
    const paymentStatus = data.data?.attributes?.payment_status 

    if (paymentStatus === 'paid') {
       // Confirm it now
       await confirmBookingLogic(bookingId, `[PayMongo] Paid via Session ${booking.checkoutSessionId}`)
       revalidatePath(`/payment/${bookingId}`)
       return { status: 'confirmed' }
    }

    return { status: 'pending' }

  } catch (error) {
    console.error("Check Status Error:", error)
    return { status: 'error', message: 'Failed to check status' }
  }
}

// Internal Logic to mark as confirmed (Shared by Webhook and Manual Check)
export async function confirmBookingLogic(bookingId: string, notesPrefix: string) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { unit: true, user: true }
    })

    if (booking && booking.status !== 'CONFIRMED') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CONFIRMED',
                paymentStatus: 'PARTIAL',
                notes: booking.notes ? `${booking.notes}\n${notesPrefix}` : notesPrefix
            }
        })

        // Agent Commission
        if (booking.agentId) {
            const agent = await prisma.user.findUnique({ where: { id: booking.agentId }})
            if (agent) {
                const commissionAmount = Math.round(booking.totalPrice * agent.commissionRate)
                await prisma.commission.create({
                    data: {
                        amount: commissionAmount,
                        status: 'PENDING',
                        bookingId: booking.id,
                        agentId: agent.id
                    }
                })
                await createNotification(
                    agent.id,
                    "New Commission",
                    `You earned commission for booking ${booking.id}`,
                    "/portal/bookings",
                    "SUCCESS"
                )
            }
        }

        // Email
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
    }
}