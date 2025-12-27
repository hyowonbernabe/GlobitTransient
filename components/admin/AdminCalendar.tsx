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
  subMonths,
  getDay,
  startOfWeek
} from 'date-fns'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Booking {
  id: string
  checkIn: Date
  checkOut: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  guestName: string | null
  unitId: string
  pax?: number
}

interface Unit {
  id: string
  name: string
  capacity?: number
}

interface AdminCalendarProps {
  bookings: Booking[]
  units: Unit[]
}

// Unit color mapping - consistent colors per unit
const UNIT_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
]

export function AdminCalendar({ bookings, units }: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const jumpToToday = () => setCurrentDate(new Date())

  // Grid Generation
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get color for unit
  const getUnitColor = (unitId: string) => {
    const index = units.findIndex(u => u.id === unitId)
    return UNIT_COLORS[index % UNIT_COLORS.length]
  }

  // Data Filtering
  const filteredBookings = bookings.filter(b =>
    b.status !== 'CANCELLED' &&
    (selectedUnit === 'ALL' || b.unitId === selectedUnit)
  )

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter(b =>
      isWithinInterval(day, { start: new Date(b.checkIn), end: new Date(b.checkOut) })
    )
  }

  const getTotalPaxForDay = (day: Date) => {
    const dayBookings = getBookingsForDay(day)
    return dayBookings.reduce((sum, b) => sum + (b.pax || 0), 0)
  }

  const getUnitForBooking = (unitId: string) => {
    return units.find(u => u.id === unitId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          </div>

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
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}

            {/* Add empty cells for start offset */}
            {Array.from({ length: getDay(monthStart) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-gray-50 min-h-[120px]" />
            ))}

            {daysInMonth.map((day) => {
              const dayBookings = getBookingsForDay(day)
              const totalPax = getTotalPaxForDay(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white min-h-[120px] p-2 border-t border-l ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''
                    }`}
                >
                  <div className={`text-right text-sm font-medium mb-1 ${isToday(day) ? 'text-emerald-600 font-bold' : ''
                    }`}>
                    {format(day, 'd')}
                  </div>

                  {/* Capacity Indicator */}
                  {totalPax > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                      <Users className="w-3 h-3" />
                      <span>{totalPax}</span>
                    </div>
                  )}

                  {/* Bookings */}
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => {
                      const unitColor = getUnitColor(booking.unitId)
                      const unit = getUnitForBooking(booking.unitId)

                      return (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate border ${unitColor.bg} ${unitColor.text} ${unitColor.border} hover:opacity-80 transition-opacity`}
                          title={`${unit?.name} - ${booking.guestName || 'Guest'}`}
                        >
                          {booking.guestName || 'Guest'}
                        </button>
                      )
                    })}
                    {dayBookings.length > 2 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile List View */}
          <div className="md:hidden space-y-3">
            {daysInMonth.map((day) => {
              const dayBookings = getBookingsForDay(day)
              if (dayBookings.length === 0 && !isToday(day)) return null

              return (
                <div
                  key={day.toISOString()}
                  className={`rounded-lg border p-3 ${isToday(day) ? 'bg-emerald-50 border-emerald-200' : 'bg-white'
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">{format(day, 'EEE, MMM d')}</span>
                    {dayBookings.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{getTotalPaxForDay(day)} pax</span>
                      </div>
                    )}
                  </div>

                  {dayBookings.length > 0 ? (
                    <div className="space-y-2">
                      {dayBookings.map((booking) => {
                        const unitColor = getUnitColor(booking.unitId)
                        const unit = getUnitForBooking(booking.unitId)

                        return (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`w-full text-left text-sm p-2 rounded border ${unitColor.bg} ${unitColor.text} ${unitColor.border}`}
                          >
                            <div className="font-medium">{booking.guestName || 'Guest'}</div>
                            <div className="text-xs mt-0.5">{unit?.name}</div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No bookings</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Guest</div>
                <div className="font-medium">{selectedBooking.guestName || 'Walk-in Guest'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Unit</div>
                <div className="font-medium">{getUnitForBooking(selectedBooking.unitId)?.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-500">Check-in</div>
                  <div className="font-medium">{format(new Date(selectedBooking.checkIn), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Check-out</div>
                  <div className="font-medium">{format(new Date(selectedBooking.checkOut), 'MMM d, yyyy')}</div>
                </div>
              </div>
              {selectedBooking.pax && (
                <div>
                  <div className="text-sm text-gray-500">Guests</div>
                  <div className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedBooking.pax} pax
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">
                  <span className={`px-2 py-0.5 rounded text-xs ${selectedBooking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}