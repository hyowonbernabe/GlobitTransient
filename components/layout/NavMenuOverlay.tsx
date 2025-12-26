"use client"

import { motion, AnimatePresence, Variants } from "framer-motion"
import Link from "next/link"
import { X, ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { Logo } from "./Logo"
import { Button } from "@/components/ui/button"

interface NavMenuOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function NavMenuOverlay({ isOpen, onClose }: NavMenuOverlayProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const linkVariants: Variants = {
    closed: { y: 20, opacity: 0 },
    open: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.1 + i * 0.1, duration: 0.4, ease: "easeOut" }
    })
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/book", label: "Book A Stay" },
    { href: "/track", label: "Track Booking" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#contact", label: "Contact Us" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
          className="fixed inset-0 z-[60] bg-white flex flex-col p-6 md:hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <Logo />
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-6">
            {links.map((link, i) => (
              <motion.div key={link.href} custom={i} variants={linkVariants}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-between group"
                >
                  {link.label}
                  <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-emerald-500 transition-colors -rotate-45 group-hover:rotate-0" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Footer Info */}
          <motion.div
            variants={linkVariants}
            custom={links.length}
            className="mt-auto pt-8 border-t border-gray-100"
          >
             <p className="text-sm text-gray-500 mb-2">Need help with your booking?</p>
             <a href="tel:+639171234567" className="text-xl font-bold text-emerald-600 block mb-4">
               +63 917 123 4567
             </a>
             <Button className="w-full text-lg h-12 bg-emerald-600 hover:bg-emerald-700" onClick={onClose}>
                Close Menu
             </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}