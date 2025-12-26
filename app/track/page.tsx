'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trackBooking } from '@/server/actions/track'
import { Search, Loader2, Calendar, CreditCard, ArrowRight, User } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function TrackPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<any | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setBooking(null)

    const result = await trackBooking(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.booking) {
      setBooking(result.booking)
    }

    setIsLoading(false)
  }

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-emerald-950">Track Your Booking</h1>
            <p className="text-gray-600">
              Enter your Booking ID to check your status or complete your payment.
            </p>
          </div>

          <Card className="border-emerald-100 shadow-md">
            <CardContent className="pt-6">
              <form action={handleSubmit} className="flex gap-4">
                <Input 
                  name="bookingId" 
                  placeholder="Enter Booking ID (e.g. ckq...)" 
                  required 
                  className="flex-1 h-12 text-lg font-mono"
                />
                <Button type="submit" disabled={isLoading} className="h-12 w-32 bg-emerald-600 hover:bg-emerald-700">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
                </Button>
              </form>
              {error && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                  <Search className="w-4 h-4" /> {error}
                </p>
              )}
            </CardContent>
          </Card>

          {booking && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <Card className="overflow-hidden border-gray-200">
                <div className="h-2 bg-emerald-600" />
                <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{booking.unit.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        {booking.user.name || 'Guest'}
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-gray-100 text-gray-600'
                  }>
                    {booking.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                        <Calendar className="w-4 h-4" /> Check-in
                      </div>
                      <p className="text-gray-900 font-medium">{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-500">2:00 PM</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                      <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                        <Calendar className="w-4 h-4" /> Check-out
                      </div>
                      <p className="text-gray-900 font-medium">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-500">12:00 PM</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Price</span>
                        <span className="font-bold">{formatMoney(booking.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Balance Due</span>
                        <span className="font-bold text-red-600">{formatMoney(booking.balance)}</span>
                    </div>
                  </div>

                  {booking.status === 'PENDING' && (
                    <Link href={`/payment/${booking.id}`} className="block">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Payment
                      </Button>
                    </Link>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center shrink-0">
                            <ArrowRight className="w-4 h-4 text-green-800" />
                        </div>
                        <div>
                            <strong>You're all set!</strong>
                            <p>See you on {format(new Date(booking.checkIn), 'MMMM dd')}.</p>
                        </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}