'use server'

import prisma from '@/lib/prisma'
import { format } from 'date-fns'

export async function exportBookingsCSV() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        unit: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const headers = [
      'Booking ID',
      'Guest Name',
      'Mobile',
      'Unit',
      'Check-In',
      'Check-Out',
      'Pax',
      'Total Price',
      'Status',
      'Payment Status',
      'Date Booked'
    ]

    const rows = bookings.map((b: any) => [
      b.id,
      `"${b.user.name || 'Guest'}"`,
      `"${b.user.mobile || ''}"`,
      `"${b.unit.name}"`,
      format(b.checkIn, 'yyyy-MM-dd'),
      format(b.checkOut, 'yyyy-MM-dd'),
      b.adults + b.kids,
      (b.totalPrice / 100).toFixed(2),
      b.status,
      b.paymentStatus,
      format(b.createdAt, 'yyyy-MM-dd HH:mm:ss')
    ])

    return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
  } catch (error) {
    console.error('Export Error:', error)
    return null
  }
}

export async function exportCommissionsCSV() {
  try {
    const commissions = await prisma.commission.findMany({
      include: {
        agent: true,
        booking: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const headers = [
      'Commission ID',
      'Agent Name',
      'Agent Code',
      'Guest Name',
      'Booking Amount',
      'Commission Amount',
      'Status',
      'Date Created',
      'Date Paid'
    ]

    const rows = commissions.map((c: any) => [
      c.id,
      `"${c.agent.name}"`,
      c.agent.agentCode || '',
      `"${c.booking.user.name || 'Guest'}"`,
      (c.booking.totalPrice / 100).toFixed(2),
      (c.amount / 100).toFixed(2),
      c.status,
      format(c.createdAt, 'yyyy-MM-dd'),
      c.paidAt ? format(c.paidAt, 'yyyy-MM-dd') : ''
    ])

    return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
  } catch (error) {
    console.error('Export Error:', error)
    return null
  }
}