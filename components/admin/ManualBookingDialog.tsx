'use client'

import { useState } from 'react'
import { createManualBooking, blockUnitDates } from '@/server/actions/booking-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertCircle, Calendar as CalendarIcon, Loader2, Plus, Lock, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { type DateRange } from "react-day-picker"

interface Unit {
  id: string
  name: string
}

export function ManualBookingDialog({ units }: { units: Unit[] }) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'book' | 'block'>('book')
  
  // Shared Form State
  const [unitId, setUnitId] = useState<string>('')
  const [date, setDate] = useState<DateRange | undefined>()
  const [notes, setNotes] = useState('')

  // Booking Specific
  const [guestName, setGuestName] = useState('')
  const [amount, setAmount] = useState('')

  // Blocking Specific
  const [reason, setReason] = useState('Maintenance')

  async function handleBook() {
    if (!unitId || !date?.from || !date?.to || !guestName) {
      setError("Please fill in Unit, Dates, and Guest Name.")
      return
    }
    submitAction(createManualBooking, { guestName, amount })
  }

  async function handleBlock() {
    if (!unitId || !date?.from || !date?.to || !reason) {
      setError("Please fill in Unit, Dates, and Reason.")
      return
    }
    submitAction(blockUnitDates, { reason })
  }

  async function submitAction(
    action: (fd: FormData) => Promise<{ error?: string; success?: boolean }>, 
    extraData: Record<string, string>
  ) {
    setIsSaving(true)
    setError(null)

    const formData = new FormData()
    formData.append('unitId', unitId)
    // @ts-ignore
    formData.append('checkIn', date.from.toISOString())
    // @ts-ignore
    formData.append('checkOut', date.to.toISOString())
    formData.append('notes', notes)
    
    Object.entries(extraData).forEach(([key, val]) => formData.append(key, val))
    
    const result = await action(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsSaving(false)
    } else {
      setOpen(false)
      setIsSaving(false)
      resetForm()
    }
  }

  function resetForm() {
    setUnitId('')
    setDate(undefined)
    setGuestName('')
    setAmount('')
    setNotes('')
    setReason('Maintenance')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" />
          <span>Actions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Calendar Actions</DialogTitle>
          <DialogDescription>
            Register a walk-in guest or block dates for maintenance.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="book" onValueChange={(v) => setMode(v as 'book' | 'block')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="book" className="flex gap-2">
              <UserPlus className="w-4 h-4" /> Manual Book
            </TabsTrigger>
            <TabsTrigger value="block" className="flex gap-2">
              <Lock className="w-4 h-4" /> Block Dates
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit <span className="text-red-500">*</span></Label>
              <Select onValueChange={setUnitId} value={unitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Dates <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                        </>
                      ) : (
                        format(date.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            <TabsContent value="book" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="guestName">Guest Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="guestName" 
                    placeholder="Juan Dela Cruz" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (PHP)</Label>
                  <Input 
                    id="amount" 
                    type="number"
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="block" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Blocking</Label>
                <Select onValueChange={setReason} value={reason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance">Maintenance / Repairs</SelectItem>
                    <SelectItem value="Owner Use">Owner Use</SelectItem>
                    <SelectItem value="Cleaning">Deep Cleaning</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                placeholder={mode === 'book' ? "Payment details..." : "Additional details..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2 mb-4 mt-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button 
              type="submit" 
              disabled={isSaving} 
              onClick={mode === 'book' ? handleBook : handleBlock} 
              className={mode === 'book' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                mode === 'book' ? 'Confirm Booking' : 'Block Dates'
              )}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}