import { getAuditLogs } from '@/server/actions/audit'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const logs = await getAuditLogs()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track system activity and user actions.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-gray-300" />
                    <span>No activity logs found yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{log.user.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono uppercase">{log.user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs border-gray-300">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-gray-600">
                        <span className="font-semibold">{log.entityType}</span>
                        <span className="text-xs text-gray-400 font-mono">{log.entityId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[300px] truncate" title={log.details}>
                    {log.details || '-'}
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
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