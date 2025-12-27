'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PaxCounterProps {
    value: number
    onChange: (val: number) => void
    max: number
    min?: number
    label?: string
}

export function PaxCounter({ value, onChange, max, min = 1, label = "Guests" }: PaxCounterProps) {

    const handleIncrement = () => {
        if (value < max) onChange(value + 1)
    }

    const handleDecrement = () => {
        if (value > min) onChange(value - 1)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value)
        if (isNaN(val)) return // Ignore non-numbers
        if (val > max) {
            onChange(max)
        } else if (val < min) {
            // Allow typing, but blur will fix or submit validation will catch. 
            // For now, let's auto-correct empty or 0 to min immediately to be safe
            onChange(val <= 0 ? min : val);
        } else {
            onChange(val)
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 flex justify-between">
                <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    {label}
                </span>
                <span className="text-xs font-normal text-gray-400">
                    Max {max}
                </span>
            </label>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shrink-0"
                    onClick={handleDecrement}
                    disabled={value <= min}
                >
                    <Minus className="w-5 h-5" />
                </Button>

                <div className="flex-1 relative">
                    <Input
                        className="h-12 text-center text-lg font-bold border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={value}
                        onChange={handleInputChange}
                        type="number"
                        min={min}
                        max={max}
                    />
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shrink-0"
                    onClick={handleIncrement}
                    disabled={value >= max}
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
            <p className="text-[10px] text-gray-500 px-1">
                Children under 4 stay free.
            </p>
        </div>
    )
}
