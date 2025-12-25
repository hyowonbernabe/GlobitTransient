import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, CreditCard, ShieldCheck, Clock } from "lucide-react"
import { format } from "date-fns"
import { PaymentForm } from "@/components/payment/PaymentForm"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ bookingId: string }>
}

async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      unit: true,
      user: true
    }
  })
  return booking
}

export default async function PaymentPage(props: PageProps) {
  const params = await props.params;
  const booking = await getBooking(params.bookingId)

  if (!booking) {
    return notFound()
  }

  // If already confirmed, redirect or show success
  if (booking.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-600">
              Your payment has been verified. We are excited to host you on {format(booking.checkIn, "MMMM dd, yyyy")}.
            </p>
            <Button asChild className="mt-4">
              <a href="/">Return Home</a>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Check if payment was already submitted (via our notes hack)
  const isPaymentSubmitted = booking.notes?.includes("[Payment Submitted]")

  // Formatters
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Payment Instructions */}
            <div className="space-y-6 order-2 md:order-1">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Secure Your Booking</h1>
                <p className="text-gray-600">
                  Please settle the downpayment to confirm your reservation.
                  <br />
                  <span className="text-sm text-red-500 font-medium">Note: Unpaid bookings are automatically cancelled after 24 hours.</span>
                </p>
              </div>

              <Card className="border-emerald-100 shadow-md overflow-hidden">
                <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <CreditCard className="w-5 h-5" />
                    Payment Method: GCash
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  
                  {/* QR Placeholder */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 mb-4 rounded-lg">
                       {/* Replace with actual QR Code Image */}
                       <span className="text-xs">GCash QR Code</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Scan to Pay</p>
                  </div>

                  {/* Manual Number */}
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Account Name</p>
                        <p className="font-medium text-gray-900">Globit Transient / Juan D.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200 group cursor-pointer active:scale-[0.98] transition-transform">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">GCash Number</p>
                        <p className="font-mono text-lg font-bold text-emerald-700">0917 123 4567</p>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                  </div>

                  <Separator />

                  {/* Submission Form */}
                  {!isPaymentSubmitted ? (
                    <PaymentForm bookingId={booking.id} />
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 text-yellow-800">
                      <Clock className="w-5 h-5 shrink-0" />
                      <div className="text-sm">
                        <strong>Payment Submitted</strong>
                        <p>We are currently verifying your payment. You will receive a confirmation message shortly.</p>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>

            {/* Right Column: Booking Summary */}
            <div className="space-y-6 order-1 md:order-2">
              <Card className="bg-gray-50/50 border-gray-200 sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Unit Info */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {booking.unit.images[0] ? (
                        <img src={booking.unit.images[0]} alt={booking.unit.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-emerald-100" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{booking.unit.name}</h3>
                      <div className="text-sm text-gray-500">
                        {format(booking.checkIn, "MMM dd")} - {format(booking.checkOut, "MMM dd")}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {booking.adults + booking.kids} Guests
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Amount</span>
                      <span>{formatMoney(booking.totalPrice)}</span>
                    </div>
                    {booking.hasPWD && (
                      <div className="flex justify-between text-green-600 text-xs">
                        <span>PWD Discount (20%)</span>
                        <span>Applied</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center p-3 bg-emerald-100 rounded-lg text-emerald-900 border border-emerald-200">
                    <span className="font-semibold text-sm">Downpayment Due (50%)</span>
                    <span className="font-bold text-lg">{formatMoney(booking.downpayment)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-gray-500 bg-white p-3 rounded border border-gray-100">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <p>
                      Your booking is secure. The remaining balance of <strong>{formatMoney(booking.balance)}</strong> is payable upon check-in.
                    </p>
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