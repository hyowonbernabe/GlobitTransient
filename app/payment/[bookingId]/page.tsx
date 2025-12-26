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
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

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
                  <div className="flex justify-between items-center text-lg font-bold text-emerald-800">
                    <span>Pay Now (50%)</span>
                    <span>{formatMoney(booking.downpayment)}</span>
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
          <Card className="w-full max-w-md text-center p-8 space-y-6 shadow-xl border-emerald-100 animate-in fade-in duration-500">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-gray-600 mt-2">Booking Confirmed.</p>
            </div>
            
            <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Your Booking Reference</p>
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 font-mono text-sm font-bold text-gray-800 select-all break-all flex items-center justify-center gap-2">
                    {booking.id}
                </div>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-xl text-left space-y-2 border border-emerald-100">
               <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Guest</span>
                   <span className="text-sm font-medium">{booking.user.name}</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Unit</span>
                   <span className="text-sm font-medium">{booking.unit.name}</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Dates</span>
                   <span className="text-sm font-medium">{format(booking.checkIn, "MMM dd")} - {format(booking.checkOut, "MMM dd")}</span>
               </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-white p-2 rounded">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Confirmation sent to <strong>{booking.user.email}</strong></span>
            </div>
            
            <div className="flex gap-3 justify-center pt-2">
              <Button asChild variant="outline">
                <a href="/">Return Home</a>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
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