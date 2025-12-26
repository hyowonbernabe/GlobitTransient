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

  const totalPrice = Math.round(total)

  // New Tiers:
  // < 5000 (500,000) = 500 DP (50,000)
  // 5000-10000 (500k-1M) = 1000 DP (100,000)
  // > 10000 (1M) = 1500 DP (150,000)
  let downPayment = 50000
  if (totalPrice >= 1000000) {
    downPayment = 150000
  } else if (totalPrice >= 500000) {
    downPayment = 100000
  }

  return {
    totalPrice,
    downPayment,
    nights,
    nightlyRate
  }
}