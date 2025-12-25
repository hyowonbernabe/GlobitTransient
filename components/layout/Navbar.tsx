'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/book', label: 'Book Now' },
    { href: '/#location', label: 'Location' },
    { href: '/faq', label: 'FAQ' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="text-2xl">🌲</span>
          <span className="tracking-tight">Globit Transient</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-gray-300 mx-2" />
          <button className="text-sm font-medium text-gray-500 hover:text-primary">
            FIL
          </button>
        </div>

        {/* Mobile Burger */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 animate-accordion-down">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
             <span className="text-sm text-gray-500">Language</span>
             <div className="flex gap-2">
               <button className="text-sm font-bold text-primary bg-emerald-50 px-2 py-1 rounded">EN</button>
               <button className="text-sm text-gray-500 px-2 py-1">FIL</button>
             </div>
          </div>
        </div>
      )}
    </nav>
  )
}