'use client'

import Link from 'next/link'
import { Users, Wind, Tv, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

interface UnitProps {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  basePrice: number
  basePax: number
  maxPax: number
  extraPaxPrice: number
  hasTV: boolean
  hasRef: boolean
  hasHeater: boolean
  hasOwnCR: boolean
}

interface UnitCardProps {
  unit: UnitProps
  isFeatured?: boolean
}

export function UnitCard({ unit, isFeatured = false }: UnitCardProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return

    gsap.fromTo(imageRef.current,
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    )
  }, [])

  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(unit.basePrice / 100)

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden flex flex-col h-full border-none shadow-xl shadow-emerald-900/5 bg-white rounded-[2rem] p-0 gap-0",
        isFeatured ? "ring-2 ring-amber-500/20 shadow-amber-900/5" : ""
      )}>
        {/* Image Section */}
        <Link href={`/book/${unit.slug}`} className="relative aspect-[4/3] bg-emerald-950 overflow-hidden block group">
          <motion.img
            ref={imageRef}
            layoutId={`image-${unit.id}`}
            src={unit.slug === 'big-house' ? '/assets/images/baguio_midground.png' : unit.slug === 'veranda-unit' ? '/assets/images/baguio_background_fog.png' : (unit.images[0] || '/assets/images/placeholder.png')}
            alt={unit.name}
            className="absolute inset-0 w-full h-[130%] object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent opacity-60" />

          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 backdrop-blur text-emerald-950 font-black rounded-xl px-3 py-1.5 shadow-xl border-none">
              {formattedPrice} <span className="font-medium text-emerald-900/40 ml-1">/ night</span>
            </Badge>
          </div>

          {isFeatured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-amber-500 text-amber-950 font-black rounded-xl px-4 py-1.5 border-none shadow-lg">
                Spotlight Unit
              </Badge>
            </div>
          )}
        </Link>

        <CardHeader className="p-8 pb-4">
          <h3 className="font-black text-2xl text-emerald-950 tracking-tighter leading-tight mb-2">
            {unit.name}
          </h3>
          <div className="flex items-center text-xs font-bold text-emerald-900/40 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 mr-2 text-emerald-600" />
            <span>Good for {unit.basePax}</span>
            <span className="mx-2 opacity-30">•</span>
            <span>Max {unit.maxPax} pax</span>
          </div>
        </CardHeader>

        <CardContent className="px-8 py-2 flex-1 space-y-6">
          <p className="text-gray-500 font-medium leading-relaxed line-clamp-2">
            {unit.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {unit.hasOwnCR && (
              <Badge variant="outline" className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-900/60 bg-emerald-50 border-emerald-100/50">
                <CheckCircle className="w-3 h-3 mr-2 text-emerald-500" /> Own CR
              </Badge>
            )}
            {unit.hasHeater && (
              <Badge variant="outline" className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-900/60 bg-blue-50 border-blue-100/50">
                <Wind className="w-3 h-3 mr-2 text-blue-400" /> Heater
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-4">
          <Link href={`/book/${unit.slug}`} className="w-full">
            <Button
              className={cn(
                "w-full h-14 rounded-2xl font-black text-lg transition-all",
                isFeatured
                  ? "bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-4 border-amber-600 active:border-b-0 active:translate-y-0.5 shadow-xl shadow-amber-900/10"
                  : "bg-emerald-950 hover:bg-emerald-900 text-white border-b-4 border-emerald-800 active:border-b-0 active:translate-y-0.5 shadow-xl shadow-emerald-900/10"
              )}
            >
              Check Availability
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
