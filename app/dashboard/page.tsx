import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, DollarSign, Users, HandCoins } from "lucide-react"
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts"
import { RecentBookings } from "@/components/admin/RecentBookings"
import { getRevenueData, getOccupancyData } from "@/server/actions/analytics"

export const dynamic = "force-dynamic"

async function getDashboardData(userId: string, isAdmin: boolean) {
    // Pending bookings count (admin only)
    const pendingCount = isAdmin
        ? await prisma.booking.count({ where: { status: "PENDING" } })
        : 0

    // Upcoming bookings
    const upcomingCount = await prisma.booking.count({
        where: {
            status: "CONFIRMED",
            checkIn: { gte: new Date() },
            ...(isAdmin ? {} : { agentId: userId }),
        },
    })

    // Expected guests this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const guestData = await prisma.booking.aggregate({
        where: {
            status: "CONFIRMED",
            checkIn: { gte: startOfMonth, lte: endOfMonth },
            ...(isAdmin ? {} : { agentId: userId }),
        },
        _sum: { pax: true },
    })

    // Revenue (admin only)
    const revenueData = isAdmin
        ? await prisma.booking.aggregate({
            where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
            _sum: { totalPrice: true },
        })
        : null

    // Agent-specific: commission stats
    const commissionStats = !isAdmin
        ? await prisma.commission.aggregate({
            where: { agentId: userId },
            _sum: { amount: true },
        })
        : null

    const pendingCommissions = !isAdmin
        ? await prisma.commission.count({
            where: { agentId: userId, status: "PENDING" },
        })
        : null

    // Pending claims (admin only)
    const pendingClaims = isAdmin
        ? await prisma.claimRequest.count({ where: { status: "PENDING" } })
        : 0

    // Recent bookings
    const recentBookingsRaw = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: isAdmin ? {} : { agentId: userId },
        select: {
            id: true,
            totalPrice: true,
            status: true,
            createdAt: true,
            unit: { select: { name: true } },
            user: { select: { name: true } },
        },
    })

    const recentBookings = recentBookingsRaw.map((b) => ({
        id: b.id,
        guestName: b.user.name,
        unitName: b.unit.name,
        totalPrice: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt,
    }))

    return {
        stats: {
            pending: pendingCount,
            upcoming: upcomingCount,
            revenue: revenueData?._sum.totalPrice || 0,
            guests: guestData._sum.pax || 0,
            commissionTotal: commissionStats?._sum.amount || 0,
            pendingCommissions: pendingCommissions || 0,
            pendingClaims,
        },
        recentBookings,
    }
}

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/admin/login")
    }

    const role = session.user.role
    const isAdmin = role === "ADMIN"

    const { stats, recentBookings } = await getDashboardData(session.user.id!, isAdmin)

    // Fetch chart data for admin
    const revenueChartData = isAdmin ? await getRevenueData() : []
    const occupancyChartData = isAdmin ? await getOccupancyData() : []

    const formatMoney = (val: number) =>
        new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
            val / 100
        )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isAdmin ? "Admin Dashboard" : "Partner Dashboard"}
                </h1>
                <p className="text-gray-500">
                    Welcome back, {session.user.name}. Here's your overview.
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isAdmin && (
                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Pending Approvals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Upcoming Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.upcoming}</div>
                        <p className="text-xs text-gray-500 mt-1">Confirmed reservations</p>
                    </CardContent>
                </Card>

                {isAdmin ? (
                    <>
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

                        <Card className="border-l-4 border-l-orange-500 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <HandCoins className="w-4 h-4" /> Pending Claims
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingClaims}</div>
                                <p className="text-xs text-gray-500 mt-1">Need review</p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Commission Earnings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatMoney(stats.commissionTotal)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">All time</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <HandCoins className="w-4 h-4" /> Pending Commissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingCommissions}</div>
                                <p className="text-xs text-gray-500 mt-1">Awaiting payout</p>
                            </CardContent>
                        </Card>
                    </>
                )}

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Expected Guests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.guests}</div>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts (admin only) */}
            {isAdmin && (
                <AnalyticsCharts
                    revenueData={revenueChartData}
                    occupancyData={occupancyChartData}
                />
            )}

            {/* Recent Bookings */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
                <RecentBookings bookings={recentBookings} />
            </div>
        </div>
    )
}
