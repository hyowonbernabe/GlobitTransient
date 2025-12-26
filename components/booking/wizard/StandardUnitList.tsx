import * as React from "react"
import { Unit } from "@prisma/client"
import Image from "next/image"
import { Users, ChevronRight } from "lucide-react"

interface StandardUnitListProps {
  units: Unit[]
}

export function StandardUnitList({ units }: StandardUnitListProps) {
  if (units.length === 0) return null;

  return (
    <div className="space-y-6 pt-4 pb-32 standard-list-container">
      {/* Section Divider */}
      <div className="flex items-center gap-4 px-2 py-4 standard-list-entry opacity-0 translate-y-8">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">More Options</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {units.map((unit) => (
           <div 
             key={unit.id} 
             className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-row h-28 standard-list-entry opacity-0 translate-y-8 active:scale-[0.98] transition-transform duration-200"
           >
              <div className="w-28 relative shrink-0 rounded-xl overflow-hidden bg-gray-100">
                 <Image 
                    src={unit.images[0] || "/assets/images/placeholder.png"}
                    alt={unit.name}
                    fill
                    className="object-cover"
                 />
              </div>
              <div className="pl-4 py-1 flex flex-col justify-between flex-1">
                 <div>
                    <h4 className="font-bold text-gray-900 leading-tight mb-1 text-lg">{unit.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{unit.description}</p>
                 </div>
                 <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <Users size={12}/> Max {unit.maxPax}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        ₱{(unit.basePrice / 100).toLocaleString()}
                        <ChevronRight size={16} className="text-gray-300" />
                    </div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  )
}