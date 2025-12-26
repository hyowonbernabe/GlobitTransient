"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, FileText, Phone } from "lucide-react"
import { motion } from "framer-motion"

export function MobileBottomNav() {
  const pathname = usePathname()

  // Do not show on Admin or Portal routes
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/portal")) {
    return null
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/book", label: "Book", icon: Search },
    { href: "/track", label: "Track", icon: FileText },
    { href: "/#contact", label: "Contact", icon: Phone },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <nav className="flex justify-around items-center h-16 pb-1">
        {navItems.map((item) => {
          // Check active state (exact match for home, startsWith for others)
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href.replace('/#', ''))

          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform"
            >
               <div className="relative p-1">
                 <item.icon
                   size={22}
                   strokeWidth={isActive ? 2.5 : 2}
                   className={`transition-colors duration-200 ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                 />
                 {isActive && (
                   <motion.div
                     layoutId="bottomNavIndicator"
                     className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"
                     initial={false}
                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
                   />
                 )}
               </div>
               <span className={`text-[10px] font-medium leading-none ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                 {item.label}
               </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}