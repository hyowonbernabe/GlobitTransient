"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Unit } from "@prisma/client"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

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

  // GSAP Scope Ref
  const containerRef = useRef<HTMLDivElement>(null)

  // GSAP Animation for Results Reveal
  useGSAP(() => {
    if (step === "results") {
      // 1. Reveal Header
      gsap.fromTo(".results-header", 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      )

      // 2. Stagger Top Picks (The Reveal)
      gsap.to(".top-pick-card", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2, // 200ms delay between cards
        ease: "power3.out",
        delay: 0.1
      })
      
      // 3. Reveal "More Options" list
      gsap.to(".standard-list-entry", {
         y: 0,
         opacity: 1,
         duration: 0.6,
         stagger: 0.05,
         ease: "power2.out",
         delay: 0.5 // Start after top picks are mostly visible
      })
    }
  }, { dependencies: [step], scope: containerRef })

  const handlePaxNext = () => setStep("dates")
  const handleDateBack = () => setStep("pax")

  const handleSkip = () => {
    const sorted = sortUnits(initialUnits);
    setFilteredUnits(sorted);
    setStep("results");
  }

  const handleFindStay = () => {
    const sorted = sortUnits(initialUnits);
    setFilteredUnits(sorted)
    setStep("results")
  }

  // Helper: Prioritize "Big House" and "Veranda"
  const sortUnits = (units: Unit[]) => {
    return [...units].sort((a, b) => {
        const isAPremium = ['big-house', 'veranda-unit'].includes(a.slug);
        const isBPremium = ['big-house', 'veranda-unit'].includes(b.slug);
        return (isAPremium === isBPremium) ? 0 : isAPremium ? -1 : 1;
    });
  }

  // --- RENDER: RESULTS VIEW ---
  if (step === "results") {
    const topPicks = filteredUnits.filter(u => ['big-house', 'veranda-unit'].includes(u.slug))
    const others = filteredUnits.filter(u => !['big-house', 'veranda-unit'].includes(u.slug))

    return (
      <div ref={containerRef} className="min-h-screen bg-gray-50 pb-20">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 p-4 shadow-sm results-header">
            <div className="flex justify-between items-center max-w-md mx-auto w-full">
                <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your Stay</div>
                    <div className="font-bold text-gray-900 text-sm">
                        {pax} Guests • {dateRange?.to ? `${dateRange.to.getDate() - (dateRange.from?.getDate() || 0)} Nights` : 'Flexible Dates'}
                    </div>
                </div>
                <button 
                  onClick={() => setStep("pax")} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                >
                  Edit
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 max-w-md mx-auto">
             <div className="mb-6 mt-2 flex items-center gap-2 opacity-0 top-pick-card translate-y-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">Recommended</div>
             </div>
             
             {/* Render Top Picks */}
             {topPicks.map((unit, idx) => (
                 <TopPickCard key={unit.id} unit={unit} index={idx} />
             ))}
             
             {/* Render Remaining Units */}
             {others.length > 0 && <StandardUnitList units={others} />}
        </div>
      </div>
    )
  }

  // --- RENDER: WIZARD STEPS ---
  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-md mx-auto w-full">
      <AnimatePresence mode="wait" initial={false}>
        {step === "pax" && (
          <motion.div
            key="pax"
            className="w-full h-full flex flex-col"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom ease
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
             className="w-full h-full flex flex-col"
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -50 }}
             transition={{ duration: 0.4, ease: "circOut" }}
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