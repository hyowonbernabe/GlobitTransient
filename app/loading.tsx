"use client"

import { motion } from "framer-motion"
import { Logo } from "@/components/layout/Logo"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Logo */}
        <div className="relative">
            <motion.div
                animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1]
                }}
                transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            >
                <Logo variant="dark" className="scale-150 pointer-events-none" />
            </motion.div>
            
            {/* Subtle glow behind logo */}
            <div className="absolute inset-0 bg-emerald-100/50 blur-xl rounded-full -z-10" />
        </div>

        {/* Minimal loading bar */}
        <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mt-4">
            <motion.div 
                className="h-full bg-emerald-500 rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            />
        </div>
      </motion.div>
    </div>
  )
}