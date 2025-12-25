import { differenceInCalendarDays } from "date-fns"

interface PricingRules {
  basePrice: number
  basePax: number
  extraPaxPrice: number
  checkIn: Date
  checkOut: Date
  adults: number
  kids: number
  hasPWD: boolean
}

export function calculateBookingPrice(rules: PricingRules) {
  const nights = Math.max(1, differenceInCalendarDays(rules.checkOut, rules.checkIn))
  const paidHeads = rules.adults + rules.kids
  const extraHeads = Math.max(0, paidHeads - rules.basePax)
  
  const nightlyRate = rules.basePrice + (extraHeads * rules.extraPaxPrice)
  let total = nightlyRate * nights
  
  if (rules.hasPWD) {
    total = total * 0.8
  }
  
  return {
    totalPrice: Math.round(total), // Ensure integer (centavos)
    downPayment: Math.round(total * 0.5),
    nights,
    nightlyRate
  }
}