'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/server/auth'
import { eachMonthOfInterval, endOfYear, format, startOfYear, subMonths } from 'date-fns'

export async function getRevenueData() {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return []

  try {
    // 1. Define Range (Current Year)
    const startDate = startOfYear(new Date())
    const endDate = endOfYear(new Date())

    // 2. Fetch Confirmed/Completed Bookings
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        checkIn: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        checkIn: true,
        totalPrice: true
      }
    })

    // 3. Group by Month
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    const data = months.map(month => {
      const monthKey = format(month, 'MMM') // "Jan", "Feb"
      
      // Sum revenue for this month
      const monthlyRevenue = bookings
        .filter(b => format(b.checkIn, 'MMM') === monthKey)
        .reduce((sum, b) => sum + (b.totalPrice / 100), 0)

      return {
        name: monthKey,
        total: monthlyRevenue
      }
    })

    return data

  } catch (error) {
    console.error("Analytics Error:", error)
    return []
  }
}

export async function getOccupancyData() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== 'ADMIN') return []
  
    try {
        // Last 6 months
        const startDate = subMonths(new Date(), 5)
        const endDate = new Date()

        const bookings = await prisma.booking.findMany({
            where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                checkIn: { gte: startDate }
            },
            select: { checkIn: true }
        })

        const months = eachMonthOfInterval({ start: startDate, end: endDate })

        const data = months.map(month => {
            const monthStr = format(month, 'MMM')
            const count = bookings.filter(b => format(b.checkIn, 'MMM') === monthStr).length
            return { name: monthStr, bookings: count }
        })

        return data
    } catch (error) {
        return []
    }
}