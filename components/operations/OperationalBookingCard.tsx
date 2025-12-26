'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Users, Calendar, ArrowRight, ArrowLeft } from "lucide-react"

interface BookingCardProps {
    booking: any
    type: 'IN' | 'OUT'
}

export function OperationalBookingCard({ booking, type }: BookingCardProps) {
    const isCheckIn = type === 'IN'

    return (
        <Card className={`overflow-hidden border-l-4 ${isCheckIn ? 'border-l-emerald-500' : 'border-l-orange-500'} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{booking.unit.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            {isCheckIn ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1 px-1.5">
                                    <ArrowRight className="w-3 h-3" /> Check-in
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100 gap-1 px-1.5">
                                    <ArrowLeft className="w-3 h-3" /> Check-out
                                </Badge>
                            )}
                            <span className="font-mono text-xs text-gray-400">#{booking.id.slice(-6)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{booking.user.name || 'Walk-in Guest'}</div>
                        <a
                            href={`tel:${booking.user.mobile}`}
                            className="text-xs text-emerald-600 hover:underline flex items-center justify-end gap-1 mt-1"
                        >
                            <Phone className="w-3 h-3" />
                            {booking.user.mobile}
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-t border-gray-50">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Group Size</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <span>{booking.adults} Adults, {booking.kids} Kids</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Requested Options</p>
                        <div className="flex gap-2">
                            {booking.hasCar && <Badge className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-50 border-0">Parking</Badge>}
                            {booking.hasPet && <Badge className="text-[10px] bg-purple-50 text-purple-700 hover:bg-purple-50 border-0">Pet</Badge>}
                            {booking.hasPWD && <Badge className="text-[10px] bg-red-50 text-red-700 hover:bg-red-50 border-0">PWD</Badge>}
                            {!booking.hasCar && !booking.hasPet && !booking.hasPWD && <span className="text-xs text-gray-400 italic">None</span>}
                        </div>
                    </div>
                </div>

                {booking.notes && (
                    <div className="mt-3 bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-100 italic">
                        <strong>Notes:</strong> {booking.notes}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
