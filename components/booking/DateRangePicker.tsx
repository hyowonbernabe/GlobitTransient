'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    blockedDates?: DateRange[]
}

export function DateRangePicker({
    className,
    date,
    setDate,
    blockedDates = []
}: DateRangePickerProps) {

    // Disable past dates and blocked dates
    const disabledDays = [
        { before: new Date() },
        ...blockedDates
    ]

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal h-12 text-base",
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
                                format(date.from, "MMM dd")
                            )
                        ) : (
                            <span>Select Check-in - Check-out</span>
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
                        disabled={disabledDays}
                        modifiers={{ blocked: blockedDates }}
                        modifiersClassNames={{
                            blocked: "bg-red-50 text-red-600 decoration-red-500 line-through opacity-100 hover:bg-red-100 font-medium"
                        }}
                    />
                    {/* Legend */}
                    <div className="p-3 border-t border-gray-100 flex gap-4 text-[10px] text-gray-500 justify-center flex-wrap">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full border border-gray-300 bg-white"></div>
                            Available
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                            Selected
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-100 border border-red-200"></div>
                            <span className="text-red-600 font-medium">Booked/Unavailable</span>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
