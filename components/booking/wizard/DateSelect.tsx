import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

interface DateSelectProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  onNext: () => void
  onBack: () => void
}

export function DateSelect({ dateRange, setDateRange, onNext, onBack }: DateSelectProps) {
  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Button>
        <span className="text-sm font-medium text-gray-500">Step 2 of 2</span>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">When are you visiting?</h2>
        <p className="text-gray-500 mt-1">
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
              </>
            ) : (
              format(dateRange.from, "MMM d, yyyy")
            )
          ) : (
            "Select your check-in date"
          )}
        </p>
      </motion.div>

      <div className="flex-1 flex justify-center bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={1}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          className="p-3 w-full max-w-[320px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 mt-auto"
      >
        <Button 
          size="lg" 
          className="w-full h-14 text-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
          onClick={onNext}
          disabled={!dateRange?.from || !dateRange?.to}
        >
          Find My Stay
        </Button>
      </motion.div>
    </div>
  )
}