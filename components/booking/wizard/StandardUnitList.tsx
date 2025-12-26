import * as React from "react"
import { Unit } from "@prisma/client"
import Image from "next/image"
import { Users, Bed } from "lucide-react"

interface StandardUnitListProps {
  units: Unit[]
}

export function StandardUnitList({ units }: StandardUnitListProps) {
  return (
    <div className="space-y-6 pt-8 pb-24">
      <div className="flex items-center gap-4 px-2">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Explore More Options</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => (
           <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row h-32">
              <div className="w-32 relative shrink-0">
                 <Image 
                    src={unit.images[0] || "/assets/images/placeholder.png"}
                    alt={unit.name}
                    fill
                    className="object-cover"
                 />
              </div>
              <div className="p-3 flex flex-col justify-between flex-1">
                 <div>
                    <h4 className="font-bold text-gray-900 leading-tight mb-1">{unit.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{unit.description}</p>
                 </div>
                 <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Users size={12}/> {unit.maxPax}</span>
                    </div>
                    <div className="font-bold text-emerald-600">
                        ₱{(unit.basePrice / 100).toLocaleString()}
                    </div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  )
}