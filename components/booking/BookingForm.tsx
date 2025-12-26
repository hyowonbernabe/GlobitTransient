'use client'

import { useState, useEffect } from 'react'
import { format, differenceInCalendarDays } from "date-fns"
import { Calendar as CalendarIcon, Car, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type DateRange } from "react-day-picker"
import { createBooking } from "@/server/actions/booking"
import { useRouter } from "next/navigation"

interface UnitPricing {
  id: string
  basePrice: number
  basePax: number
  extraPaxPrice: number
  maxPax: number
  hasCarConfig: boolean
}

// Add blockedDates to props
interface BookingFormProps {
  pricing: UnitPricing
  blockedDates?: DateRange[] 
}

export function BookingForm({ pricing, blockedDates = [] }: BookingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Dates & Config
  const [date, setDate] = useState<DateRange | undefined>()
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [toddlers, setToddlers] = useState(0)
  const [hasCar, setHasCar] = useState(false)
  const [hasPet, setHasPet] = useState(false)
  const [hasPWD, setHasPWD] = useState(false)

  // Step 2: Guest Details
  const [guestName, setGuestName] = useState("")
  const [guestMobile, setGuestMobile] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  
  const [totalPrice, setTotalPrice] = useState(0)
  const [downPayment, setDownPayment] = useState(0)
  const [nights, setNights] = useState(0)

  // Price Calculation Logic
  useEffect(() => {
    if (!date?.from || !date?.to) {
      setTotalPrice(0)
      setDownPayment(0)
      setNights(0)
      return
    }

    const calculatedNights = differenceInCalendarDays(date.to, date.from)
    if (calculatedNights < 1) return

    setNights(calculatedNights)

    const paidHeads = adults + kids
    
    const extraHeads = Math.max(0, paidHeads - pricing.basePax)
    const nightlyRate = pricing.basePrice + (extraHeads * pricing.extraPaxPrice)
    
    let total = nightlyRate * calculatedNights

    if (hasPWD) {
      total = total * 0.8
    }

    setTotalPrice(total)
    setDownPayment(total * 0.5)

  }, [date, adults, kids, toddlers, hasPWD, pricing])

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  const handleSubmit = async () => {
    if (!date?.from || !date?.to) return

    setIsSubmitting(true)
    setError(null)

    const result = await createBooking({
      unitId: pricing.id,
      checkIn: date.from,
      checkOut: date.to,
      adults,
      kids,
      toddlers,
      hasCar,
      hasPet,
      hasPWD,
      guestName,
      guestMobile,
      guestEmail
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.success && result.bookingId) {
      router.push(`/payment/${result.bookingId}`)
    }
  }

  // Combine past dates + confirmed bookings
  // The 'disabled' prop accepts a Matcher or array of Matchers
  const disabledDays = [
    { before: new Date() }, // Past dates
    ...blockedDates // Future confirmed bookings
  ]

  return (
    <Card className="w-full border-gray-200 shadow-lg lg:sticky lg:top-24">
      <CardHeader className="bg-emerald-900 text-white rounded-t-xl py-4">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white hover:text-emerald-200 hover:bg-emerald-800 -ml-2"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <span>{step === 1 ? "Booking Summary" : "Guest Details"}</span>
          </div>
          <span className="text-sm font-normal text-emerald-200">
             {formatMoney(pricing.basePrice)} / night
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {step === 1 ? (
          <>
            {/* --- STEP 1: CALCULATOR --- */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-500">Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                          <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-800 border-0">
                            {nights} Night{nights > 1 ? 's' : ''}
                          </Badge>
                        </>
                      ) : (
                        format(date.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Check-in - Check-out</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    disabled={disabledDays}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                 <span>Check-in: 2:00 PM</span>
                 <span>Check-out: 12:00 PM</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase text-gray-500">Guests</Label>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Adults</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={adults} 
                    onChange={(e) => setAdults(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kids (5+)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    value={kids} 
                    onChange={(e) => setKids(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Toddlers</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    value={toddlers} 
                    onChange={(e) => setToddlers(Number(e.target.value))}
                  />
                  <span className="text-[10px] text-emerald-600 font-medium block text-center">Free</span>
                </div>
              </div>
              
              {(adults + kids) > pricing.maxPax && (
                 <div className="text-xs text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                   <AlertCircle className="w-3 h-3" />
                   Max capacity for this unit is {pricing.maxPax} pax.
                 </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
               <Label className="text-xs font-bold uppercase text-gray-500">Extras & Requirements</Label>
               
               <div className={cn("flex items-start space-x-2 p-3 rounded-lg border", hasCar ? "bg-emerald-50 border-emerald-200" : "border-gray-100")}>
                  <Checkbox id="car" checked={hasCar} onCheckedChange={(c) => setHasCar(!!c)} />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="car"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Car className="w-3 h-3" /> Bringing a Car?
                    </Label>
                    <p className="text-xs text-gray-500">
                      Strictly 1 slot only. Subject to availability check.
                    </p>
                  </div>
               </div>

               <div className="flex items-center space-x-2">
                  <Checkbox id="pwd" checked={hasPWD} onCheckedChange={(c) => setHasPWD(!!c)} />
                  <Label htmlFor="pwd" className="text-sm font-medium">PWD / Senior Citizen (20% Off)</Label>
               </div>
               
               <div className="flex items-center space-x-2">
                  <Checkbox id="pet" checked={hasPet} onCheckedChange={(c) => setHasPet(!!c)} />
                  <Label htmlFor="pet" className="text-sm font-medium">Bringing a Pet (Must wear diaper)</Label>
               </div>
            </div>
          </>
        ) : (
          <>
            {/* --- STEP 2: GUEST DETAILS --- */}
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 mb-4">
                 <strong>Reservation for:</strong> {nights} Nights • {adults + kids} Pax
                 <br />
                 <span className="text-xs opacity-80">
                   {date?.from && format(date.from, "MMM dd")} - {date?.to && format(date.to, "MMM dd")}
                 </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="Juan Dela Cruz" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="mobile" 
                  placeholder="0917 123 4567" 
                  type="tel"
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                />
                <p className="text-xs text-gray-500">We will send the payment details here.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input 
                  id="email" 
                  placeholder="juan@example.com" 
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                 <Checkbox id="terms" />
                 <Label htmlFor="terms" className="text-xs text-gray-600 font-normal leading-normal">
                   I agree to the <strong>House Rules</strong> and understand that the downpayment is non-refundable.
                 </Label>
              </div>
            </div>
          </>
        )}

        {/* Pricing Display (Always Visible if > 0) */}
        {totalPrice > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
             <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Bill</span>
                <span className="font-bold text-gray-900">{formatMoney(totalPrice)}</span>
             </div>
             <div className="flex justify-between text-sm text-emerald-700">
                <span>Required Downpayment (50%)</span>
                <span className="font-bold">{formatMoney(downPayment)}</span>
             </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

      </CardContent>

      <CardFooter>
        {step === 1 ? (
          <Button 
            className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700" 
            disabled={!date?.from || !date?.to || (adults + kids) > pricing.maxPax}
            onClick={() => setStep(2)}
          >
            {date?.from ? 'Proceed to Guest Details' : 'Select Dates'}
          </Button>
        ) : (
          <Button 
            className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700" 
            disabled={!guestName || !guestMobile || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Reservation'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}