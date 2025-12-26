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
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Booking {
  id: string
  guestName: string | null
  unitName: string
  totalPrice: number
  status: string
  createdAt: Date
}

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Booked</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No recent bookings found.
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium text-gray-900">
                  {booking.guestName || 'Guest'}
                </TableCell>
                <TableCell className="text-gray-600">
                  {booking.unitName}
                </TableCell>
                <TableCell className="font-mono text-emerald-700">
                  {formatMoney(booking.totalPrice)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    booking.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-600'
                  }>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-gray-500">
                  {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Footer Link */}
      <div className="bg-gray-50 border-t border-gray-100 p-3 text-right">
        <Link href="/admin/bookings" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
          View all bookings <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}