'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trackBooking } from '@/server/actions/track'
import { Search, Loader2 } from 'lucide-react'
import { TrackingResult } from '@/components/booking/TrackingResult'
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

      <main className="flex-1 py-12 pt-24 md:py-20">
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
            <TrackingResult booking={booking} />
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}