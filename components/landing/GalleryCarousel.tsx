"use client"

import React from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

interface GalleryCarouselProps {
  images: string[]
}

export function GalleryCarousel({ images }: GalleryCarouselProps) {
  // Embla Carousel Setup with Autoplay
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    skipSnaps: false,
    dragFree: true
  }, [
    Autoplay({ delay: 3000, stopOnInteraction: false, rootNode: (emblaRoot) => emblaRoot.parentElement })
  ])

  return (
    <div className="w-full relative z-10" ref={emblaRef}>
      <div className="flex touch-pan-y gap-4 px-4">
        {images.map((src, index) => (
          <div 
            key={`${src}-${index}`} 
            className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
          >
            <Image
              src={src}
              alt={`Gallery Image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 30vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
          </div>
        ))}
      </div>
    </div>
  )
}