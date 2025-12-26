"use client"

import { useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { 
  ShoppingBasket, 
  Shield, 
  Store, 
  Bus, 
  Navigation, 
  PawPrint, 
  Church, 
  ShoppingCart, 
  Coffee, 
  Trees, 
  ShoppingBag,
  Car,
  Footprints
} from "lucide-react"

// Dynamically import LeafletMap with SSR disabled
const LeafletMap = dynamic(
  () => import("./LeafletMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 font-medium">
        Loading Map...
      </div>
    )
  }
)

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// --- CONFIGURATION ---
const GLOBIT_POSITION: [number, number] = [16.391140396855135, 120.57783887271736] 
const ZOOM_LEVEL = 15

// Landmark Data
const LANDMARKS = [
  {
    id: 1,
    name: "7-Eleven",
    type: "Convenience",
    distance: "150m",
    time: "2 min walk",
    mode: "walk",
    coords: [16.38916315175218, 120.57634857257291] as [number, number],
    icon: Store,
    color: "text-orange-500",
    bg: "bg-orange-100"
  },
  {
    id: 2,
    name: "Lorimar Minimart",
    type: "Groceries",
    distance: "200m",
    time: "3 min walk",
    mode: "walk",
    coords: [16.389647281251463, 120.5765394316856] as [number, number],
    icon: ShoppingBasket,
    color: "text-indigo-500",
    bg: "bg-indigo-100"
  },
  {
    id: 3,
    name: "Police Station (Stn 10)",
    type: "Safety",
    distance: "400m",
    time: "5 min walk",
    mode: "walk",
    coords: [16.388922044632434, 120.57543886002945] as [number, number],
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    id: 4,
    name: "Pet Habitat",
    type: "Pet Supplies",
    distance: "300m",
    time: "4 min walk",
    mode: "walk",
    coords: [16.38996919001711, 120.5772488723117] as [number, number],
    icon: PawPrint,
    color: "text-amber-500",
    bg: "bg-amber-100"
  },
  {
    id: 5,
    name: "Divine Mercy Church",
    type: "Worship",
    distance: "800m",
    time: "10 min walk",
    mode: "walk",
    coords: [16.39053800235778, 120.57732191168738] as [number, number],
    icon: Church,
    color: "text-purple-500",
    bg: "bg-purple-100"
  },
  {
    id: 6,
    name: "Puregold Jr. Bakakeng",
    type: "Supermarket",
    distance: "1.2km",
    time: "3 min drive",
    mode: "drive",
    coords: [16.394738094049735, 120.58023279596061] as [number, number],
    icon: ShoppingCart,
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    id: 7,
    name: "MOCH Cafe and Bistro",
    type: "Dining",
    distance: "350m",
    time: "5 min walk",
    mode: "walk",
    coords: [16.3945585642896, 120.5712792380058] as [number, number],
    icon: Coffee,
    color: "text-rose-500", 
    bg: "bg-rose-100"
  },
  {
    id: 8,
    name: "Burnham Park",
    type: "Attraction",
    distance: "4.5km",
    time: "15 min drive",
    mode: "drive",
    coords: [16.41243132638714, 120.59297957699249] as [number, number],
    icon: Trees,
    color: "text-emerald-600",
    bg: "bg-emerald-100"
  },
  {
    id: 9,
    name: "SM Baguio City",
    type: "Shopping",
    distance: "5.2km",
    time: "20 min drive",
    mode: "drive",
    coords: [16.408975375642115, 120.599740811087] as [number, number],
    icon: ShoppingBag,
    color: "text-sky-500",
    bg: "bg-sky-100"
  },
  {
      id: 10,
      name: "Jeepney Station",
      type: "Transport",
      distance: "100m",
      time: "1 min walk",
      mode: "walk",
      coords: [16.388942121274752, 120.5757864742171] as [number, number],
      icon: Bus,
      color: "text-emerald-500",
      bg: "bg-emerald-100"
  }
]

