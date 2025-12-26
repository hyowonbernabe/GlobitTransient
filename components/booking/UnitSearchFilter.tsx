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
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer } from 'vaul'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function UnitSearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [date, setDate] = useState<DateRange | undefined>()
  const [pax, setPax] = useState('2')
  const [isVisible, setIsVisible] = useState(true)
  const [isOpening, setIsOpening] = useState(false)

  // Initialize from URL
  useEffect(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const guests = searchParams.get('pax')

    if (from && to) setDate({ from: new Date(from), to: new Date(to) })
    if (guests) setPax(guests)
  }, [searchParams])

  // Scroll Direction Detection
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (date?.from) params.set('from', date.from.toISOString())
    if (date?.to) params.set('to', date.to.toISOString())
    if (pax) params.set('pax', pax)
    router.push(`/book?${params.toString()}`)
    setIsOpening(false)
  }

  const handleClear = () => {
    setDate(undefined)
    setPax('2')
    router.push('/book')
  }

  const dateDisplay = date?.from
    ? (date.to ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d")}` : format(date.from, "MMM d"))
    : "Select Dates"

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            className="w-full"
          >
            <Drawer.Root open={isOpening} onOpenChange={setIsOpening}>
              <Drawer.Trigger asChild>
                <button
                  className="w-full bg-emerald-950 text-white rounded-full p-1 shadow-2xl shadow-emerald-900/40 border-b-4 border-emerald-800 transition-all active:translate-y-0.5 active:border-b-0 flex items-center gap-3 pr-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none mb-0.5">Booking Search</p>
                    <p className="text-xs font-bold text-white truncate">{dateDisplay} • {pax || 2} Guests</p>
                  </div>
                </button>
              </Drawer.Trigger>

              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
                <Drawer.Content className="bg-white flex flex-col rounded-t-[2.5rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[201] outline-none">
                  <div className="p-4 bg-white rounded-t-[2.5rem] flex-1">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8" />

                    <div className="max-w-md mx-auto space-y-8 px-2">
                      <div className="space-y-2">
                        <Drawer.Title asChild>
                          <h2 className="text-3xl font-black text-emerald-950 tracking-tighter">Plan your stay</h2>
                        </Drawer.Title>
                        <Drawer.Description asChild>
                          <p className="text-gray-500 font-medium">Select dates and guest count to find available units.</p>
                        </Drawer.Description>
                      </div>

                      <div className="space-y-6 pt-4">
                        {/* Pax Selector */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 ml-1">Guests</Label>
                          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <Input
                              type="number"
                              min={1}
                              className="flex-1 bg-transparent border-none text-xl font-black text-emerald-950 focus-visible:ring-0 p-0"
                              value={pax}
                              onChange={(e) => setPax(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Calendar Placeholder / Component */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60 ml-1">Dates</Label>
                          <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-2">
                            <Calendar
                              mode="range"
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={1}
                              className="mx-auto rounded-2xl"
                              disabled={(date) => date < new Date()}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 flex gap-3">
                        <Button
                          variant="ghost"
                          className="h-16 rounded-2xl px-6 text-gray-500 font-black uppercase tracking-widest text-xs"
                          onClick={handleClear}
                        >
                          Reset
                        </Button>
                        <Button
                          className="flex-1 h-16 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-lg rounded-2xl border-b-4 border-emerald-800 transition-all active:translate-y-0.5"
                          onClick={handleSearch}
                        >
                          Explore Available Rooms
                        </Button>
                      </div>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
