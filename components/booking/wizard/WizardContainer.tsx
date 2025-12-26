"use client"

import * as React from "react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Unit } from "@prisma/client"

import { PaxInput } from "./PaxInput"
import { DateSelect } from "./DateSelect"
import { TopPickCard } from "./TopPickCard"
import { StandardUnitList } from "./StandardUnitList"

interface WizardContainerProps {
  initialUnits: Unit[]
}

type WizardStep = "pax" | "dates" | "results"

export function WizardContainer({ initialUnits }: WizardContainerProps) {
  const [step, setStep] = useState<WizardStep>("pax")
  
  // Wizard State
  const [pax, setPax] = useState<number>(2)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  })

  // Results State
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])

  const handlePaxNext = () => {
    setStep("dates")
  }

  const handleDateBack = () => {
    setStep("pax")
  }

  const handleSkip = () => {
    // Show all units, prioritized by our "Top Pick" logic
    const sorted = sortUnits(initialUnits);
    setFilteredUnits(sorted);
    setStep("results");
  }

  const handleFindStay = () => {
    // In a real app, you would filter by availability here.
    // For now, we just pass the sorted list.
    const sorted = sortUnits(initialUnits);
    setFilteredUnits(sorted)
    setStep("results")
  }

  // Utility to always show Top Picks first
  const sortUnits = (units: Unit[]) => {
    return [...units].sort((a, b) => {
        const isAPremium = ['big-house', 'veranda-unit'].includes(a.slug);
        const isBPremium = ['big-house', 'veranda-unit'].includes(b.slug);
        return (isAPremium === isBPremium) ? 0 : isAPremium ? -1 : 1;
    });
  }

  // Render Results View
  if (step === "results") {
    const topPicks = filteredUnits.filter(u => ['big-house', 'veranda-unit'].includes(u.slug))
    const others = filteredUnits.filter(u => !['big-house', 'veranda-unit'].includes(u.slug))

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center"
        >
            <div>
                <div className="text-xs text-gray-500 font-medium">Your Stay</div>
                <div className="font-bold text-gray-900">
                    {pax} Guests • {dateRange?.to ? `${dateRange.to.getDate() - (dateRange.from?.getDate() || 0)} Nights` : 'Dates not set'}
                </div>
            </div>
            <button onClick={() => setStep("pax")} className="text-emerald-600 text-sm font-semibold">Edit</button>
        </motion.div>

        <div className="p-4 max-w-md mx-auto">
             <div className="mb-4 mt-2 text-sm font-bold text-gray-400 tracking-wider uppercase">Top Picks For You</div>
             {topPicks.map((unit, idx) => (
                 <TopPickCard key={unit.id} unit={unit} index={idx} />
             ))}
             
             {others.length > 0 && <StandardUnitList units={others} />}
        </div>
      </div>
    )
  }

  // Render Wizard Steps
  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto">
      <AnimatePresence mode="wait" initial={false}>
        {step === "pax" && (
          <motion.div
            key="pax"
            className="w-full h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PaxInput 
                value={pax} 
                onChange={setPax} 
                onNext={handlePaxNext} 
                onSkip={handleSkip} 
            />
          </motion.div>
        )}

        {step === "dates" && (
          <motion.div
             key="dates"
             className="w-full h-full"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             transition={{ duration: 0.3 }}
          >
            <DateSelect 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
                onNext={handleFindStay}
                onBack={handleDateBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}