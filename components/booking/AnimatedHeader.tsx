'use client'

import { motion } from 'framer-motion'

export function AnimatedHeader() {
    return (
        <div className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-emerald-950">
            <div className="absolute inset-0 opacity-40">
                <img src="/assets/images/baguio_background_fog.png" className="w-full h-full object-cover" alt="Baguio" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-transparent to-[#fcfdfc]" />

            <div className="container mx-auto px-4 relative z-10 text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black text-white tracking-tighter"
                >
                    Find Your Space
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-emerald-100/60 font-medium text-lg max-w-xl mx-auto"
                >
                    Curated units for the ultimate Baguio experience.
                </motion.p>
            </div>
        </div>
    )
}
