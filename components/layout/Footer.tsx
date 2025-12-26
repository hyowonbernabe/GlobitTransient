"use client"

import Link from "next/link"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "./Logo"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-col", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%", // Start animation when top of footer hits 90% of viewport
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      })
    }, footerRef)
    return () => ctx.revert()
  }, { scope: footerRef })

  return (
    <footer ref={footerRef} className="bg-gray-900 text-white pt-20 pb-10 md:pb-20 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Top CTA */}
        <div className="footer-col mb-16 text-center max-w-2xl mx-auto">
           <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
             Ready for your <span className="text-emerald-400">Baguio</span> getaway?
           </h2>
           <p className="text-gray-400 mb-8">
             Experience the cool breeze and warm hospitality of Globit Transient House. Book your stay today.
           </p>
           <Link 
             href="/book" 
             className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105"
           >
             Book Your Stay
           </Link>
        </div>

        <hr className="border-gray-800 mb-12 footer-col" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="footer-col space-y-4">
            <Logo variant="light" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Your home away from home in the City of Pines. Perfect for families, friends, and solo travelers seeking comfort and convenience.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col space-y-4">
            <h3 className="font-bold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/book" className="hover:text-white transition-colors">Units & Rates</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Booking</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col space-y-4">
            <h3 className="font-bold text-lg">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 text-emerald-500" size={18} />
                <span>Bakakeng North, Baguio City,<br/>Benguet, Philippines</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="shrink-0 text-emerald-500" size={18} />
                <span>+63 917 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="shrink-0 text-emerald-500" size={18} />
                <span>bookings@globittransient.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter (Optional) */}
           <div className="footer-col space-y-4">
            <h3 className="font-bold text-lg">Stay Updated</h3>
            <p className="text-sm text-gray-400">
              Subscribe to get special offers and Baguio travel tips.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-full"
              />
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 transition-colors">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-col border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
           <p>© {new Date().getFullYear()} Globit Transient House. All rights reserved.</p>
           <div className="flex gap-6">
             <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
             <Link href="/sitemap" className="hover:text-white">Sitemap</Link>
           </div>
        </div>

      </div>
      
      {/* Decorative Background Blur */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  )
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}