import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { confirmBooking } from '@/lib/booking-service'

// Explicitly mark as dynamic to fix build errors with request body reading
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get('paymongo-signature')
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET

    console.log("🔹 [Webhook] Incoming PayMongo Notification")

    // 1. Mandatory Signature Verification (if secret is configured)
    if (webhookSecret) {
      if (!signature) {
        console.error("❌ [Webhook] Missing Signature Header")
        return NextResponse.json({ error: "Missing signature" }, { status: 401 })
      }

      const parts = signature.split(',')
      const timestamp = parts.find(p => p.trim().startsWith('t='))?.split('=')[1]
      const teSig = parts.find(p => p.trim().startsWith('te='))?.split('=')[1]
      const liSig = parts.find(p => p.trim().startsWith('li='))?.split('=')[1]

      if (!timestamp) return NextResponse.json({ error: "Invalid signature format" }, { status: 401 })

      const expected = crypto.createHmac('sha256', webhookSecret).update(`${timestamp}.${bodyText}`).digest('hex')
      const verified = (teSig && expected === teSig) || (liSig && expected === liSig)

      if (!verified) {
        console.error("❌ [Webhook] Signature Mismatch")
        return NextResponse.json({ error: "Signature mismatch" }, { status: 401 })
      }
    }

    const body = JSON.parse(bodyText)
    const eventType = body.data?.attributes?.type

    console.log(`📡 [Webhook] Event: ${eventType}`)

    // 2. Process 'checkout_session.payment.paid'
    if (eventType === 'checkout_session.payment.paid') {
      const sessionData = body.data.attributes.data // This is the checkout_session object
      const bookingId = sessionData.attributes?.metadata?.booking_id

      if (bookingId) {
        console.log(`✅ [Webhook] Payment SUCCESS for Booking: ${bookingId}`)
        // confirmBooking handles state checks internally (won't double confirm)
        await confirmBooking(
          bookingId,
          `[Webhook] Payment confirmed via PayMongo Event ${body.data.id}`
        )
      } else {
        console.warn("⚠️ [Webhook] No booking_id found in metadata.")
      }
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error("❌ [Webhook] Runtime Error:", err.message)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
