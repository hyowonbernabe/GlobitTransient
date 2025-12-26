import Link from 'next/link'
import { Users, Wind, Tv, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  // Helper to format price from Centavos to Peso string
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(unit.basePrice / 100)

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full border-gray-200",
      isFeatured ? "border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20" : ""
    )}>
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
        {unit.images.length > 0 ? (
          // Placeholder logic for now, using unit name to differentiate
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <img
              src={unit.slug === 'big-house' ? '/assets/images/baguio_midground.png' : unit.slug === 'veranda-unit' ? '/assets/images/baguio_background_fog.png' : '/assets/images/placeholder.png'}
              alt={unit.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}

        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/95 backdrop-blur text-emerald-800 font-bold shadow-sm">
            {formattedPrice} <span className="font-normal text-gray-500 ml-1">/ night</span>
          </Badge>
        </div>

        {isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
              Top Choice
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-xl text-gray-900 leading-tight">
            {unit.name}
          </h3>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-1.5 text-emerald-600" />
          <span>Good for {unit.basePax}</span>
          <span className="mx-1.5 text-gray-300">•</span>
          <span>Max {unit.maxPax} pax</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 py-2 space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {unit.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {unit.hasOwnCR && (
            <Badge variant="outline" className="text-xs font-normal text-gray-600 bg-gray-50">
              <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" /> Own CR
            </Badge>
          )}
          {unit.hasHeater && (
            <Badge variant="outline" className="text-xs font-normal text-gray-600 bg-gray-50">
              <Wind className="w-3 h-3 mr-1 text-blue-400" /> Heater
            </Badge>
          )}
          {unit.hasTV && (
            <Badge variant="outline" className="text-xs font-normal text-gray-600 bg-gray-50">
              <Tv className="w-3 h-3 mr-1 text-gray-400" /> TV
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6 border-t border-gray-50 mt-auto bg-gray-50/50">
        <Link href={`/book/${unit.slug}`} className="w-full">
          <Button
            className={cn(
              "w-full font-semibold",
              isFeatured ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-50"
            )}
            variant={isFeatured ? "default" : "outline"}
          >
            Check Availability
            {!isFeatured && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}