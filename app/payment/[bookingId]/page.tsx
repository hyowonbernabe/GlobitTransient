import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ShieldCheck, Mail, XCircle } from "lucide-react"
import { format } from "date-fns"
import { PaymentCheckout } from "@/components/payment/PaymentCheckout"
import { PaymentStatusPoller } from "@/components/payment/PaymentStatusPoller"
import { BookingSuccess } from "@/components/payment/BookingSuccess"

export const dynamic = 'force-dynamic'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

interface PageProps {
  params: Promise<{ bookingId: string }>
  searchParams: Promise<{ success?: string; cancelled?: string }>
}

async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { unit: true, user: true }
  })
  return booking
}

export default async function PaymentPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const booking = await getBooking(params.bookingId)

  if (!booking) return notFound()

  // 1. Success / Polling View
  if (booking.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-24">
          <BookingSuccess booking={booking} />
        </main>
        <Footer />
      </div>
    )
  }

  if (searchParams.success === 'true') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-24">
          <PaymentStatusPoller bookingId={booking.id} />
        </main>
        <Footer />
      </div>
    )
  }

  // 2. Cancelled View
  if (searchParams.cancelled === 'true') {
    return <CancelledView bookingId={booking.id} />
  }

  // 3. Standard Checkout View

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 pt-24 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 order-2 md:order-1">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Secure Your Booking</h1>
                <p className="text-gray-600">
                  Select a payment method to complete the downpayment.
                  <br />
                  <span className="text-sm text-red-500 font-medium flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-4 h-4" />
                    Instant Confirmation upon payment.
                  </span>
                </p>
              </div>
              <PaymentCheckout bookingId={booking.id} amount={formatMoney(booking.downpayment)} />
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <Card className="bg-white border-gray-200 sticky top-24 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {booking.unit.images.length > 0 && booking.unit.images[0].startsWith('http') ? (
                        <img src={booking.unit.images[0]} alt={booking.unit.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">No Img</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{booking.unit.name}</h3>
                      <p className="text-sm text-gray-500">{format(booking.checkIn, "MMM dd")} - {format(booking.checkOut, "MMM dd")}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold text-emerald-800">
                      <span>Pay Now (Downpayment)</span>
                      <span>{formatMoney(booking.downpayment)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span>Remaining Balance</span>
                      <span className="font-semibold">{formatMoney(booking.totalPrice - booking.downpayment)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center italic">Remaining balance to be settled upon check-in.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}



function CancelledView({ bookingId }: { bookingId: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md text-center p-8 space-y-6 shadow-md border-red-100">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Payment Cancelled</h1>
          <p className="text-gray-600">You cancelled the payment process. No charges were made.</p>
          <Button asChild variant="outline">
            <a href={`/payment/${bookingId}`}>Try Again</a>
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  )
}