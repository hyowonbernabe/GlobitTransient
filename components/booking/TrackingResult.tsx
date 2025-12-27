'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CreditCard, ArrowRight, User, Home, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Booking, Unit, User as UserType } from '@prisma/client'

// Extended type to include relations
type ExtendedBooking = Booking & {
    unit: Unit
    user: UserType
}

interface TrackingResultProps {
    booking: ExtendedBooking
}

const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

export function TrackingResult({ booking }: TrackingResultProps) {
    const balance = booking.totalPrice - booking.downpayment

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Card className="overflow-hidden border-gray-200 shadow-lg">
                <div className={`h-2 ${booking.status === 'CONFIRMED' ? 'bg-emerald-600' : 'bg-yellow-500'}`} />

                <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Home className="w-4 h-4 text-emerald-600" />
                            {booking.unit.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-3 h-3" />
                            Guest: <span className="font-medium text-gray-900">{booking.user.name || 'Guest'}</span>
                        </div>
                    </div>
                    <Badge variant="outline" className={
                        booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 uppercase tracking-wide' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 uppercase tracking-wide' :
                                'bg-gray-100 text-gray-600 uppercase tracking-wide'
                    }>
                        {booking.status}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50 space-y-2">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                <Calendar className="w-3 h-3" /> Check-in
                            </div>
                            <div>
                                <p className="text-gray-900 font-bold text-lg">{format(new Date(booking.checkIn), 'MMM dd')}</p>
                                <div className="flex items-center gap-1 text-xs text-emerald-600">
                                    <Clock className="w-3 h-3" /> 2:00 PM
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                            <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                <Calendar className="w-3 h-3" /> Check-out
                            </div>
                            <div>
                                <p className="text-gray-900 font-bold text-lg">{format(new Date(booking.checkOut), 'MMM dd')}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" /> 12:00 PM
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Total Booking Value</span>
                            <span className="font-bold text-gray-900">{formatMoney(booking.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-2 mt-2">
                            <span className="text-gray-600 font-medium">Balance Due on Arrival</span>
                            <span className="font-bold text-xl text-emerald-700">{formatMoney(balance)}</span>
                        </div>
                    </div>

                    {booking.status === 'PENDING' && (
                        <Link href={`/payment/${booking.id}`} className="block">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold shadow-lg shadow-emerald-200/50 transition-all hover:-translate-y-0.5">
                                <CreditCard className="w-5 h-5 mr-2" />
                                Complete Downpayment
                            </Button>
                        </Link>
                    )}

                    {booking.status === 'CONFIRMED' && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-start gap-4 shadow-sm">
                            <div className="w-8 h-8 bg-emerald-200/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <ArrowRight className="w-4 h-4 text-emerald-800" />
                            </div>
                            <div>
                                <strong className="block text-emerald-950 mb-1">You are all set!</strong>
                                <p className="text-emerald-800/80 leading-relaxed">
                                    Your slot is secured. Please present a screenshot of this page or your booking reference ID <strong>{booking.id}</strong> upon check-in.
                                </p>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}
