import prisma from '@/lib/prisma'
import { sendBookingCancellation } from '@/server/actions/email'
import { NextResponse } from 'next/server'

// Important: Vercel Cron requires a GET request
export async function GET(req: Request) {
  // Optional: Add a secret header check for security if not using Vercel's built-in protection
  // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 })
  // }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Find stale bookings
    const staleBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: twentyFourHoursAgo
        }
      },
      include: {
        user: true,
        unit: true
      }
    })

    if (staleBookings.length === 0) {
      return NextResponse.json({ message: 'No stale bookings found.' })
    }

    // Process cancellations
    for (const booking of staleBookings) {
      // 1. Update DB
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      })

      // 2. Email User
      if (booking.user.email) {
        await sendBookingCancellation(
          booking.user.email,
          booking.user.name || 'Guest',
          booking.unit.name,
          booking.id,
          "Reservation expired (No payment received within 24 hours)."
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      cancelled: staleBookings.length 
    })

  } catch (error) {
    console.error("Cron Cleanup Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}