'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  Cat,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isInteracting, setIsInteracting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const blockObserverRef = useRef(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const checkScrollEdge = useCallback(() => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 1024
      if (isMobile) {
        setCanScrollPrev(scrollRef.current.scrollLeft > 20)
        setCanScrollNext(
          scrollRef.current.scrollLeft < (scrollRef.current.scrollWidth - scrollRef.current.offsetWidth - 20)
        )
      } else {
        setCanScrollPrev(scrollRef.current.scrollTop > 20)
        setCanScrollNext(
          scrollRef.current.scrollTop < (scrollRef.current.scrollHeight - scrollRef.current.offsetHeight - 20)
        )
      }
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollEdge)
      window.addEventListener('resize', checkScrollEdge)
      // Initial check
      checkScrollEdge()
      return () => {
        el.removeEventListener('scroll', checkScrollEdge)
        window.removeEventListener('resize', checkScrollEdge)
      }
    }
  }, [checkScrollEdge])

  const scrollToCard = (index: number) => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 1024
      if (isMobile) {
        const containerWidth = scrollRef.current.offsetWidth
        const cardWidth = containerWidth * 0.85 + 24
        scrollRef.current.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        })
      } else {
        const cards = scrollRef.current.querySelectorAll('.place-card')
        const target = cards[index] as HTMLElement
        if (target) {
          scrollRef.current.scrollTo({
            top: target.offsetTop - 100,
            behavior: 'smooth'
          })
        }
      }
    }
  }

  const navigate = (direction: 1 | -1) => {
    const currentIndex = PLACES.findIndex(p => p.id === selectedPlace.id)
    const nextIndex = Math.max(0, Math.min(PLACES.length - 1, currentIndex + direction))
    if (nextIndex !== currentIndex) {
      selectPlaceManually(PLACES[nextIndex], nextIndex)
    }
  }

  const selectPlaceManually = (place: Place, index: number) => {
    setIsInteracting(true)
    blockObserverRef.current = true
    setSelectedPlace(place)
    scrollToCard(index)
    setTimeout(() => {
      blockObserverRef.current = false
    }, 800)
  }

  useEffect(() => {
    if (isInteracting) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      const currentIndex = PLACES.findIndex(p => p.id === selectedPlace.id)
      const nextIndex = (currentIndex + 1) % PLACES.length
      scrollToCard(nextIndex)
    }, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isInteracting, selectedPlace.id])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (blockObserverRef.current) return
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const id = visible.target.getAttribute('data-id')
          const place = PLACES.find(p => p.id === id)
          if (place && place.id !== selectedPlace.id) {
            setSelectedPlace(place)
          }
        }
      },
      {
        threshold: [0.1, 0.5, 0.8],
        root: scrollRef.current,
        rootMargin: window.innerWidth < 1024 ? '0px -15% 0px -15%' : '-20% 0px -60% 0px'
      }
    )
    const cards = scrollRef.current?.querySelectorAll('.place-card')
    cards?.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [selectedPlace.id])

  return (
    <section id="location" className="py-24 bg-[#fafdfc] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tighter"
            >
              Explore Baguio
            </motion.h2>
            <p className="text-gray-500 max-w-xl font-medium text-balance">
              Everything you need is just around the corner. Discover local favorites and essential stops near Globit Transient.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <Badge className="bg-emerald-600/10 text-emerald-700 border-0 rounded-xl px-4 py-1.5 font-bold shadow-none">
              {PLACES.length} Nearby Spots
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 order-1 lg:order-2 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-8 border-white aspect-video lg:aspect-auto lg:h-[700px] relative bg-emerald-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlace.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedPlace.name + " Baguio City")}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${selectedPlace.name}`}
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block z-20">
              <motion.div
                layoutId="map-pill"
                className="bg-emerald-950/90 backdrop-blur-xl px-8 py-5 rounded-[2rem] text-white border border-white/20 shadow-2xl flex items-center gap-6 min-w-[500px]"
              >
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  {getIcon(selectedPlace.category)}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black">{selectedPlace.name}</h4>
                  <p className="text-emerald-100/60 text-sm font-medium">{selectedPlace.description}</p>
                </div>
                <div className="text-right shrink-0">
                  {selectedPlace.walkTime ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Footprints className="w-5 h-5" /> {selectedPlace.walkTime}m
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-400 font-bold">
                      <Car className="w-5 h-5" /> {selectedPlace.driveTime}m
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-4 order-2 lg:order-1 relative lg:h-[700px]">
            {/* Mobile Navigation Buttons (Left/Right) - Center Overlay */}
            <div className="absolute inset-y-0 left-2 flex items-center lg:hidden z-20 pointer-events-none">
              <AnimatePresence>
                {canScrollPrev && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="pointer-events-auto">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full h-12 w-12 bg-white/90 backdrop-blur shadow-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-y-0 right-2 flex items-center lg:hidden z-20 pointer-events-none">
              <AnimatePresence>
                {canScrollNext && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="pointer-events-auto">
                    <Button variant="outline" size="icon" onClick={() => navigate(1)} className="rounded-full h-12 w-12 bg-white/90 backdrop-blur shadow-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Navigation Buttons (Up/Down) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col gap-2 z-20 pointer-events-none">
              <AnimatePresence>
                {canScrollPrev && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="pointer-events-auto">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full h-12 w-12 bg-white/80 backdrop-blur shadow-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                      <ChevronUp className="w-6 h-6" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col gap-2 z-20 pointer-events-none">
              <AnimatePresence>
                {canScrollNext && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pointer-events-auto">
                    <Button variant="outline" size="icon" onClick={() => navigate(1)} className="rounded-full h-12 w-12 bg-white/80 backdrop-blur shadow-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                      <ChevronDown className="w-6 h-6" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fafdfc] via-[#fafdfc]/80 to-transparent z-10 hidden lg:block pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fafdfc] via-[#fafdfc]/80 to-transparent z-10 hidden lg:block pointer-events-none" />

            <div
              ref={scrollRef}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={() => setIsInteracting(false)}
              onTouchStart={() => setIsInteracting(true)}
              onTouchEnd={() => setIsInteracting(false)}
              className={cn(
                "flex lg:flex-col gap-6 overflow-x-auto lg:overflow-y-auto snap-x lg:snap-y snap-mandatory scrollbar-none pb-8 lg:pb-32 lg:h-full px-2 lg:pt-20",
                "scroll-smooth touch-pan-x lg:touch-pan-y"
              )}
            >
              {PLACES.map((place, idx) => {
                const isActive = selectedPlace.id === place.id
                return (
                  <motion.div
                    key={place.id}
                    data-id={place.id}
                    onClick={() => selectPlaceManually(place, idx)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "place-card shrink-0 snap-center cursor-pointer transition-all duration-500 rounded-[2.5rem] p-6 lg:p-10",
                      "w-[85vw] md:w-[400px] lg:w-full",
                      isActive
                        ? "bg-white shadow-2xl shadow-emerald-900/10 border-2 border-emerald-500"
                        : "bg-white/50 border border-emerald-950/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500",
                        isActive ? "bg-emerald-600 text-white shadow-lg" : "bg-gray-100 text-gray-400"
                      )}>
                        {getIcon(place.category)}
                      </div>
                      {isActive && (
                        <motion.div layoutId="active-dot" className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black text-emerald-600/50 tracking-[0.2em]">{place.type}</p>
                      <h3 className={cn("text-2xl lg:text-3xl font-black tracking-tighter leading-none transition-colors duration-500", isActive ? "text-emerald-950" : "text-gray-400")}>{place.name}</h3>
                      <p className={cn("text-sm lg:text-base font-medium transition-colors duration-500 text-balance", isActive ? "text-gray-600" : "text-gray-300")}>{place.description}</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-emerald-900/5">
                      <div className="flex gap-2">
                        {place.walkTime && (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 rounded-lg px-3 py-1 flex gap-1.5 items-center font-bold">
                            <Footprints className="w-3.5 h-3.5" /> {place.walkTime}m
                          </Badge>
                        )}
                        {place.driveTime && (
                          <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-0 rounded-lg px-3 py-1 flex gap-1.5 items-center font-bold">
                            <Car className="w-3.5 h-3.5" /> {place.driveTime}m
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}