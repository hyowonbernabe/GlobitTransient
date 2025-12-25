'use server'

import { Resend } from 'resend'
import { BookingConfirmationTemplate } from '@/components/emails/BookingConfirmationTemplate'
import { format } from 'date-fns'

// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingDetails {
  bookingId: string
  guestName: string
  guestEmail: string
  unitName: string
  checkIn: Date
  checkOut: Date
  totalPrice: number
  balance: number
}

export async function sendBookingConfirmation(details: BookingDetails) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Email sending skipped.")
    return { success: false, error: "Configuration Error" }
  }

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Globit Transient <reservations@globit.com>', // You need to verify a domain in Resend dashboard
      to: [details.guestEmail],
      subject: 'Booking Confirmed - Globit Transient Baguio',
      react: BookingConfirmationTemplate({
        guestName: details.guestName,
        unitName: details.unitName,
        checkIn: format(details.checkIn, "MMM dd, yyyy"),
        checkOut: format(details.checkOut, "MMM dd, yyyy"),
        totalPrice: formatMoney(details.totalPrice),
        balance: formatMoney(details.balance),
        bookingId: details.bookingId.slice(-6).toUpperCase() // Show short ID
      }) as React.ReactElement,
    })

    if (error) {
      console.error("Resend API Error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error("Email Server Action Error:", err)
    return { success: false, error: "Internal Server Error" }
  }
}