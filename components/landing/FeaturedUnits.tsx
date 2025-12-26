'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { Users, Wind, CheckCircle, ArrowRight, Star, Heart, Maximize2, Fingerprint } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Unit {
    id: string
    name: string
    slug: string
    description: string
    images: string[]
    basePrice: number
    basePax: number
    maxPax: number
    hasTV: boolean
    hasRef: boolean
    hasHeater: boolean
    hasOwnCR: boolean
}

interface FeaturedUnitsProps {
    units: Unit[]
}

export function FeaturedUnits({ units }: FeaturedUnitsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    // Ensure we only deal with 2 units for this design
    const featured = units.slice(0, 2)
    if (featured.length < 2) return null

    return (
        <section id="featured-units" className="relative bg-emerald-950">
            {/* Desktop View: Twin Peaks Split */}
            <div className="hidden lg:flex h-[90vh] overflow-hidden">
                {featured.map((unit, index) => (
                    <DesktopUnitPeak
                        key={unit.id}
                        unit={unit}
                        index={index}
                        isHovered={hoveredIndex === index}
                        isOtherHovered={hoveredIndex !== null && hoveredIndex !== index}
                        onHover={() => setHoveredIndex(index)}
                        onLeave={() => setHoveredIndex(null)}
                    />
                ))}

                {/* Comparison Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
                    <motion.div
                        animate={{ opacity: hoveredIndex !== null ? 0 : 1 }}
                        className="bg-white text-emerald-950 font-black text-sm px-6 py-3 rounded-full shadow-2xl border border-emerald-100 uppercase tracking-tighter flex items-center gap-2"
                    >
                        <Maximize2 className="w-4 h-4" />
                        Compare Spaces
                    </motion.div>
                </div>
            </div>

            {/* Mobile/Tablet View: Vertical Portal with Long Press */}
            <div className="lg:hidden flex flex-col">
                {featured.map((unit, index) => (
                    <MobileUnitPortal key={unit.id} unit={unit} index={index} />
                ))}
            </div>
        </section>
    )
}

function DesktopUnitPeak({ unit, index, isHovered, isOtherHovered, onHover, onLeave }: any) {
    const price = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    }).format(unit.basePrice / 100)

    return (
        <motion.div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            animate={{
                width: isOtherHovered ? '35%' : isHovered ? '65%' : '50%',
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className={cn(
                "relative h-full overflow-hidden transition-all duration-700",
                index === 0 ? "z-10" : "z-0"
            )}
        >
            <motion.div
                animate={{
                    scale: isHovered ? 1.1 : 1,
                    filter: isHovered ? 'brightness(0.7)' : 'brightness(0.4)'
                }}
                className="absolute inset-0 z-0"
            >
                <img
                    src={unit.slug === 'big-house' ? '/assets/images/baguio_midground.png' : unit.slug === 'veranda-unit' ? '/assets/images/baguio_background_fog.png' : (unit.images[0] || '/assets/images/placeholder.png')}
                    alt={unit.name}
                    className="w-full h-full object-cover"
                />
            </motion.div>

            <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <Badge className={cn(
                            "font-black rounded-lg border-0 py-1.5 px-4 text-xs uppercase tracking-tighter",
                            index === 0 ? "bg-amber-500 text-amber-950" : "bg-emerald-500 text-emerald-950"
                        )}>
                            {index === 0 ? 'Best for Groups' : 'The Serene Escape'}
                        </Badge>
                    </div>
                    <h3 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
                        {unit.name}
                    </h3>

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-8 pt-4"
                            >
                                <p className="text-xl text-white/70 font-medium leading-relaxed">
                                    {unit.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <DetailPill icon={<Users className="w-5 h-5" />} label={`Up to ${unit.maxPax} Guests`} />
                                    <DetailPill icon={<CheckCircle className="w-5 h-5" />} label="Private Bathroom" />
                                    {unit.hasHeater && <DetailPill icon={<Wind className="w-5 h-5" />} label="Shower Heater" />}
                                </div>
                                <div className="flex items-center gap-6 pt-4">
                                    <Link href={`/book/${unit.slug}`}>
                                        <Button className="bg-emerald-950 hover:bg-emerald-900 text-white font-black rounded-[2rem] px-12 py-8 text-xl border-b-4 border-emerald-800 transition-all hover:-translate-y-1 active:translate-y-0.5 active:border-b-0 shadow-2xl shadow-emerald-900/40">
                                            Check Availability
                                        </Button>
                                    </Link>
                                    <div className="flex flex-col">
                                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Nightly Rate</span>
                                        <span className="text-3xl font-black text-white">{price}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 flex items-center gap-4 text-white/40 font-black uppercase tracking-[0.3em] text-[10px]"
                        >
                            <div className="h-0.5 w-12 bg-white/20" />
                            Hover to Explore
                        </motion.div>
                    )}
                </div>
            </div>
            {index === 0 && <div className="absolute top-0 right-0 w-[1px] h-full bg-white/10 z-30" />}
        </motion.div>
    )
}

