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
import { approveBooking, cancelBooking } from '@/server/actions/booking-admin'
import { format } from 'date-fns'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

// Define explicit interface for Booking Data to fix implicit 'any' errors
interface BookingData {
  id: string
  checkIn: Date
  checkOut: Date
  status: string
  totalPrice: number
  downpayment: number
  notes: string | null
  adults: number
  kids: number
  user: {
    name: string | null
    mobile: string | null
  }
  unit: {
    name: string
  }
}

async function getBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      unit: true
    }
  })
  // Cast to BookingData[] to ensure type safety downstream
  return bookings as unknown as BookingData[]
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  const BookingTable = ({ statusFilter }: { statusFilter: string }) => {
    const filtered = statusFilter === 'ALL' 
      ? bookings 
      // Explicitly type 'b' to fix the build error
      : bookings.filter((b: BookingData) => b.status === statusFilter)

    if (filtered.length === 0) {
      return <div className="text-center py-12 text-gray-500">No bookings found in this category.</div>
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Guest Info</TableHead>
              <TableHead>Unit & Dates</TableHead>
              <TableHead>Payment Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => {
              // Extract payment reference from notes if available
              const paymentRef = booking.notes?.match(/Ref:\s*(\w+)/)?.[1]

              return (
                <TableRow key={booking.id}>
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{booking.user.name}</span>
                      <span className="text-xs text-gray-500">{booking.user.mobile}</span>
                      <span className="text-xs text-gray-400">{booking.adults + booking.kids} Pax</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-emerald-800">{booking.unit.name}</span>
                      <span className="text-xs text-gray-500">
                        {/* Ensure dates are Date objects */}
                        {format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm">
                        <span className="text-gray-500">Total: </span>
                        <span className="font-medium">{formatMoney(booking.totalPrice)}</span>
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">
                        DP: {formatMoney(booking.downpayment)}
                      </div>
                      {paymentRef ? (
                        <Badge variant="outline" className="w-fit mt-1 border-blue-200 bg-blue-50 text-blue-700">
                           Ref: {paymentRef}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No Ref No.</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge className={
                      booking.status === 'CONFIRMED' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600' :
                      booking.status === 'CANCELLED' ? 'bg-red-500 hover:bg-red-600' :
                      'bg-gray-500'
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right align-top">
                    {booking.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <form action={async () => {
                            'use server'
                            await approveBooking(booking.id)
                        }}>
                          <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" title="Confirm Payment">
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </form>
                        <form action={async () => {
                            'use server'
                            await cancelBooking(booking.id)
                        }}>
                          <Button size="sm" variant="outline" className="h-8 hover:bg-red-50 hover:text-red-600 border-red-200 text-red-600" title="Cancel Booking">
                            <X className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    )}
                    {booking.status === 'CONFIRMED' && (
                       <Button size="sm" variant="ghost" disabled className="h-8">
                         <Check className="w-4 h-4 mr-2 text-emerald-600" /> Verified
                       </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-500">Verify payments and manage guest reservations.</p>
        </div>
      </div>

      <Tabs defaultValue="PENDING" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="PENDING">Pending Approval</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="ALL">All History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="PENDING">
          <BookingTable statusFilter="PENDING" />
        </TabsContent>
        <TabsContent value="CONFIRMED">
          <BookingTable statusFilter="CONFIRMED" />
        </TabsContent>
        <TabsContent value="ALL">
          <BookingTable statusFilter="ALL" />
        </TabsContent>
      </Tabs>
    </div>
  )
}