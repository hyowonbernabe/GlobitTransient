'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Store, 
  Coffee, 
  Dumbbell, 
  ShoppingCart, 
  Utensils, 
  Trees, 
  ShoppingBag, 
  Shield, 
  Car, 
  Footprints,
  Cat
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type PlaceType = 'Minimart' | 'Convenience' | 'Pet' | 'Gym' | 'Supermarket' | 'Restaurant' | 'Park' | 'Mall' | 'Police'

interface Place {
  id: string
  name: string
  type: string
  category: PlaceType
  walkTime?: number
  driveTime?: number
  description: string
}

const PLACES: Place[] = [
  {
    id: 'globittransient',
    name: 'Globit Transient',
    type: 'Transient',
    category: 'Park',
    walkTime: 1,
    description: 'The transient place for your stay.',
  },
  {
    id: 'lorimar',
    name: 'Lorimar Minimart',
    type: 'Minimart',
    category: 'Minimart',
    walkTime: 5,
    description: 'Quick stop for basic necessities and snacks.',
  },
  {
    id: '7eleven',
    name: '7-Eleven Marcos Highway',
    type: 'Convenience Store',
    category: 'Convenience',
    walkTime: 5,
    description: '24/7 convenience store for late night cravings.',
  },
  {
    id: 'pethabitat',
    name: 'Baguio Pet Habitat - Marcos Highway',
    type: 'Pet Store',
    category: 'Pet',
    walkTime: 4,
    description: 'Supplies and food for your furry friends.',
  },
  {
    id: 'hanes',
    name: "Hane's Sports and Gym",
    type: 'Gym',
    category: 'Gym',
    walkTime: 4,
    description: 'Stay fit even while on vacation.',
  },
  {
    id: 'bcpo',
    name: 'BCPO Police Station 10',
    type: 'Police Station',
    category: 'Police',
    walkTime: 6,
    description: 'Nearby station ensuring safety and security.',
  },
  {
    id: 'puregold',
    name: 'Puregold Jr. Bakakeng',
    type: 'Supermarket',
    category: 'Supermarket',
    walkTime: 11,
    description: 'Full grocery shopping for long stays.',
  },
  {
    id: 'moch',
    name: 'MOCH Cafe and Bistro',
    type: 'Restaurant',
    category: 'Restaurant',
    walkTime: 14,
    description: 'Cozy dining spot with great ambiance.',
  },
  {
    id: 'burnham',
    name: 'Burnham Park',
    type: 'Park',
    category: 'Park',
    driveTime: 10,
    description: 'The heart of Baguio. Boating, biking, and walking.',
  },
  {
    id: 'smbaguio',
    name: 'SM City Baguio',
    type: 'Supermall',
    category: 'Mall',
    driveTime: 12,
    description: 'Major shopping, dining, and cinema complex.',
  },
]

const getIcon = (type: PlaceType) => {
  switch (type) {
    case 'Minimart': return <Store className="w-5 h-5" />
    case 'Convenience': return <Coffee className="w-5 h-5" />
    case 'Pet': return <Cat className="w-5 h-5" />
    case 'Gym': return <Dumbbell className="w-5 h-5" />
    case 'Supermarket': return <ShoppingCart className="w-5 h-5" />
    case 'Restaurant': return <Utensils className="w-5 h-5" />
    case 'Park': return <Trees className="w-5 h-5" />
    case 'Mall': return <ShoppingBag className="w-5 h-5" />
    case 'Police': return <Shield className="w-5 h-5" />
    default: return <MapPin className="w-5 h-5" />
  }
}

export function LocationMap() {
  const [selectedPlace, setSelectedPlace] = useState<Place>(PLACES[0])

  return (
    <section id="location" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="space-y-4 mb-8 lg:mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Nearby Essentials
          </h2>
          <p className="text-gray-600 max-w-2xl">
            Everything you need is just a few minutes away. Click on a location below to view it on the map.
          </p>
        </div>

        {/* Mobile: Stacked Flex column (Map first, List second).
          Desktop: Grid side-by-side with fixed 600px height.
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:h-[600px]">
          
          {/* List Card: Fixed height on mobile to ensure scrolling works */}
          <Card className="order-2 lg:order-1 lg:col-span-1 border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px] lg:h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
              <h3 className="font-semibold text-gray-900">Places of Interest</h3>
            </div>
            {/* Wrapper div with min-h-0 is crucial for flex child scrolling */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {PLACES.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 hover:shadow-md",
                        selectedPlace.id === place.id 
                          ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                          : "bg-white border-gray-100 hover:border-emerald-200"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        selectedPlace.id === place.id ? "bg-emerald-200 text-emerald-800" : "bg-gray-100 text-gray-500"
                      )}>
                        {getIcon(place.category)}
                      </div>
                      <div className="space-y-1">
                        <h4 className={cn("font-bold text-sm", selectedPlace.id === place.id ? "text-emerald-900" : "text-gray-800")}>
                          {place.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {place.description}
                        </p>
                        <div className="flex gap-2 pt-1">
                          {place.walkTime && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5 gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-none border-blue-100">
                              <Footprints className="w-3 h-3" /> {place.walkTime} min
                            </Badge>
                          )}
                          {place.driveTime && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5 gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-none border-orange-100">
                              <Car className="w-3 h-3" /> {place.driveTime} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* Map Card: Map on top on mobile */}
          <Card className="order-1 lg:order-2 lg:col-span-2 overflow-hidden border-gray-200 shadow-lg relative h-[350px] lg:h-full bg-gray-100">
             <iframe 
               key={selectedPlace.id}
               src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedPlace.name + " Baguio City")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="w-full h-full"
               title={`Map showing location of ${selectedPlace.name}`}
             />
             
             {/* Info Overlay */}
             <div className="absolute top-4 left-4 right-4 md:w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  {getIcon(selectedPlace.category)}
                  {selectedPlace.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  {selectedPlace.description}
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {selectedPlace.type}
                  </Badge>
                  {selectedPlace.walkTime && (
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Footprints className="w-3 h-3" /> {selectedPlace.walkTime} min walk
                    </span>
                  )}
                  {selectedPlace.driveTime && (
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Car className="w-3 h-3" /> {selectedPlace.driveTime} min drive
                    </span>
                  )}
                </div>
             </div>
          </Card>

        </div>
      </div>
    </section>
  )
}