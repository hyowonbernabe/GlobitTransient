"use client"

import Link from "next/link"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Image from "next/image"

interface LogoProps {
  className?: string
  showText?: boolean
  variant?: "dark" | "light"
}

export function Logo({ className = "", showText = true, variant = "dark" }: LogoProps) {
  const container = useRef<HTMLAnchorElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: container })

  const onHover = contextSafe(() => {
    gsap.to(iconRef.current, {
      rotation: 15,
      scale: 1.1,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    })
  })

  return (
    <Link 
      href="/" 
      ref={container} 
      className={`flex items-center gap-2 group outline-none ${className}`} 
      onMouseEnter={onHover}
    >
       <div ref={iconRef} className="relative w-8 h-8 shrink-0">
          <Image 
            src="/window.svg" 
            alt="Globit Logo" 
            fill 
            className="object-contain" 
            priority
          />
       </div>
       {showText && (
         <span className={`font-bold text-xl tracking-tight ${variant === 'light' ? 'text-white' : 'text-gray-900'}`}>
           Globit<span className="text-emerald-500">Transient</span>
         </span>
       )}
    </Link>
  )
}