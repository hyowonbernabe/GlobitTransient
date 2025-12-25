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
import { Trash2 } from 'lucide-react'
import { CreateAgentDialog } from '@/components/admin/AgentForm'
import { deleteAgent } from '@/server/actions/agent'

export const dynamic = 'force-dynamic'

async function getAgents() {
  return await prisma.user.findMany({
    where: { role: 'AGENT' },
    orderBy: { createdAt: 'desc' },
    include: {
        _count: {
            select: { agentBookings: true }
        }
    }
  })
}

export default async function AgentsPage() {
  const agents = await getAgents()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Portal</h1>
          <p className="text-gray-500">Manage your sales team and commissions.</p>
        </div>
        <CreateAgentDialog />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Agent Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Total Referrals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No agents found. Click "Add Agent" to create one.
                    </TableCell>
                </TableRow>
            ) : (
                agents.map((agent) => (
                <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{agent.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{agent.agentCode || 'NO-CODE'}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex flex-col text-sm text-gray-600">
                        <span>{agent.email}</span>
                        <span>{agent.mobile}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                            {(agent.commissionRate * 100).toFixed(0)}%
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <span className="font-bold text-gray-700">{agent._count.agentBookings}</span> bookings
                    </TableCell>
                    <TableCell className="text-right">
                        <form
                            action={async () => {
                                'use server'
                                await deleteAgent(agent.id)
                            }}
                        >
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </form>
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