export function LocationMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null) // Ref for the scrollable list
  const [activeLandmark, setActiveLandmark] = useState<[number, number] | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useGSAP(() => {
    // 1. Reveal Map Card
    gsap.fromTo(".location-card", 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%", 
        },
        clearProps: "all" 
      }
    );

    // 2. Stagger Landmarks List
    gsap.fromTo(".landmark-card", 
      { x: 30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.3,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
        clearProps: "all"
      }
    );
  }, { scope: containerRef })

  // --- AUTO PLAY LOGIC ---
  useEffect(() => {
    if (!isAutoPlaying) return;

    timerRef.current = setInterval(() => {
        // Find current index, if none selected start at -1 (so next is 0)
        const currentIndex = activeId 
            ? LANDMARKS.findIndex(l => l.id === activeId)
            : -1;
        
        // Calculate next index
        const nextIndex = (currentIndex + 1) % LANDMARKS.length;
        const nextLandmark = LANDMARKS[nextIndex];

        // Update state
        setActiveId(nextLandmark.id);
        setActiveLandmark(nextLandmark.coords);
    }, 4000); // 4 seconds per slide

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, activeId]);

  // --- AUTO SCROLL LOGIC ---
  // When activeId changes (either by auto-play or click), scroll it into view
  useEffect(() => {
      if (activeId && listRef.current) {
          const activeCard = listRef.current.querySelector(`[data-id="${activeId}"]`);
          if (activeCard) {
              activeCard.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest', // Scrolls just enough to bring it into view
              });
          }
      }
  }, [activeId]);

  // Handle explicit user interactions
  const handleInteraction = () => {
      setIsAutoPlaying(false);
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
  }

  const handleLandmarkClick = (landmark: typeof LANDMARKS[0]) => {
      handleInteraction();
      setActiveLandmark(landmark.coords)
      setActiveId(landmark.id)
  }

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-gray-50 overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
           <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
             Connected Convenience
           </h2>
           <p className="text-gray-500 text-lg md:text-xl">
             Everything you need is just a few steps away.
           </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[800px] lg:h-[600px]">
            
            {/* Map Container */}
            <div className="location-card w-full lg:w-2/3 h-[400px] lg:h-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white relative z-10 order-1 lg:order-1 flex-shrink-0">
                 <LeafletMap 
                    center={GLOBIT_POSITION} 
                    zoom={ZOOM_LEVEL} 
                    activeLandmark={activeLandmark}
                    activeId={activeId}
                    landmarks={LANDMARKS}
                    setActiveId={setActiveId}
                    setActiveLandmark={setActiveLandmark}
                    onUserInteraction={handleInteraction}
                 />

                 {/* Overlay Gradient on Map Bottom (Mobile) */}
                 <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none lg:hidden" />
            </div>

            {/* Landmarks List - Scrollable */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 order-2 lg:order-2 h-full min-h-0">
                
                {/* Scrollable Container with Ref */}
                <div 
                    ref={listRef}
                    className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                >
                    {LANDMARKS.map((landmark) => (
                        <button 
                            key={landmark.id}
                            data-id={landmark.id} // Added data attribute for querySelector
                            onClick={() => handleLandmarkClick(landmark)}
                            className={`landmark-card w-full group flex items-center p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden ${
                                activeId === landmark.id 
                                ? "bg-emerald-50 border-emerald-500 shadow-md scale-[1.02]" 
                                : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200"
                            }`}
                        >
                            {/* Active Indicator */}
                            {activeId === landmark.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                            )}

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mr-4 transition-colors ${landmark.bg} ${landmark.color}`}>
                                <landmark.icon size={22} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold truncate transition-colors ${activeId === landmark.id ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-600'}`}>
                                    {landmark.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                        <div className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            {landmark.mode === 'walk' ? <Footprints size={10} /> : <Car size={10} />}
                                            {landmark.time}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        {landmark.distance}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Get Directions CTA */}
                <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${GLOBIT_POSITION[0]},${GLOBIT_POSITION[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-xl shadow-gray-200/50"
                >
                    <Navigation size={18} />
                    Get Directions to Transient
                </a>
            </div>

        </div>
      </div>
    </section>
  )
}