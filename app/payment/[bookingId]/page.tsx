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
    return <SuccessView booking={booking} />
  }

  if (searchParams.success === 'true') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
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
      <main className="flex-1 py-8 md:py-12">
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

function SuccessView({ booking }: { booking: any }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 space-y-6 shadow-2xl border-0 animate-in zoom-in-95 duration-500">
          <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Confirmed!</h1>
            <p className="text-gray-600 mt-2">
              Your payment was successful and your slot is now secured.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reference Number</p>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 font-mono text-lg font-bold text-emerald-900 select-all break-all shadow-inner">
              {booking.id}
            </div>
          </div>

          <Card className="bg-gray-50 border-gray-100 shadow-none overflow-hidden text-left">
            <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-100">
              <span className="text-[10px] font-bold uppercase text-gray-500">Reservation Details</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 underline underline-offset-4 decoration-gray-200">Guest</span>
                <span className="text-sm font-semibold text-gray-900">{booking.user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 underline underline-offset-4 decoration-gray-200">Stay Duration</span>
                <span className="text-sm font-semibold text-gray-900">{format(booking.checkIn, "MMM dd")} - {format(booking.checkOut, "MMM dd")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 underline underline-offset-4 decoration-gray-200">Unit</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{booking.unit.name}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-bold border-t border-emerald-100 pt-2 mt-2">
                <span className="text-sm">Balance at Check-in</span>
                <span className="text-base">{formatMoney(booking.totalPrice - booking.downpayment)}</span>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <Mail className="w-4 h-4" />
            <span>A confirmation email has been sent.</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button asChild variant="outline" className="h-11">
              <a href="/">Home</a>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 h-11 shadow-lg shadow-emerald-100">
              <a href="/track">Track Booking</a>
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

function CancelledView({ bookingId }: { bookingId: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
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