import { auth } from '@/server/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, DollarSign, Users, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAgentStats(userId: string) {
  const [stats, recentBookings] = await Promise.all([
    // Aggregate Stats
    prisma.commission.aggregate({
      where: { agentId: userId },
      _sum: { amount: true },
      _count: { id: true }
    }),
    // Recent Bookings
    prisma.commission.findMany({
      where: { agentId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        booking: {
          select: { 
            totalPrice: true,
            checkIn: true,
            user: { select: { name: true } }
          }
        }
      }
    })
  ])

  // Get Pending specifically
  const pendingAmount = await prisma.commission.aggregate({
    where: { agentId: userId, status: 'PENDING' },
    _sum: { amount: true }
  })

  return {
    totalEarnings: stats._sum.amount || 0,
    totalReferrals: stats._count.id || 0,
    pendingEarnings: pendingAmount._sum.amount || 0,
    recentBookings
  }
}

export default async function AgentDashboard() {
  const session = await auth()
  if (!session?.user) return null

  // @ts-ignore
  const agentCode = session.user.agentCode || 'NO-CODE'
  const referralLink = `${process.env.AUTH_URL}/book?ref=${agentCode}`
  
  const stats = await getAgentStats(session.user.id!)

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Welcome & Link Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
            <p className="text-emerald-100">Here is your performance overview for this month.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
             <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">Your Agent Code</span>
             <div className="text-2xl font-mono font-bold tracking-widest">{agentCode}</div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
          <label className="text-sm text-emerald-200 mb-2 block">Your Referral Link</label>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={referralLink} 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono"
            />
            {/* Note: In a real client component, we'd add onClick navigator.clipboard.writeText */}
            <Button variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-50">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{formatMoney(stats.totalEarnings)}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatMoney(stats.pendingEarnings)}</div>
            <p className="text-xs text-gray-500 mt-1">Waiting for admin approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" /> Successful Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.totalReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">Bookings generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commissions</CardTitle>
          <CardDescription>Your latest successful bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No bookings yet. Share your link to get started!</p>
            ) : (
              stats.recentBookings.map((comm) => (
                <div key={comm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{comm.booking.user.name || 'Guest User'}</p>
                    <p className="text-xs text-gray-500">Booking Value: {formatMoney(comm.booking.totalPrice)}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-emerald-700">+{formatMoney(comm.amount)}</span>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {comm.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}