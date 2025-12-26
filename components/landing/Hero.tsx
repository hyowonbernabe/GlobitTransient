'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Mist Dissolve Effect for Text
      gsap.to(textRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        opacity: 0,
        y: -100,
        filter: "blur(20px)",
        scale: 1.1,
      })

      // Subtle Background Zoom/Shift
      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        scale: 1.15,
        y: 30,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[100vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image - Single High Contrast Layer */}
      <div ref={imageRef} className="absolute inset-0 z-0">
        <img
          src="/assets/images/baguio_midground.png"
          alt="Baguio Cityscape"
          className="w-full h-full object-cover opacity-80 contrast-125 brightness-75"
        />
        {/* Deep Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        <div className="absolute inset-0 bg-emerald-950/30 mix-blend-multiply" />
      </div>

      <div ref={textRef} className="relative z-30 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 px-5 py-2 rounded-full text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-emerald-300 shadow-2xl shadow-emerald-950/50"
            >
              <MapPin className="w-4 h-4" />
              <span>{t('hero.location_badge')}</span>
            </motion.div>

            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] text-balance drop-shadow-2xl">
              {t('hero.title_prefix')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white italic font-serif py-2">
                {t('hero.title_highlight')}
              </span>
            </h1>

            <p className="text-xl md:text-3xl text-white font-medium max-w-4xl mx-auto leading-relaxed drop-shadow-lg shadow-black/40">
              {t('hero.description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/book" className="w-full sm:w-auto group">
              <Button size="lg" className="w-full h-16 md:h-20 px-12 text-2xl font-black bg-emerald-950 hover:bg-emerald-900 text-white rounded-[2rem] border-b-4 border-emerald-800 transition-all hover:-translate-y-1 active:translate-y-0.5 active:border-b-0 shadow-2xl shadow-emerald-900/40">
                {t('hero.cta_book')}
                <ArrowRight className="ml-2 w-8 h-8 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#location" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full h-16 md:h-20 px-12 text-2xl font-black bg-white border-2 border-emerald-950/10 text-emerald-950 hover:bg-emerald-50 rounded-[2rem] transition-all hover:-translate-y-1 active:translate-y-0.5 shadow-xl shadow-emerald-900/5">
                {t('hero.cta_location')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Modern Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a1a15] to-transparent z-20" />
    </section>
  )
}