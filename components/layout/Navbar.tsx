'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
          <Link href="/" className={cn("text-sm font-medium transition-colors hover:text-emerald-700", pathname === '/' ? "text-emerald-800" : "text-gray-600")}>
            {t('nav.home')}
          </Link>
          <Link href="/#location" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
            {t('nav.location')}
          </Link>
          <Link href="/faq" className={cn("text-sm font-medium transition-colors hover:text-emerald-700", pathname === '/faq' ? "text-emerald-800" : "text-gray-600")}>
            {t('nav.faq')}
          </Link>

          <div className="h-4 w-px bg-gray-200 mx-2" />

          <Link href="/track" className={cn(
            "flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full",
            pathname === '/track' ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-700"
          )}>
            <Search className="w-3.5 h-3.5" />
            {t('nav.track')}
          </Link>

          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-sm gap-2">
            <Link href="/book">
              <CalendarDays className="w-4 h-4" />
              {t('nav.book')}
            </Link>
          </Button>

          <div className="h-4 w-px bg-gray-200 mx-2" />
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
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50 flex items-center justify-between">
            {t('nav.home')}
          </Link>
          <Link href="/#location" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50 flex items-center justify-between">
            {t('nav.location')}
          </Link>
          <Link href="/faq" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50 flex items-center justify-between">
            {t('nav.faq')}
          </Link>

          <Link href="/track" onClick={() => setIsOpen(false)} className="text-lg font-bold text-emerald-700 py-3 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5" />
              {t('nav.track')}
            </div>
          </Link>

          <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold shadow-md shadow-emerald-100 gap-3">
            <Link href="/book" onClick={() => setIsOpen(false)}>
              <CalendarDays className="w-6 h-6" />
              {t('nav.book')}
            </Link>
          </Button>

          <div className="flex items-center justify-between pt-6 mt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Language Settings</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  )
}