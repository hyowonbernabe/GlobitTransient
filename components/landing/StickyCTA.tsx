'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n-context'
import { cn } from '@/lib/utils'

export function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false)
    const { scrollY } = useScroll()
    const { t } = useI18n()

    // Show CTA after hero (threshold around 600px)
    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            if (latest > 600) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        })
        return () => unsubscribe()
    }, [scrollY])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-24 right-4 z-[90]"
                >
                    <Link href="/book">
                        <Button
                            size="icon"
                            className="group relative h-14 w-14 rounded-full bg-emerald-950 hover:bg-emerald-900 text-white shadow-2xl shadow-emerald-900/40 border-b-4 border-emerald-800 transition-all hover:-translate-y-1 active:translate-y-0 active:border-b-0"
                        >
                            <div className="flex items-center justify-center">
                                <CalendarDays className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </div>

                            {/* Tooltip-like label for desktop */}
                            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 py-2 px-4 rounded-xl bg-emerald-950 text-white text-xs font-black uppercase tracking-widest opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                                {t('nav.book')}
                                <div className="absolute top-1/2 -right-1 w-2 h-2 bg-emerald-950 rotate-45 -translate-y-1/2" />
                            </div>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                                <motion.div
                                    initial={{ left: '-100%' }}
                                    animate={{ left: '100%' }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
                                    className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                                />
                            </div>
                        </Button>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
