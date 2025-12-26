import prisma from "@/lib/prisma"
import { sendBookingConfirmation } from "@/server/actions/email"
import { createNotification } from "@/server/actions/notification"

export async function confirmBooking(bookingId: string, notesPrefix: string) {
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

        if (booking.agentId) {
            const agent = await prisma.user.findUnique({ where: { id: booking.agentId }})
            if (agent) {
                const commissionAmount = Math.round(booking.totalPrice * agent.commissionRate)
                
                // Create commission if not exists (idempotency check ideal but skipped for brevity)
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