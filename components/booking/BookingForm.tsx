'use client'

import { useState, useEffect } from 'react'
import { format, differenceInCalendarDays, addDays, areIntervalsOverlapping, isAfter } from "date-fns"
import { Car, AlertCircle, ArrowLeft, Loader2, CreditCard, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type DateRange } from "react-day-picker"
import { createBooking } from "@/server/actions/booking"
import { initiateCheckout } from "@/server/actions/gateway"
import { useRouter, useSearchParams } from "next/navigation"

// New Components
import { DateRangePicker } from "./DateRangePicker"
import { PaxCounter } from "./PaxCounter"
import { normalizeMobilePH } from "@/lib/utils/phone"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

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
  carBlockedDates?: DateRange[]
}

export function BookingForm({ pricing, blockedDates = [], carBlockedDates = [] }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Step 1: Dates & Config
  // Initialize from URL params if available
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const fromParam = searchParams.get('checkIn')
    const toParam = searchParams.get('checkOut')
    if (fromParam && toParam) {
      return { from: new Date(fromParam), to: new Date(toParam) }
    }
    return undefined
  })

  // Pax: Single counter, defaults to 2 if not in URL
  const [pax, setPax] = useState<number>(() => {
    const paxParam = searchParams.get('pax')
    return paxParam ? parseInt(paxParam) : 2
  })

  const [hasCar, setHasCar] = useState(false)
  const [hasPet, setHasPet] = useState(false)
  const [hasPWD, setHasPWD] = useState(false)

  // Step 2: Guest Details
  const [guestName, setGuestName] = useState("")
  const [guestMobile, setGuestMobile] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [findOwnParking, setFindOwnParking] = useState(false)

  // Parking Logic
  const [isParkingBlocked, setIsParkingBlocked] = useState(false)
  const [conflictingParkingDates, setConflictingParkingDates] = useState<DateRange[]>([])
  const [nextAvailableParking, setNextAvailableParking] = useState<Date | null>(null)

  // Parking Pagination (See More)
  const [visibleBlockedCount, setVisibleBlockedCount] = useState(3)

  useEffect(() => {
    if (!date?.from || !date?.to) {
      setIsParkingBlocked(false)
      return
    }

    const checkInterval = { start: date.from, end: date.to }
    const conflicts = carBlockedDates.filter(blocked =>
      areIntervalsOverlapping(
        { start: blocked.from!, end: blocked.to! },
        checkInterval,
        { inclusive: true }
      )
    )

    if (conflicts.length > 0) {
      setIsParkingBlocked(true)
      setHasCar(false) // Force disable
      setConflictingParkingDates(conflicts)

      // Calculate next available (simple heuristic: day after last conflict end)
      const lastConflictEnd = conflicts.reduce((max, curr) =>
        isAfter(curr.to!, max) ? curr.to! : max
        , conflicts[0].to!)

      setNextAvailableParking(addDays(lastConflictEnd, 1))
    } else {
      setIsParkingBlocked(false)
    }
  }, [date, carBlockedDates])

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    // Pax Logic
    const extraPax = Math.max(0, pax - pricing.basePax)
    const nightlyRate = pricing.basePrice + (extraPax * pricing.extraPaxPrice)

    let total = nightlyRate * calculatedNights

    // Discount
    if (hasPWD) {
      total = total * 0.8
    }

    const roundedTotal = Math.round(total)
    setTotalPrice(roundedTotal)

    // Tiered Downpayment (Updated)
    // < 5000 = 500
    // 5000 - 9999 = 1000
    // >= 10000 = 1500
    let dp = 50000
    if (roundedTotal >= 1000000) { // 10k in cents
      dp = 150000
    } else if (roundedTotal >= 500000) { // 5k in cents
      dp = 100000
    } else {
      dp = 50000 // Less than 5k -> 500
    }

    setDownPayment(dp)

    // Animate price change (Simple GSAP trigger if element exists)
    gsap.fromTo("#total-price",
      { scale: 1.2, color: "#10b981" },
      { scale: 1, color: "#064e3b", duration: 0.4, ease: "power2.out" }
    )

  }, [date, pax, pricing, hasPWD])

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  const handlePayment = async () => {
    // 1. Reset Errors
    setErrors({})
    setServerError(null)

    // 2. Client-Side Validation
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Name Validation
    const nameTrimmed = guestName.trim()
    if (nameTrimmed.length < 2) {
      newErrors.guestName = "Name must be at least 2 characters."
      isValid = false
    } else if (/^\d+$/.test(nameTrimmed)) {
      newErrors.guestName = "Name cannot contain only numbers."
      isValid = false
    }

    // Mobile Validation
    const normalizedMobile = normalizeMobilePH(guestMobile)
    if (!normalizedMobile) {
      newErrors.guestMobile = "Enter a valid PH mobile number (e.g. 09171234567)."
      isValid = false
    }

    // Email Validation (Optional)
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      newErrors.guestEmail = "Enter a valid email address."
      isValid = false
    }

    // Terms Validation
    if (!termsAccepted) {
      // No visual error text needed often, just shaker or tooltip, but let's set it
      newErrors.terms = "You must agree to the House Rules."
      isValid = false
    }

    if (!isValid) {
      setErrors(newErrors)
      // Trigger shake animation on form (if we had a ref)
      return
    }

    setIsSubmitting(true)

    // 3. Create Pending Booking
    // Note: Backend expects adults/kids. We map `pax` to `adults` and set `kids`=0 for compatibility.
    // This assumes the backend logic uses adults+kids for total pax which it does.
    const bookingResult = await createBooking({
      unitId: pricing.id,
      checkIn: date!.from!,
      checkOut: date!.to!,
      pax: pax,
      hasCar,
      hasPet,
      hasPWD,
      guestName: nameTrimmed,
      guestMobile: normalizedMobile!, // Safe bang because we validated
      guestEmail: guestEmail || undefined
    })

    if (bookingResult.error || !bookingResult.bookingId) {
      setServerError(bookingResult.error || "Failed to create reservation.")
      setIsSubmitting(false)
      return
    }

    // 4. Initiate Payment Gateway
    const checkoutResult = await initiateCheckout(bookingResult.bookingId)

    if (checkoutResult.error) {
      setServerError(checkoutResult.error)
      setIsSubmitting(false)
    } else if (checkoutResult.url) {
      router.push(checkoutResult.url)
    }
  }

  const disabledDays = [
    { before: new Date() },
    ...blockedDates
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
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-500">Dates</Label>
              <DateRangePicker
                date={date}
                setDate={setDate}
                blockedDates={blockedDates}
              />
            </div>

            <Separator />

            <div>
              <PaxCounter
                value={pax}
                onChange={setPax}
                min={1}
                max={pricing.maxPax}
                label="Guest Count"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-4">
                {/* Parking Logic Block */}
                {!isParkingBlocked ? (
                  // SCENARIO A: Parking Available
                  <div className={cn("flex items-start space-x-2 p-3 rounded-lg border", hasCar ? "bg-emerald-50 border-emerald-200" : "border-gray-100")}>
                    <Checkbox
                      id="car"
                      checked={hasCar}
                      onCheckedChange={(c) => {
                        setHasCar(!!c)
                        if (c) setFindOwnParking(false) // Mutually exclusive (safety)
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="car" className="text-sm font-medium leading-none flex items-center gap-2">
                        <Car className="w-3 h-3" /> Bringing a Car?
                      </Label>
                      <p className="text-xs text-gray-500">Strictly 1 slot only.</p>
                    </div>
                  </div>
                ) : (
                  // SCENARIO B: Parking Blocked
                  <div className="space-y-3">
                    {/* Disabled State Info */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 opacity-75">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Car className="w-4 h-4" />
                        <span className="text-sm font-medium line-through">Bringing a Car?</span>
                      </div>
                      <p className="text-xs text-red-500 font-medium">
                        Parking is unavailable for your selected dates.
                      </p>

                      {/* Blocked Dates List */}
                      <div className="bg-white p-2 rounded border border-gray-100 space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Blocked Dates:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {conflictingParkingDates.slice(0, visibleBlockedCount).map((range, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{format(range.from!, "MMM dd")} - {format(range.to!, "MMM dd")}</span>
                            </li>
                          ))}
                        </ul>
                        {conflictingParkingDates.length > visibleBlockedCount && (
                          <button
                            onClick={() => setVisibleBlockedCount(c => c + 3)}
                            className="text-[10px] text-emerald-600 font-bold hover:underline w-full text-left"
                          >
                            + See {conflictingParkingDates.length - visibleBlockedCount} more
                          </button>
                        )}
                        {nextAvailableParking && (
                          <div className="pt-2 mt-1 border-t border-gray-50 text-[10px] text-emerald-700">
                            Next available: <strong>{format(nextAvailableParking, "MMMM dd, yyyy")}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fallback: Find Own Parking */}
                    <div className={cn("flex items-start space-x-2 p-3 rounded-lg border", findOwnParking ? "bg-amber-50 border-amber-200" : "border-gray-100")}>
                      <Checkbox
                        id="own-parking"
                        checked={findOwnParking}
                        onCheckedChange={(c) => setFindOwnParking(!!c)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="own-parking" className="text-sm font-medium leading-none flex items-center gap-2 text-amber-900">
                          Find Your Own Parking
                        </Label>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Still want to bring a car? You may bring your own vehicle, but you will need to find your own parking.
                          We are not liable for anything related to external parking.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pwd" checked={hasPWD} onCheckedChange={(c) => setHasPWD(!!c)} />
                <Label htmlFor="pwd" className="text-sm font-medium">PWD / Senior (20% Off)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pet" checked={hasPet} onCheckedChange={(c) => setHasPet(!!c)} />
                <Label htmlFor="pet" className="text-sm font-medium">Pet (Must wear diaper)</Label>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 mb-4 border border-emerald-100">
                <strong>Reservation for:</strong> {nights} Nights • {pax} Pax
              </div>

              <div className="space-y-1">
                <Label htmlFor="name" className={errors.guestName ? "text-red-600" : ""}>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Juan Dela Cruz"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={errors.guestName ? "border-red-300 focus-visible:ring-red-300 animate-shake" : ""}
                />
                {errors.guestName && <p className="text-xs text-red-600 font-medium">{errors.guestName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="mobile" className={errors.guestMobile ? "text-red-600" : ""}>
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  placeholder="0917 123 4567"
                  type="tel"
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                  className={errors.guestMobile ? "border-red-300 focus-visible:ring-red-300 animate-shake" : ""}
                />
                {errors.guestMobile && <p className="text-xs text-red-600 font-medium">{errors.guestMobile}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className={errors.guestEmail ? "text-red-600" : ""}>
                  Email Address (Optional)
                </Label>
                <Input
                  id="email"
                  placeholder="juan@example.com"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={errors.guestEmail ? "border-red-300 focus-visible:ring-red-300 animate-shake" : ""}
                />
                {errors.guestEmail && <p className="text-xs text-red-600 font-medium">{errors.guestEmail}</p>}
              </div>

              <div className={cn(
                "flex items-start space-x-2 pt-4 p-3 bg-gray-50 rounded-lg border",
                errors.terms ? "border-red-300 bg-red-50" : "border-gray-200"
              )}>
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(!!c)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs text-gray-600 font-normal leading-normal cursor-pointer">
                  I agree to the <a href="/terms" target="_blank" className="font-bold text-emerald-700 hover:underline">Terms and Conditions</a>.
                  <br /><span className="text-[10px] text-gray-400">(Required to proceed)</span>
                </Label>
              </div>
              {errors.terms && <p className="text-xs text-red-600 font-medium px-1">You must agree to the Terms and Conditions.</p>}
            </div>
          </>
        )}

        <div className="bg-emerald-50/50 p-4 rounded-xl space-y-3 border border-emerald-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-emerald-900">Required Downpayment</span>
            <span id="total-price" className="text-xl font-black text-emerald-700">
              {formatMoney(downPayment)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 leading-tight">
            {downPayment > 0
              ? "Pay this now via PayMongo to secure your booking slot instantly."
              : "Select dates to see payment requirements."}
          </p>

          <Separator className="bg-emerald-100" />

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Balance at Check-in</span>
            <span className="font-bold text-gray-900">{formatMoney(Math.max(0, totalPrice - downPayment))}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span>Total Bill</span>
            <span>{formatMoney(totalPrice)}</span>
          </div>
          {hasPWD && (
            <div className="flex justify-between items-center text-[10px] text-orange-600 font-bold">
              <span>PWD/Senior Discount Applied</span>
              <span>-20%</span>
            </div>
          )}
        </div>

        {serverError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{serverError}</span>
          </div>
        )}

      </CardContent>

      <CardFooter>
        {step === 1 ? (
          <Button
            className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
            disabled={!date?.from || !date?.to || pax > pricing.maxPax}
            onClick={() => setStep(2)}
          >
            {date?.from ? 'Proceed to Details' : 'Select Dates'}
          </Button>
        ) : (
          <Button
            className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
            disabled={isSubmitting}
            onClick={handlePayment}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Securing Slot...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Pay Securely
              </>
            )}
          </Button>
        )}


      </CardFooter>
    </Card>
  )
}