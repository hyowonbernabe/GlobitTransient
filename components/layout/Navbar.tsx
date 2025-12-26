"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { useMotionValueEvent, useScroll, motion } from "framer-motion"
import { Menu, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo } from "./Logo"
import { NavMenuOverlay } from "./NavMenuOverlay"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [isHidden, setIsHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { scrollY } = useScroll()
  const lastYRef = useRef(0)
  const pathname = usePathname()

  // Logic: Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastYRef.current
    
    // Show glass effect after scrolling a bit
    setIsScrolled(latest > 50)
    
    // Hide navbar if scrolling down more than 100px and not at the very top
    if (Math.abs(diff) > 20) {
      if (diff > 0 && latest > 100) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
    }
    
    lastYRef.current = latest
  })

  // Do not render complex navbar on admin routes (usually have their own sidebar)
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/portal")) {
    return null
  }

  const isBookPage = pathname === "/book"

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Logo variant="dark" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/book" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Units
            </Link>
            <Link href="/track" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Track Booking
            </Link>
            <Link href="/#faq" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
             {/* Book Button (Desktop Only, and hidden on /book page) */}
            {!isBookPage && (
              <Button 
                asChild
                className="hidden md:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6"
              >
                <Link href="/book">
                  Book Now
                </Link>
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

             {/* User Profile / Login (Optional placeholder) */}
             <div className="hidden md:block">
                 {/* Logic for auth state would go here */}
                 <Button variant="ghost" size="icon" className="rounded-full text-gray-500">
                    <User className="w-5 h-5" />
                 </Button>
             </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <NavMenuOverlay 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}