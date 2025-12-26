'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Search, Users, X } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function UnitSearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [date, setDate] = useState<DateRange | undefined>()
  const [pax, setPax] = useState('')
  const [isOpen, setIsOpen] = useState(false) // For mobile collapsible state if needed, or just standard display

  // Initialize from URL
  useEffect(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const guests = searchParams.get('pax')

    if (from && to) {
      setDate({
        from: new Date(from),
        to: new Date(to)
      })
    }
    if (guests) {
      setPax(guests)
    }
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (date?.from) params.set('from', date.from.toISOString())
    if (date?.to) params.set('to', date.to.toISOString())
    if (pax) params.set('pax', pax)

    router.push(`/book?${params.toString()}`)
  }

  const handleClear = () => {
    setDate(undefined)
    setPax('')
    router.push('/book')
  }

  const hasFilters = date?.from || pax

  return (
    <div className="w-full max-w-4xl mx-auto -mt-8 relative z-10 px-4">
      <Card className="p-4 shadow-xl border-emerald-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Date Picker */}
          <div className="w-full md:flex-1 space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase">Check-in / Check-out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 border-gray-200",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                      </>
                    ) : (
                      format(date.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Select dates...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guest Count */}
          <div className="w-full md:w-48 space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase">Guests</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 h-4 w-4 text-emerald-600" />
              <Input 
                type="number" 
                min={1} 
                placeholder="Pax" 
                className="pl-9 h-12 border-gray-200"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full md:w-auto">
            {hasFilters && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 text-gray-500 hover:text-red-500 hover:bg-red-50"
                onClick={handleClear}
                title="Clear Filters"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
            <Button 
              className="h-12 flex-1 md:w-32 bg-emerald-600 hover:bg-emerald-700 text-base font-semibold shadow-md"
              onClick={handleSearch}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

        </div>
      </Card>
    </div>
  )
}