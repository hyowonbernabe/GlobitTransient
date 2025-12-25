import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MapPin, ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-emerald-900">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/placeholder.png"
          alt="Baguio City View"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/40 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium text-emerald-50 animate-fade-in-up">
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>Located near Burnham Park, Baguio City</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
            Wake up to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400">
              Cool Mountain Breeze
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Experience the authentic Baguio vibe. Affordable, spacious, and perfect for family reunions and barkada getaways.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/book" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 text-lg font-bold shadow-xl shadow-emerald-900/20">
              Book Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="#location" className="w-full sm:w-auto">
             <Button variant="secondary" size="lg" className="w-full h-14 text-lg bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
               View Location
             </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}