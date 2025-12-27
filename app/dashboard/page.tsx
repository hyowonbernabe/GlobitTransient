import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, DollarSign, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/admin/login")
    }

    const role = session.user.role
    const isAdmin = role === "ADMIN"

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

            {/* Placeholder metrics - will be implemented in next phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Upcoming Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">Confirmed reservations</p>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <>
                        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Pending Approvals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Total Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₱0.00</div>
                                <p className="text-xs text-gray-500 mt-1">All time</p>
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
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Coming soon notice */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            📊 Charts and detailed analytics coming in the next phase
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
