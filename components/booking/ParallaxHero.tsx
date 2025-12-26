'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxHeroProps {
    unitId: string
    unitName: string
    image: string
    children: React.ReactNode
}

export function ParallaxHero({ unitId, unitName, image, children }: ParallaxHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    const y = useTransform(scrollY, [0, 500], [0, 200])
    const opacity = useTransform(scrollY, [0, 300], [1, 0])

    useEffect(() => {
        if (!containerRef.current || !heroRef.current) return

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: heroRef.current,
            pinSpacing: false
        })

        return () => ScrollTrigger.getAll().forEach(t => t.kill())
    }, [])

    return (
        <div ref={containerRef} className="relative min-h-screen">
            {/* Pinned Hero Section */}
            <div ref={heroRef} className="h-screen w-full overflow-hidden bg-emerald-950">
                <motion.img
                    layoutId={`image-${unitId}`}
                    src={image}
                    alt={unitName}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    style={{ y }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-32 left-0 right-0 px-6 container mx-auto">
                    <motion.div style={{ opacity }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4 ml-1">Unique Stay</p>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
                            {unitName.split(' ').map((word, i) => (
                                <span key={i} className="block">{word}</span>
                            ))}
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Rising Content Sheet */}
            <div className="relative z-10 -mt-[20vh] bg-[#fcfdfc] rounded-t-[3rem] shadow-[0_-32px_128px_-16px_rgba(6,78,59,0.2)]">
                <div className="max-w-7xl mx-auto px-4 pb-32">
                    <div className="flex justify-center -translate-y-1/2">
                        <div className="h-1.5 w-12 rounded-full bg-emerald-100" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
