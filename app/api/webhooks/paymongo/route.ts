import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { confirmBooking } from '@/lib/booking-service'

// Explicitly mark as dynamic to fix build errors with request body reading
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()

    // Log minimal info
    console.log("🔹 [Webhook] Received PayMongo Event")
    console.log("📦 Payload Body:", bodyText)

    const headerPayload = await headers();
    const signature = headerPayload.get('paymongo-signature')

    // 1. Signature Verification
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const parts = signature.split(',')

      const timestamp = parts.find(part => part.trim().startsWith('t='))?.split('=')[1]
      const teSignature = parts.find(part => part.trim().startsWith('te='))?.split('=')[1]
      const liSignature = parts.find(part => part.trim().startsWith('li='))?.split('=')[1]

      console.log(`🔐 Signature Components - t: ${timestamp}, te: ${teSignature?.slice(0, 8)}..., li: ${liSignature?.slice(0, 8)}...`)

      if (!timestamp) {
        return NextResponse.json({ error: "Invalid Signature" }, { status: 401 })
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${bodyText}`)
        .digest('hex')

      const isTestMatch = teSignature && expectedSignature === teSignature
      const isLiveMatch = liSignature && expectedSignature === liSignature

      if (!isTestMatch && !isLiveMatch) {
        console.error("❌ [Webhook] Signature Mismatch")
        return NextResponse.json({ error: "Invalid Signature" }, { status: 401 })
      }
    }

    const body = JSON.parse(bodyText)
    const eventType = body.data.attributes.type

    // 2. Handle 'checkout_session.payment.paid'
    console.log(`📡 Event Type: ${eventType}`)
    if (eventType === 'checkout_session.payment.paid') {
      const checkoutSession = body.data.attributes.data
      console.log("🔍 Checkout Session Sub-Resource:", JSON.stringify(checkoutSession, null, 2))

      const attributes = checkoutSession.attributes || {}
      const metadata = attributes.metadata
      const bookingId = metadata?.booking_id

      console.log(`📌 Extracted Metadata:`, JSON.stringify(metadata, null, 2))
      console.log(`🆔 Extracted Booking ID: ${bookingId}`)

      if (bookingId) {
        console.log(`✅ [Webhook] Confirming Booking ${bookingId}`)

        await confirmBooking(
          bookingId,
          `[Webhook] Payment confirmed via PayMongo Event ${body.data.id}`
        )
      }
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error("❌ [Webhook] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}