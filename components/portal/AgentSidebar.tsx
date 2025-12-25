'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Wallet, Link as LinkIcon, Menu, X, HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { handleSignOut } from '@/server/actions/auth'
import { NotificationBell } from '@/components/layout/NotificationBell'

export function AgentSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/portal/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/portal/bookings', label: 'My Bookings', icon: Wallet },
    { href: '/portal/claims', label: 'Manual Claims', icon: HandCoins },
    { href: '/portal/tools', label: 'Referral Tools', icon: LinkIcon },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-emerald-800">
          <span>💼</span>
          <span>Partner Portal</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive 
                  ? "bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <form action={handleSignOut}>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
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
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-lg text-emerald-800">
          <span>💼</span>
          <span>Portal</span>
        </div>
        <div className="flex items-center gap-2">
            {/* Dark colored bell for white header on mobile */}
            <div className="bg-emerald-900 rounded-full w-8 h-8 flex items-center justify-center">
                <NotificationBell />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
            {isOpen ? <X /> : <Menu />}
            </Button>
        </div>
      </div>

      {/* Mobile Overlay Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white flex flex-col pt-16 animate-in slide-in-from-left-full duration-200">
           <SidebarContent />
        </div>
      )}

      {/* Desktop Sidebar (Static) */}
      <aside className="hidden md:flex bg-white border-r border-gray-200 w-64 flex-col h-screen sticky top-0 shrink-0 relative">
        {/* We place the notification bell in the sidebar for desktop or separate header?
            Typically sidebars don't have bells. We can put it in the header part of the sidebar content or at the top.
            Let's add it to the header of the sidebar for now to keep layout simple. 
        */}
        <div className="absolute top-4 right-4 md:hidden"> 
            {/* Hidden on desktop here because the design usually has a top bar. 
                But since we don't have a top bar on desktop, we'll embed it in the sidebar header.
            */}
        </div>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-emerald-800">
            <span>💼</span>
            <span>Partner</span>
            </div>
            <div className="bg-emerald-900 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                <NotificationBell />
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            
            return (
                <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                    isActive 
                    ? "bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
                </Link>
            )
            })}
        </nav>

        <div className="p-4 border-t border-gray-100">
            <form action={handleSignOut}>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
            </Button>
            </form>
        </div>
      </aside>
    </>
  )
}