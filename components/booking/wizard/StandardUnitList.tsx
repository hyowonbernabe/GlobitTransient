import * as React from "react"
import { Unit } from "@prisma/client"
import Image from "next/image"
import { Users, ChevronRight, Tv, Zap } from "lucide-react"

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => {
            // Determine tags based on slug or DB properties (if available)
            // Using DB properties is safer, but falling back to slug logic for specific requests
            
            // Logic 1: TV & Fridge
            // "Units 3, 6, 7, Veranda Unit, and Big House has a Refrigerator and a Television"
            const hasTVFridge = unit.hasTV && unit.hasRef; 
            // Or explicitly by slug if DB boolean is missing/unreliable for some reason
            // const hasTVFridge = ['unit-3', 'unit-6', 'unit-7', 'veranda-unit', 'big-house'].includes(unit.slug);

            // Logic 2: Heater
            // "Units 6, 7, and Veranda have a Shower with Heater."
            const hasHeater = unit.hasHeater; 
            // Or explicitly by slug
            // const hasHeater = ['unit-6', 'unit-7', 'veranda-unit'].includes(unit.slug);

            return (
               <div 
                 key={unit.id} 
                 className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-row h-32 standard-list-entry opacity-0 translate-y-8 active:scale-[0.98] transition-transform duration-200 hover:shadow-md"
               >
                  <div className="w-28 relative shrink-0 rounded-xl overflow-hidden bg-gray-100">
                     <Image 
                        src={unit.images[0] || "/assets/images/placeholder.png"}
                        alt={unit.name}
                        fill
                        className="object-cover"
                     />
                     {/* Overlay tags on image for space efficiency */}
                     {(hasTVFridge || hasHeater) && (
                         <div className="absolute bottom-1 left-1 flex gap-1 flex-wrap">
                            {hasTVFridge && <div className="bg-black/60 p-1 rounded-md backdrop-blur-sm"><Tv size={10} className="text-white"/></div>}
                            {hasHeater && <div className="bg-orange-500/80 p-1 rounded-md backdrop-blur-sm"><Zap size={10} className="text-white"/></div>}
                         </div>
                     )}
                  </div>
                  
                  <div className="pl-4 py-1 flex flex-col justify-between flex-1">
                     <div>
                        <h4 className="font-bold text-gray-900 leading-tight mb-1 text-base">{unit.name}</h4>
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{unit.description}</p>
                        
                        {/* Text Tags Row */}
                        <div className="flex flex-wrap gap-1 mt-2">
                             {hasTVFridge && (
                                 <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                                    TV & Fridge
                                 </span>
                             )}
                             {hasHeater && (
                                 <span className="text-[10px] font-medium px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">
                                    Heater
                                 </span>
                             )}
                        </div>
                     </div>

                     <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1">
                            <Users size={12}/> Max {unit.maxPax}
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                            ₱{(unit.basePrice / 100).toLocaleString()}
                            <ChevronRight size={16} className="text-gray-300" />
                        </div>
                     </div>
                  </div>
               </div>
            )
        })}
      </div>
    </div>
  )
}