function MobileUnitPortal({ unit, index }: { unit: Unit, index: number }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPressing, setIsPressing] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const pressTimerRef = useRef<NodeJS.Timeout | null>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

    const handleTouchStart = () => {
        setIsPressing(true)
        pressTimerRef.current = setTimeout(() => {
            setShowDetails(true)
            setIsPressing(false)
        }, 600) // threshold for long press
    }

    const handleTouchEnd = () => {
        setIsPressing(false)
        if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
    }

    return (
        <div ref={containerRef} className="relative h-[90vh] overflow-hidden w-full flex flex-col justify-end p-8">
            {/* Background with Scroll Parallax */}
            <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
                <img
                    src={unit.slug === 'big-house' ? '/assets/images/baguio_midground.png' : unit.slug === 'veranda-unit' ? '/assets/images/baguio_background_fog.png' : unit.images[0]}
                    alt={unit.name}
                    className="w-full h-full object-cover brightness-[0.4]"
                />
                {/* Mist Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
            </motion.div>

            {/* Main Content Overlay */}
            <div className="relative z-10 space-y-6">
                <Badge className={cn(
                    "font-black rounded-lg border-0 py-1.5 px-4 text-[10px] uppercase tracking-wider",
                    index === 0 ? "bg-amber-500 text-amber-950" : "bg-emerald-500 text-emerald-950"
                )}>
                    {index === 0 ? 'Large Group Specialized' : 'Premium Couple Nest'}
                </Badge>

                <h3 className="text-6xl font-black text-white tracking-tighter leading-[0.85]">
                    {unit.name}
                </h3>

                {/* Visual Indicator for Long Press */}
                <div className="pt-6 relative">
                    <AnimatePresence mode="wait">
                        {!showDetails ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-4 group"
                            >
                                <div
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    className="relative flex items-center justify-center"
                                >
                                    {/* Progress Ring during press */}
                                    <svg className="absolute w-20 h-20 -rotate-90">
                                        <motion.circle
                                            cx="40" cy="40" r="36"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="226"
                                            strokeDashoffset={isPressing ? 0 : 226}
                                            transition={{ duration: isPressing ? 0.6 : 0.3, ease: "linear" }}
                                            className="opacity-50"
                                        />
                                    </svg>
                                    <div className={cn(
                                        "w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md transition-all",
                                        isPressing ? "scale-90 bg-white/20" : ""
                                    )}>
                                        <Fingerprint className="w-8 h-8 text-white animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-white font-black text-xs uppercase tracking-widest">Hold to Peek</p>
                                    <p className="text-white/40 text-[10px] font-medium leading-none">Reveal Hidden Details</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-wrap gap-2">
                                    <DetailPillMobile label={`${unit.maxPax} pax`} />
                                    <DetailPillMobile label="Private CR" />
                                    {unit.hasHeater && <DetailPillMobile label="Heater" />}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/book/${unit.slug}`} className="flex-1">
                                        <Button className="w-full bg-emerald-950 text-white font-black rounded-2xl py-7 text-base border-b-4 border-emerald-800 transition-all active:translate-y-0.5 active:border-b-0 shadow-lg shadow-emerald-900/40">
                                            Discover Unit
                                        </Button>
                                    </Link>
                                    <div className="px-4 py-2.5 rounded-xl bg-emerald-900/50 backdrop-blur-md border border-white/5 text-center">
                                        <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">From</p>
                                        <p className="text-white font-black">₱{(unit.basePrice / 100).toLocaleString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 underline"
                                >
                                    Keep it a mystery
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Split separator for mobile */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 z-20" />
        </div>
    )
}

function DetailPill({ icon, label }: any) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 font-bold text-sm">
            <span className="text-emerald-400">{icon}</span>
            {label}
        </div>
    )
}

function DetailPillMobile({ label }: { label: string }) {
    return (
        <div className="px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-wider">
            {label}
        </div>
    )
}
