'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, CalendarDays, Home, HelpCircle, MapPin, Facebook, Mail, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n-context'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hiding on Admin and Portal routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) {
    return null
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const MotionLink = motion(Link)

  return (
    <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-300 pointer-events-none">
      <div className="container mx-auto px-4 py-4 md:py-6">

        {/* The Island / Header Container */}
        <motion.div
          animate={{
            y: scrolled ? 0 : 0,
            width: scrolled ? "100%" : "100%"
          }}
          className={cn(
            "mx-auto flex items-center justify-between transition-all duration-500 pointer-events-auto shadow-sm",
            "md:h-20 h-16 px-6 md:px-10 rounded-[2.5rem] border",
            scrolled
              ? "bg-white/80 backdrop-blur-xl border-white/40 shadow-xl shadow-emerald-900/5 mt-0 max-w-7xl"
              : "bg-white/40 backdrop-blur-md border-white/20 mt-2 max-w-full"
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ rotate: 15 }}
              className="text-2xl"
            >
              🌲
            </motion.span>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg md:text-xl text-emerald-950 tracking-tighter leading-none">
                Globit
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600/80 tracking-widest">
                Transient
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-1 bg-emerald-900/5 p-1.5 rounded-full border border-emerald-900/5">
              {[
                { href: '/', label: t('nav.home'), icon: Home },
                { href: '/#location', label: t('nav.location'), icon: MapPin },
                { href: '/#faq', label: t('nav.faq'), icon: HelpCircle },
              ].map((link) => {
                const isActive = pathname === link.href || (link.href === '/#location' && pathname === '/')
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                        : "text-emerald-900/60 hover:text-emerald-900 hover:bg-white"
                    )}
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="h-4 w-px bg-emerald-900/10 mx-1" />

            <Link href="/track" className={cn(
              "flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-full",
              pathname === '/track'
                ? "bg-emerald-900 text-white"
                : "text-emerald-900 hover:bg-emerald-900/5"
            )}>
              <Search className="w-4 h-4" />
              {t('nav.track')}
            </Link>

            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 rounded-full px-6 h-11 border-b-4 border-emerald-800">
              <Link href="/book" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {t('nav.book')}
              </Link>
            </Button>

            <LanguageSwitcher />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-emerald-950 text-white shadow-lg active:scale-90"
              )}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Full-screen Circular Reveal Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 48px) 48px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 48px) 48px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 48px) 48px)" }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            className="fixed inset-0 bg-emerald-950 pointer-events-auto flex flex-col pt-32 px-10 overflow-hidden"
          >
            {/* Animated Background Ornaments - High Contrast */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                rotate: [0, 180, 0],
                opacity: [0.2, 0.4, 0.2],
                x: [0, 30, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-80 h-80 bg-lime-400 rounded-full blur-[80px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                x: [0, -60, 0],
                y: [0, 40, 0],
                opacity: [0.15, 0.35, 0.15]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.1, 0.25, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-300 rounded-full blur-[90px]"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/95 to-teal-950/90 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              {[
                { href: '/', label: t('nav.home'), icon: Home },
                { href: '/book', label: t('nav.book'), icon: CalendarDays },
                { href: '/track', label: t('nav.track'), icon: Search },
                { href: '/#location', label: t('nav.location'), icon: MapPin },
                { href: '/#faq', label: t('nav.faq'), icon: HelpCircle },
              ].map((link, i) => (
                <MotionLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-center gap-6 text-4xl font-black text-white group"
                >
                  <span className="text-emerald-500/20 group-hover:text-emerald-500 transition-colors tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="group-hover:translate-x-2 transition-transform bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                    {link.label}
                  </span>
                </MotionLink>
              ))}
            </div>

            <div className="relative z-10 mt-auto mb-20">
              <p className="text-emerald-400/50 text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-emerald-400/20" />
                Connect with us
              </p>
              <div className="flex gap-4">
                <motion.a
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  href="https://facebook.com/globit.transient"
                  target="_blank"
                  className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10"
                >
                  <Facebook className="w-6 h-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  href="mailto:contact@globit.com"
                  className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10"
                >
                  <Mail className="w-6 h-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  href="tel:+639123456789"
                  className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10"
                >
                  <Phone className="w-6 h-6" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}