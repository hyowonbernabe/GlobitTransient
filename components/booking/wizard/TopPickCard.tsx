"use client"

import * as React from "react"
import { useRef } from "react"
import { Unit } from "@prisma/client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Users, Bed, Star } from "lucide-react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

// Register ScrollTrigger to ensure it works on client load
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TopPickCardProps {
  unit: Unit
  index: number
  pax?: number
  dateRange?: DateRange
}

export function TopPickCard({ unit, index, pax, dateRange }: TopPickCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const router = useRouter()

  useGSAP(() => {
    // Parallax Effect: Image moves slower than the container scroll
    if (imageRef.current && cardRef.current) {
        gsap.to(imageRef.current, {
            y: "15%", // Move the image down by 15% during scroll
            ease: "none",
            scrollTrigger: {
                trigger: cardRef.current,
                start: "top bottom", // When card top hits viewport bottom
                end: "bottom top",   // When card bottom hits viewport top
                scrub: true,         // Smoothly link to scrollbar
            }
        })
    }
  }, { scope: cardRef })

  const handleClick = () => {
    // Construct query parameters
    const params = new URLSearchParams()
    if (pax) params.set('pax', pax.toString())
    if (dateRange?.from) params.set('from', format(dateRange.from, 'yyyy-MM-dd'))
    if (dateRange?.to) params.set('to', format(dateRange.to, 'yyyy-MM-dd'))
    
    router.push(`/book/${unit.slug}?${params.toString()}`)
  }

  return (
    <div 
        ref={cardRef}
        onClick={handleClick}
        className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl mb-8 group top-pick-card opacity-0 translate-y-24 cursor-pointer hover:shadow-emerald-900/20 hover:scale-[1.02] transition-all duration-300" 
    >
      {/* Background Image Container with Overflow for Parallax */}
      <div className="absolute inset-0 bg-gray-900 overflow-hidden">
          <Image
            ref={imageRef as any} 
            src={unit.images[0] || "/assets/images/placeholder.png"}
            alt={unit.name}
            fill
            className="object-cover scale-110 will-change-transform" // Zoomed in to allow parallax movement
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
      </div>
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90" />
      
      {/* Badge Container */}
      <div className="absolute top-6 left-6 flex gap-2">
         <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-900/20 flex items-center gap-1">
           <Star size={10} className="fill-white" /> Top Pick
         </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 text-white w-full z-10">
        <div className="flex items-center justify-between mb-2 opacity-80">
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald-300">Transient House</span>
        </div>
        
        <h3 className="text-4xl font-black mb-3 leading-none tracking-tight font-sans text-white drop-shadow-sm">
            {unit.name}
        </h3>
        
        <p className="text-gray-300 line-clamp-2 text-sm mb-6 leading-relaxed font-medium max-w-[95%]">
            {unit.description}
        </p>
        
        {/* Specs Row */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-2">
            <div className="flex gap-4 text-sm font-medium text-white/90">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <Users size={16} className="text-emerald-400"/> {unit.maxPax} Pax
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <Bed size={16} className="text-emerald-400"/> {unit.basePax} Beds
                </span>
            </div>
            
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-0.5">From</span>
                <div className="text-2xl font-bold tracking-tight text-white">
                    ₱{(unit.basePrice / 100).toLocaleString()}
                </div>
            </div>
        </div>
      </div>

      {/* Touch Ripple / Interaction Hint */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}