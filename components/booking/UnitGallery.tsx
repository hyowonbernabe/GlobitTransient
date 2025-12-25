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

  return (
    <div className="w-full relative group">
      <Carousel className="w-full">
        <CarouselContent>
          {displayImages.map((img, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="overflow-hidden border-0 shadow-none rounded-xl">
                  <div className="relative aspect-[16/10] md:aspect-[21/9]">
                    {img === "placeholder" ? (
                       <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                         <img 
                           src="/assets/images/placeholder.png" 
                           alt={unitName}
                           className="w-full h-full object-cover opacity-80"
                         />
                       </div>
                    ) : (
                      // In production, replace with <Image> from next/image
                      <img 
                        src={img} 
                        alt={`${unitName} - View ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                      {index + 1} / {displayImages.length}
                    </div>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayImages.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-none shadow-md" />
            <CarouselNext className="right-4 bg-white/80 hover:bg-white border-none shadow-md" />
          </>
        )}
      </Carousel>
    </div>
  )
}