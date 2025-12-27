"use client"

import { motion } from "framer-motion"

export function PineTreeLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-8">
      {/* Growing Pine Tree */}
      <div className="relative w-24 h-32 flex items-end justify-center overflow-hidden">
        <motion.svg
          width="100"
          height="120"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-emerald-600"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{
            duration: 1.2, // Faster duration
            ease: "backOut", // Bouncy growth effect
            delay: 0.1
          }}
          style={{ originY: 1 }} // Grow from bottom
        >
          {/* Solid Tree Shape for "Growth" feeling */}
          <path
            d="M50 10 L80 50 H65 L85 90 H15 L35 50 H20 L50 10 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Trunk */}
          <path
            d="M45 90 V110 H55 V90"
            fill="currentColor"
          />
        </motion.svg>
      </div>

      {/* Loading Bar */}
      <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 1.5, // Matches or slightly exceeds tree growth
            ease: "easeInOut",
            repeat: Infinity, // Loop to show activity if load is long
            repeatType: "loop",
            repeatDelay: 0.5
          }}
        />
      </div>
    </div>
  )
}