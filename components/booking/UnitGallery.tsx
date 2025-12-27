'use client'

import { useRef } from "react"
import Image from "next/image"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Grid3X3, Expand } from "lucide-react" // Added Expand to imports just in case
import { Button } from "@/components/ui/button"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface UnitGalleryProps {
  images: string[]
  unitName: string
  showMainImage?: boolean
}

export function UnitGallery({ images, unitName, showMainImage = true }: UnitGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // 1. Staggered Entry
    const items = gsap.utils.toArray(".gallery-item")
    if (items.length === 0) return

    gsap.from(items, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%"
      }
    })
  }, { scope: containerRef })

  if (!images || images.length === 0) return null

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Main Hero Image */}
      {showMainImage && (
        <div className="gallery-item relative aspect-video md:aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-lg group cursor-pointer bg-gray-100">
          <Image
            src={images[0]}
            alt={`${unitName} Main View`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      )}

      {/* Thumbnails Grid (Mobile: Horizontal Scroll, Desktop: Grid) */}
      {images.length > 1 && (
        <div className="gallery-item grid grid-cols-4 gap-2 md:gap-4 overflow-hidden">
          {images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100">
              <Image
                src={img}
                alt={`${unitName} view ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 25vw, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay for last item if more images exist */}
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-[1px] group-hover:bg-black/50 transition-colors">
                  +{images.length - 5}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="gallery-item flex justify-end">
        <Button variant="outline" size="sm" className="gap-2 text-xs text-gray-600 hover:text-emerald-700 hover:border-emerald-200">
          <Grid3X3 className="w-3 h-3" /> View All Photos
        </Button>
      </div>
    </div>
  )
}
