'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, MapPin, Calendar, Receipt } from "lucide-react"
import { format } from "date-fns"
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface BookingSuccessProps {
    booking: {
        id: string
        checkIn: Date
        checkOut: Date
        totalPrice: number
        downpayment: number
        unit: {
            name: string
        }
        user: {
            name: string | null
        }
    }
}

const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

export function BookingSuccess({ booking }: BookingSuccessProps) {
    const { width, height } = useWindowSize()
    const [showConfetti, setShowConfetti] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const timer = setTimeout(() => setShowConfetti(false), 8000) // Stop confetti after 8s
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="w-full max-w-md mx-auto">
            {isMounted && showConfetti && <Confetti width={width} height={height} recycle={true} numberOfPieces={200} />}

            <Card className="text-center p-8 space-y-8 shadow-2xl border-0 ring-1 ring-emerald-100 bg-white/95 backdrop-blur-sm animate-in zoom-in-95 duration-700">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20 duration-1000" />
                    <div className="relative z-10 w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Confirmed!</h1>
                    <p className="text-gray-600">
                        Your slot is officially secured. We're excited to host you!
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Reference Number</p>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 font-mono text-xl font-bold text-emerald-900 select-all break-all shadow-sm">
                        {booking.id}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 text-left">
                    <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200/50 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Reservation Summary</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Unit
                            </span>
                            <span className="text-sm font-bold text-gray-900 text-right max-w-[150px]">{booking.unit.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Dates
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd")}
                            </span>
                        </div>
                        <div className="pt-3 mt-1 border-t border-gray-200 border-dashed flex justify-between items-center text-emerald-700">
                            <span className="text-sm font-medium">Balance due upon arrival</span>
                            <span className="text-lg font-bold">{formatMoney(booking.totalPrice - booking.downpayment)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                    <Mail className="w-4 h-4" />
                    <span>Confirmation email sent to <strong>{booking.user.name || 'you'}</strong>.</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button asChild variant="outline" className="h-12 border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                        <a href="/">Back Home</a>
                    </Button>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 h-12 shadow-lg shadow-emerald-200 text-white font-bold">
                        <a href="/track">Track Booking</a>
                    </Button>
                </div>
            </Card>
        </div>
    )
}
