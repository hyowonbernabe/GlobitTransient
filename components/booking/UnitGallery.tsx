'use client'

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UnitGalleryProps {
  images: string[]
  unitName: string
}

export function UnitGallery({ images, unitName }: UnitGalleryProps) {
  // Fallback if no images are provided
  const displayImages = images.length > 0 ? images : ["placeholder"]
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  // We can access the embla api if needed, but for now we'll just rely on basic carousel
  // For a true "power" move, we'd add a lightbox, but let's stick to the plan's "horizontal swipeable"

  return (
    <div className="w-full relative group">
      <Carousel
        className="w-full"
        setApi={(api) => {
          if (!api) return
          setCount(api.scrollSnapList().length)
          setCurrent(api.selectedScrollSnap() + 1)

          api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
          })
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {displayImages.map((img, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-[90%] md:basis-[48%] lg:basis-1/2">
              <div className="p-1 h-full">
                <Card className="overflow-hidden border-0 shadow-lg shadow-emerald-900/5 rounded-[2rem] h-full">
                  <div className="relative aspect-[4/3] md:aspect-[16/10]">
                    {img === "placeholder" ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <img
                          src="/assets/images/placeholder.png"
                          alt={unitName}
                          className="w-full h-full object-cover opacity-50 grayscale"
                        />
                      </div>
                    ) : (
                      <img
                        src={img}
                        alt={`${unitName} - View ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    )}
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayImages.length > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-4 bg-white hover:bg-emerald-50 border-none shadow-xl w-12 h-12 rounded-full" />
            <CarouselNext className="hidden md:flex -right-4 bg-white hover:bg-emerald-50 border-none shadow-xl w-12 h-12 rounded-full" />

            {/* Mobile Counter/Indicator */}
            <div className="flex justify-center mt-6 lg:hidden">
              <div className="bg-emerald-950/5 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">
                {current} / {count} Moments
              </div>
            </div>
          </>
        )}
      </Carousel>
    </div>
  )
}
