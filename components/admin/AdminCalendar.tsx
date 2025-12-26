'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isWithinInterval,
  addMonths,
  subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking {
  id: string
  checkIn: Date
  checkOut: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  guestName: string | null
  unitId: string
}

interface Unit {
  id: string
  name: string
}

interface AdminCalendarProps {
  bookings: Booking[]
  units: Unit[]
}

export function AdminCalendar({ bookings, units }: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL')

  // Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const jumpToToday = () => setCurrentDate(new Date())

  // Grid Generation
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Data Filtering
  const filteredBookings = bookings.filter(b =>
    b.status !== 'CANCELLED' &&
    (selectedUnit === 'ALL' || b.unitId === selectedUnit)
  )

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter(b =>
      isWithinInterval(day, { start: b.checkIn, end: b.checkOut })
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span>{format(currentDate, 'MMMM yyyy')}</span>
          </CardTitle>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={jumpToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Units</SelectItem>
                {units.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: any) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}

            {/* Empty cells for start of month offset could be added here, simplified for now */}
            {daysInMonth.map((day: any, idx: number) => {
              const dayBookings = getBookingsForDay(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white min-h-[120px] p-2 border-t border-l ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''}`}
                >
                  <div className={`text-right text-sm font-medium mb-1 ${isToday(day) ? 'text-emerald-600 font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking: any) => (
                      <div
                        key={booking.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        title={booking.guestName || 'Guest'}
                      >
                        {booking.guestName || 'Guest'}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        + {dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile List View (Calendar Grids are terrible on mobile) */}
          <div className="md:hidden space-y-4">
            {daysInMonth.map((day: any) => {
              const dayBookings = getBookingsForDay(day)
              // Only show days with bookings or today
              if (dayBookings.length === 0 && !isToday(day)) return null

              return (
                <div key={day.toISOString()} className={`rounded-lg border p-3 ${isToday(day) ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">{format(day, 'EEE, MMM d')}</span>
                    {isToday(day) && <Badge className="bg-emerald-600">Today</Badge>}
                  </div>
                  {dayBookings.length > 0 ? (
                    <div className="space-y-2">
                      {dayBookings.map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-100 shadow-sm">
                          <span className="font-medium truncate max-w-[150px]">{booking.guestName}</span>
                          <Badge variant="outline" className={
                            booking.status === 'CONFIRMED' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No bookings</p>
                  )}
                </div>
              )
            })}
            {/* Fallback if list is empty */}
            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">No bookings found for this month.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}