'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n-context'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  // STRICTLY HIDE on Admin and Portal routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) {
    return null
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/book', label: t('nav.book') },
    { href: '/track', label: t('nav.track') },
    { href: '/#location', label: t('nav.location') },
    { href: '/faq', label: t('nav.faq') },
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
          <LanguageSwitcher />
        </div>

        {/* Mobile Burger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="md:hidden text-gray-600"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
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
             <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  )
}