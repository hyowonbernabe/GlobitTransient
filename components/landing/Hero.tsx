"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ChevronDown } from "lucide-react"

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgImageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // 1. Initial Load: Text Reveal Sequence
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Split text effect simulation (staggered lines)
    tl.from(".hero-line", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      delay: 0.2,
      clearProps: "all" 
    })
    .from(".hero-desc", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      clearProps: "all"
    }, "-=0.6")
    .fromTo(".hero-cta", 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, clearProps: "transform,opacity" }
    , "-=0.4")
    .from(".scroll-indicator", {
      opacity: 0,
      y: -10,
      duration: 0.8,
      clearProps: "all"
    }, "-=0.2")

    // 2. Scroll Effect: Background Parallax & Zoom
    // Subtle zoom in and parallax movement on scroll
    gsap.to(bgImageRef.current, {
      scale: 1.15, 
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    })

    // 3. Content Fade Out on Scroll
    gsap.to(contentRef.current, {
      yPercent: -20,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "50% top", 
        scrub: true
      }
    })

  }, { scope: containerRef })

  const scrollToGallery = () => {
    // Smooth scroll to gallery section
    const gallery = document.getElementById('gallery');
    gallery?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center text-center bg-gray-900"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          ref={bgImageRef as any}
          src="/assets/images/baguio_background_fog.png"
          alt="Baguio City Landscape with Fog"
          fill
          priority
          className="object-cover object-center will-change-transform opacity-90"
          placeholder="empty" 
        />
        {/* Cinematic Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />
        <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-[1px]" />
      </div>

      {/* Content Layer */}
      <div 
        ref={contentRef} 
        className="relative z-20 container mx-auto px-6 flex flex-col items-center max-w-4xl pt-20"
      >
        {/* Main Headline - Broken into lines for stagger effect */}
        <h1 className="font-sans font-bold text-white tracking-tight mb-6 drop-shadow-lg flex flex-col items-center">
            <span className="hero-line text-5xl md:text-7xl lg:text-8xl leading-[0.9]">
              Your Home
            </span>
            <span className="hero-line text-5xl md:text-7xl lg:text-8xl text-emerald-400 leading-[0.9]">
              In The Clouds
            </span>
        </h1>

        {/* Subheadline */}
        <p className="hero-desc text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-md">
          Experience the authentic Baguio breeze, cozy interiors, and breathtaking views at Globit Transient House.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link 
            href="/book" 
            className="hero-cta group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-500 hover:scale-105 shadow-lg shadow-emerald-900/20 overflow-hidden"
          >
            <span className="relative z-10">Book Your Stay</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
          
          <button 
            onClick={scrollToGallery}
            className="hero-cta inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 hover:scale-105"
          >
            Explore Gallery
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-8 md:bottom-12 z-20 flex flex-col items-center gap-2 text-white/60 animate-bounce-slow">
         <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to Explore</span>
         <ChevronDown size={24} />
      </div>

    </section>
  )
}