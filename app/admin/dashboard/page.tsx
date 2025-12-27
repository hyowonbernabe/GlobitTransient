import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, DollarSign, Users } from 'lucide-react'
import { getRevenueData, getOccupancyData } from '@/server/actions/analytics'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { RecentBookings } from '@/components/admin/RecentBookings'

export const dynamic = 'force-dynamic'

interface RecentBooking {
  id: string
  totalPrice: number
  status: string
  createdAt: Date
  unit: { name: string }
  user: { name: string | null }
}

async function getDashboardData() {
  const pendingCount = await prisma.booking.count({
    where: { status: 'PENDING' }
  })

  const confirmedCount = await prisma.booking.count({
    where: {
      status: 'CONFIRMED',
      checkIn: { gte: new Date() }
    }
  })

  const revenueData = await prisma.booking.aggregate({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    },
    _sum: {
      totalPrice: true
    }
  })

  const guestData = await prisma.booking.aggregate({
    where: {
      status: 'CONFIRMED',
      checkIn: { gte: new Date() }
    },
    _sum: {
      pax: true
    }
  })

  // Fetch Recent Bookings
  const recentBookingsRaw = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      unit: {
        select: { name: true }
      },
      user: {
        select: { name: true }
      }
    }
  })

  // Explicit cast to fix implicit any error
  const recentBookings = recentBookingsRaw as unknown as RecentBooking[]

  // Format bookings for the component
  const formattedBookings = recentBookings.map((b) => ({
    id: b.id,
    guestName: b.user.name,
    unitName: b.unit.name,
    totalPrice: b.totalPrice,
    status: b.status,
    createdAt: b.createdAt
  }))

  return {
    stats: {
      pending: pendingCount,
      confirmed: confirmedCount,
      revenue: revenueData._sum.totalPrice || 0,
      guests: guestData._sum.pax || 0
    },
    recentBookings: formattedBookings
  }
}

export default async function DashboardPage() {
  const { stats, recentBookings } = await getDashboardData()
  const revenueChartData = await getRevenueData()
  const occupancyChartData = await getOccupancyData()

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, Admin. Here is today's overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Require payment verification</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-gray-500 mt-1">Confirmed reservations</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats.revenue)}</div>
            <p className="text-xs text-gray-500 mt-1">Confirmed & Completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" /> Expected Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.guests}</div>
            <p className="text-xs text-gray-500 mt-1">Arriving soon</p>
          </CardContent>
        </Card>

      </div>

      {/* Interactive Charts */}
      <AnalyticsCharts
        revenueData={revenueChartData}
        occupancyData={occupancyChartData}
      />

      {/* Recent Activity Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
        <RecentBookings bookings={recentBookings} />
      </div>

    </div>
  )
}