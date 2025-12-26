import * as React from "react"
import { Unit } from "@prisma/client"
import Image from "next/image"
import { Users, Bed } from "lucide-react"

interface TopPickCardProps {
  unit: Unit
  index: number
}

export function TopPickCard({ unit, index }: TopPickCardProps) {
  // Placeholder for GSAP / detailed card implementation
  return (
    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl mb-6 group">
      <Image
        src={unit.images[0] || "/assets/images/placeholder.png"}
        alt={unit.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-6 text-white w-full">
        <div className="bg-emerald-500/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full inline-block mb-3 shadow-lg">
          TOP PICK
        </div>
        <h3 className="text-3xl font-bold mb-1 leading-tight">{unit.name}</h3>
        <p className="text-white/80 line-clamp-2 text-sm mb-4">{unit.description}</p>
        
        <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm font-medium text-white/90">
                <span className="flex items-center gap-1"><Users size={16}/> {unit.maxPax} Pax</span>
                <span className="flex items-center gap-1"><Bed size={16}/> {unit.basePax} Beds</span>
            </div>
            <div className="text-xl font-bold">
                ₱{(unit.basePrice / 100).toLocaleString()}
            </div>
        </div>
      </div>
    </div>
  )
}