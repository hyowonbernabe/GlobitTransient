"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Unit } from "@prisma/client"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Users, Bed, Check, ArrowRight, Star } from "lucide-react"

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface FeaturedUnitsProps {
  units: Unit[]
}

export function FeaturedUnits({ units }: FeaturedUnitsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Staggered Entry Animation for Cards
    gsap.from(".featured-card", {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%", // Start animation when top of section hits 80% of viewport height
        toggleActions: "play none none reverse" // Play on enter, reverse on leave back up
      }
    });

    // Header Reveal
    gsap.from(".featured-header", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%",
      }
    });
  }, { scope: containerRef })

  if (!units || units.length === 0) return null;

  return (
    <section id="featured-units" ref={containerRef} className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="featured-header text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
            <Star size={12} className="fill-emerald-600" />
            Guest Favorites
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Curated Stays for You
          </h2>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
            Discover our most popular units, designed for comfort and unforgettable Baguio memories.
          </p>
        </div>

        {/* Units Grid - Use items-stretch to force equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {units.map((unit) => {
            // Determine "Best For" tag based on unit type
            const isBigHouse = unit.slug === 'big-house';
            const tag = isBigHouse ? "Best for Large Groups" : "Best for Families";
            
            // Hardcoded amenities for display priority (since DB amenities might be generic)
            const displayAmenities = isBigHouse 
                ? ["Spacious Living Area", "Full Kitchen", "Private Balcony"] 
                : ["Scenic View", "Cozy Ambience", "Smart TV"];

            return (
              <div 
                key={unit.id} 
                className="featured-card group relative flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-100 border border-gray-100 transition-transform hover:-translate-y-1 duration-300 h-full"
              >
                {/* Image Section */}
                <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden shrink-0">
                  <Image
                    src={unit.images[0] || "/assets/images/placeholder.png"}
                    alt={unit.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Price Tag */}
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">From</span>
                    <span className="text-xl font-bold text-gray-900">₱{(unit.basePrice / 100).toLocaleString()}</span>
                  </div>

                  {/* Mobile Title Overlay */}
                  <div className="absolute bottom-0 left-0 p-6 md:hidden">
                     <div className="inline-block px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full mb-2">
                        {tag}
                     </div>
                     <h3 className="text-2xl font-bold text-white leading-tight">{unit.name}</h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-10 flex flex-col">
                  {/* Desktop Title & Tag */}
                  <div className="hidden md:block mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
                                {tag}
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900">{unit.name}</h3>
                        </div>
                        {/* Rating Placeholder */}
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star size={18} className="fill-amber-400"/>
                            <span className="text-gray-700 font-bold">4.9</span>
                            <span className="text-gray-400 text-sm">(120+)</span>
                        </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 mb-8 line-clamp-3 leading-relaxed">
                    {unit.description}
                  </p>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-emerald-600">
                            <Users size={20} />
                        </div>
                        <span>Up to {unit.maxPax} Guests</span>
                     </div>
                     <div className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-emerald-600">
                            <Bed size={20} />
                        </div>
                        <span>{unit.basePax} Beds</span>
                     </div>
                  </div>

                  {/* Key Amenities List */}
                  <ul className="space-y-3 mb-10">
                    {displayAmenities.map((amenity, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-emerald-600 stroke-[3]" />
                            </div>
                            {amenity}
                        </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                    <Link 
                        href={`/book/${unit.slug}`} 
                        className="flex-1 inline-flex items-center justify-center h-14 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-lg shadow-gray-200"
                    >
                        Book Now
                    </Link>
                    <Link 
                        href={`/book/${unit.slug}`} 
                        className="hidden md:inline-flex items-center justify-center w-14 h-14 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        title="View Details"
                    >
                        <ArrowRight size={24} />
                    </Link>
                  </div>

                </div>
              </div>
            )
          })}
        </div>

        {/* View All CTA - Moved outside and ensured spacing */}
        <div className="mt-16 text-center relative z-10">
            <Link 
                href="/book" 
                className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-emerald-600 transition-colors group"
            >
                View all accommodation options
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

      </div>
    </section>
  )
}