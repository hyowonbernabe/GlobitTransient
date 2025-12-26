'use client'

import { useState, useEffect } from 'react'
import { format, differenceInCalendarDays } from "date-fns"
import {
  Calendar as CalendarIcon,
  Car,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CreditCard,
  CheckCircle,
  Users
} from "lucide-react"
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
import { initiateCheckout } from "@/server/actions/gateway"
import { useRouter } from "next/navigation"
import { Drawer } from 'vaul'
import { motion, AnimatePresence } from 'framer-motion'
import { type DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { createBooking } from "@/server/actions/booking"

interface UnitPricing {
  id: string
  basePrice: number
  basePax: number
  extraPaxPrice: number
  maxPax: number
  hasCarConfig: boolean
}

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
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [totalPrice, setTotalPrice] = useState(0)
  const [downPayment, setDownPayment] = useState(0)
  const [nights, setNights] = useState(0)

  // Price Calculation
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

    const roundedTotal = Math.round(total)
    setTotalPrice(roundedTotal)

    // Tiered Downpayment:
    // < 5000 = 500
    // 5000-10000 = 1000
    // > 10000 = 1500
    let dp = 50000
    if (roundedTotal >= 1000000) {
      dp = 150000
    } else if (roundedTotal >= 500000) {
      dp = 100000
    }

    setDownPayment(dp)

  }, [date, adults, kids, pricing, hasPWD])

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  const handlePayment = async () => {
    if (!date?.from || !date?.to || !termsAccepted) return

    setIsSubmitting(true)
    setError(null)

    // 1. Create Pending Booking
    const bookingResult = await createBooking({
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

    if (bookingResult.error || !bookingResult.bookingId) {
      setError(bookingResult.error || "Failed to create reservation.")
      setIsSubmitting(false)
      return
    }

    // 2. Initiate Payment Gateway
    const checkoutResult = await initiateCheckout(bookingResult.bookingId)

    if (checkoutResult.error) {
      setError(checkoutResult.error)
      setIsSubmitting(false)
    } else if (checkoutResult.url) {
      router.push(checkoutResult.url)
    }
  }

  const disabledDays = [
    { before: new Date() },
    ...blockedDates
  ]

  const FormContent = () => (
    <div className="space-y-6 pt-6 flex-1">
      {step === 1 ? (
        <>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 ml-1">Stay Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-bold h-14 rounded-2xl border-emerald-100 bg-emerald-50/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-emerald-600" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "MMM d")} - {format(date.to, "MMM d")}
                        <Badge className="ml-auto bg-emerald-950 text-white rounded-lg border-none font-black">
                          {nights} Night{nights > 1 ? 's' : ''}
                        </Badge>
                      </>
                    ) : format(date.from, "MMM dd, yyyy")
                  ) : (
                    <span>Select your dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[300]" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  className="rounded-2xl"
                  disabled={disabledDays}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 text-center">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Adults</Label>
              <div className="flex items-center justify-between bg-emerald-50 p-1 rounded-2xl border border-emerald-100">
                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 flex items-center justify-center font-bold text-emerald-950 text-xl">-</button>
                <span className="font-black text-emerald-950 text-xl">{adults}</span>
                <button onClick={() => setAdults(Math.min(20, adults + 1))} className="w-10 h-10 flex items-center justify-center font-bold text-emerald-950 text-xl">+</button>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Kids</Label>
              <div className="flex items-center justify-between bg-emerald-50 p-1 rounded-2xl border border-emerald-100">
                <button onClick={() => setKids(Math.max(0, kids - 1))} className="w-10 h-10 flex items-center justify-center font-bold text-emerald-950 text-xl">-</button>
                <span className="font-black text-emerald-950 text-xl">{kids}</span>
                <button onClick={() => setKids(Math.min(20, kids + 1))} className="w-10 h-10 flex items-center justify-center font-bold text-emerald-950 text-xl">+</button>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Toddler</Label>
              <div className="flex items-center justify-between bg-emerald-50 p-1 rounded-2xl border border-emerald-100">
                <button onClick={() => setToddlers(Math.max(0, toddlers - 1))} className="w-10 h-10 flex items-center justify-center font-bold text-emerald-950 text-xl">-</button>
                <span className="font-black text-emerald-950 text-xl">{toddlers}</span>
                <button onClick={() => setToddlers(Math.min(20, toddlers + 1))} className="w-10 h-10 flex items-center justify-center font-bold text-emerald-950 text-xl">+</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 ml-1">Guest Options</Label>
            <div className="grid grid-cols-1 gap-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setHasCar(!hasCar)}
                onKeyDown={(e) => e.key === 'Enter' && setHasCar(!hasCar)}
                className={cn("flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500", hasCar ? "bg-emerald-50 border-emerald-500/30" : "bg-white border-emerald-50")}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", hasCar ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600")}>
                  <Car className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-emerald-950 text-sm">Car Parking Slot</p>
                  <p className="text-[10px] font-bold text-emerald-900/40 uppercase">Strictly 1 slot only</p>
                </div>
                <Checkbox checked={hasCar} className="rounded-md h-5 w-5 border-emerald-200" />
              </div>

              <div className="flex gap-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setHasPWD(!hasPWD)}
                  onKeyDown={(e) => e.key === 'Enter' && setHasPWD(!hasPWD)}
                  className={cn("flex-1 p-4 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500", hasPWD ? "bg-emerald-50 border-emerald-500/30" : "bg-white border-emerald-50")}
                >
                  <Checkbox checked={hasPWD} className="rounded-md border-emerald-200" />
                  <span className="font-black text-emerald-950 text-xs tracking-tighter uppercase whitespace-nowrap">PWD / Senior</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setHasPet(!hasPet)}
                  onKeyDown={(e) => e.key === 'Enter' && setHasPet(!hasPet)}
                  className={cn("flex-1 p-4 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500", hasPet ? "bg-emerald-50 border-emerald-500/30" : "bg-white border-emerald-50")}
                >
                  <Checkbox checked={hasPet} className="rounded-md border-emerald-200" />
                  <span className="font-black text-emerald-950 text-xs tracking-tighter uppercase whitespace-nowrap">Pet Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-950 p-6 rounded-[2rem] text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-60 mb-1">Reservation Summary</p>
            <h4 className="text-xl font-black tracking-tight">{nights} Nights • {adults + kids} Guests</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 px-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-1">Primary Guest</Label>
              <Input className="h-14 rounded-2xl border-emerald-100 bg-emerald-50/50 font-bold px-5" placeholder="John Doe" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div className="space-y-2 px-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-1">Mobile Contact</Label>
              <Input className="h-14 rounded-2xl border-emerald-100 bg-emerald-50/50 font-bold px-5" placeholder="09XX XXX XXXX" value={guestMobile} onChange={(e) => setGuestMobile(e.target.value)} />
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-[2rem] border-2 border-amber-100/50">
            <Checkbox
              id="terms_new"
              checked={termsAccepted}
              onCheckedChange={(c) => setTermsAccepted(!!c)}
              className="mt-1 border-amber-300"
            />
            <Label htmlFor="terms_new" className="text-xs font-bold text-amber-900/60 leading-relaxed cursor-pointer">
              I have read the house rules and explicitly acknowledge that the reservation downpayment is non-refundable.
            </Label>
          </div>
        </div>
      )}

      {totalPrice > 0 && (
        <div className="bg-[#f2f4f2] p-6 rounded-[2rem] space-y-4 mt-8">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-950/40">Securing Deposit</span>
            <span className="text-2xl font-black text-emerald-950 tracking-tighter">{formatMoney(downPayment)}</span>
          </div>
          <Separator className="bg-emerald-100/30" />
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-500">Remaining Balance</span>
            <span className="font-black text-emerald-950">{formatMoney(totalPrice - downPayment)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center gap-3 text-red-600 font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  )

  const ActionButtons = () => (
    <div className="pt-4 flex gap-3">
      {step === 2 && (
        <Button
          variant="ghost"
          className="h-16 rounded-[1.5rem] px-6 text-emerald-950/40 font-black uppercase tracking-widest text-xs"
          onClick={() => setStep(1)}
        >
          Back
        </Button>
      )}
      <Button
        className="flex-1 h-16 rounded-[1.5rem] bg-emerald-950 hover:bg-emerald-900 text-white font-black text-lg border-b-4 border-emerald-800 transition-all active:translate-y-0.5"
        disabled={step === 1 ? (!date?.from || !date?.to || (adults + kids) > pricing.maxPax) : (!guestName || !guestMobile || !termsAccepted || isSubmitting)}
        onClick={step === 1 ? () => setStep(2) : handlePayment}
      >
        {isSubmitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            {step === 1 ? 'Go to Details' : 'Confirm & Pay'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop View: Classic Sticky Card */}
      <div className="hidden lg:block w-full">
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-emerald-900/5 bg-white p-2">
          <div className="p-8 pb-0">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-800/60 ml-1 mb-2">Reservation Hub</p>
            <h3 className="text-4xl font-black text-emerald-950 tracking-tighter">Secure Your Date</h3>
          </div>
          <div className="p-8 pt-0 flex flex-col min-h-[500px]">
            <FormContent />
            <ActionButtons />
          </div>
        </Card>
      </div>

      {/* Mobile View: Floating Sticky Footer + Bottom Sheet */}
      <div className="lg:hidden">
        {/* Sticky Mobile Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-xl border-t border-emerald-50 px-6 pb-8">
          <div className="max-w-md mx-auto flex items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/60 mb-0.5">Starting from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-950 tracking-tighter">{formatMoney(pricing.basePrice)}</span>
                <span className="text-xs font-bold text-gray-400">/ night</span>
              </div>
            </div>

            <Drawer.Root>
              <Drawer.Trigger asChild>
                <Button className="h-14 px-8 rounded-2xl bg-emerald-950 text-white font-black border-b-4 border-emerald-800 transition-all active:translate-y-0.5 active:border-b-0 shadow-lg shadow-emerald-900/20">
                  Check Availability
                </Button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
                <Drawer.Content className="bg-white flex flex-col rounded-t-[3rem] h-[92vh] fixed bottom-0 left-0 right-0 z-[201] outline-none">
                  <div className="p-4 bg-white rounded-t-[3rem] flex-1 flex flex-col overflow-hidden">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8" />

                    <div className="flex-1 overflow-y-auto px-4 pb-12 custom-scrollbar">
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-800/60 ml-0.5">Booking Step {step} of 2</p>
                          <Drawer.Title asChild>
                            <h2 className="text-4xl font-black text-emerald-950 tracking-tighter">Reserve your stay</h2>
                          </Drawer.Title>
                          <Drawer.Description className="sr-only">
                            Fill in the details below to complete your booking at Globit Transient.
                          </Drawer.Description>
                        </div>
                        <FormContent />
                        <div className="h-20" /> {/* Spacer for thumb zone */}
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-white">
                      <div className="max-w-md mx-auto">
                        <ActionButtons />
                      </div>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>
      </div>
    </>
  )
}
