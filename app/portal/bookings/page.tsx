import { auth } from '@/server/auth'
import prisma from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface AgentBooking {
  id: string
  status: string
  checkIn: Date
  checkOut: Date
  unit: { name: string }
  user: { name: string | null }
  commissions: { amount: number, status: string }[]
}

async function getAgentBookings(agentId: string) {
  const bookings = await prisma.booking.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    include: {
      unit: {
        select: { name: true }
      },
      user: {
        select: { name: true }
      },
      commissions: {
        where: { agentId },
        select: { amount: true, status: true }
      }
    }
  })
  return bookings as unknown as AgentBooking[]
}

export default async function AgentBookingsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const bookings = await getAgentBookings(session.user.id)

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Referrals</h1>
        <p className="text-gray-500">Track the status of your bookings and commissions.</p>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b border-gray-100">
          <CardTitle className="text-base font-medium">Booking History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="pl-6">Guest</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    You haven't referred any guests yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const commission = booking.commissions[0]
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="pl-6 font-medium">
                        {booking.user.name || 'Guest'}
                      </TableCell>
                      <TableCell>
                        {booking.unit.name}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {commission ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-700">{formatMoney(commission.amount)}</span>
                            <span className="text-[10px] text-gray-400 uppercase">{commission.status}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Pending Calc</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}