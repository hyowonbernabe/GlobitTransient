'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, Home, LogOut, Settings, DollarSign, Menu, X, BookOpen, ShieldAlert, BrainCircuit, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { handleSignOut } from '@/server/actions/auth'
import { NotificationBell } from '@/components/layout/NotificationBell'

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
    { href: '/admin/units', label: 'Unit Management', icon: Home },
    { href: '/admin/reviews', label: 'Guest Reviews', icon: Star },
    { href: '/admin/agents', label: 'Agent Portal', icon: Users },
    { href: '/admin/claims', label: 'Commissions', icon: DollarSign },
    { href: '/admin/audit', label: 'Audit Logs', icon: ShieldAlert },
    { href: '/admin/knowledge', label: 'AI Brain', icon: BrainCircuit },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-emerald-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <span>🌲</span>
          <span>Admin</span>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)} // Close on mobile click
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <form action={handleSignOut}>
          <Button variant="ghost" className="w-full justify-start text-emerald-200 hover:text-white hover:bg-emerald-800">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-emerald-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span>🌲</span>
          <span>Admin</span>
        </div>
        <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-emerald-800">
            {isOpen ? <X /> : <Menu />}
            </Button>
        </div>
      </div>

      {/* Mobile Overlay Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-emerald-900 flex flex-col pt-16 animate-in slide-in-from-left-full duration-200">
           <SidebarContent />
        </div>
      )}

      {/* Desktop Sidebar (Static) */}
      <aside className="hidden md:flex bg-emerald-900 w-64 flex-col h-screen sticky top-0 shrink-0 overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  )
}