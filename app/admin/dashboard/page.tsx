import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, DollarSign, Users } from 'lucide-react'
import { getRevenueData, getOccupancyData } from '@/server/actions/analytics'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'

export const dynamic = 'force-dynamic'

async function getStats() {
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
      adults: true,
      kids: true
    }
  })

  return {
    pending: pendingCount,
    confirmed: confirmedCount,
    revenue: revenueData._sum.totalPrice || 0,
    guests: (guestData._sum.adults || 0) + (guestData._sum.kids || 0)
  }
}

export default async function DashboardPage() {
  const stats = await getStats()
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
      
    </div>
  )
}