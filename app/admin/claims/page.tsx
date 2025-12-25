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
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { markCommissionPaid, rejectCommission } from '@/server/actions/commission'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getCommissions() {
  return await prisma.commission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      agent: {
        select: { name: true, agentCode: true }
      },
      booking: {
        select: { 
            id: true, 
            checkIn: true, 
            totalPrice: true,
            user: { select: { name: true } }
        }
      }
    }
  })
}

export default async function ClaimsPage() {
  const commissions = await getCommissions()

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commissions & Claims</h1>
          <p className="text-gray-500">Review and payout agent commissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Booking Ref</TableHead>
              <TableHead>Commission Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No commissions found.
                    </TableCell>
                </TableRow>
            ) : (
                commissions.map((comm) => (
                <TableRow key={comm.id}>
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span>{comm.agent.name}</span>
                            <span className="text-xs text-gray-400 font-mono">{comm.agent.agentCode}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col text-sm">
                            <span className="font-medium text-gray-700">{comm.booking.user.name || 'Guest'}</span>
                            <span className="text-xs text-gray-500">
                                Check-in: {format(comm.booking.checkIn, "MMM dd")}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-700">
                        {formatMoney(comm.amount)}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={
                            comm.status === 'PAID_OUT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            comm.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }>
                            {comm.status === 'PAID_OUT' ? 'PAID' : comm.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                        {format(comm.createdAt, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                        {comm.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                                <form action={async () => {
                                    'use server'
                                    await markCommissionPaid(comm.id)
                                }}>
                                    <Button size="sm" className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700" title="Mark as Paid">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </form>
                                <form action={async () => {
                                    'use server'
                                    await rejectCommission(comm.id)
                                }}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 border border-gray-200" title="Reject">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        )}
                        {comm.status === 'PAID_OUT' && (
                             <span className="text-xs text-gray-400 italic">Paid on {comm.paidAt ? format(comm.paidAt, "MMM dd") : '-'}</span>
                        )}
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}