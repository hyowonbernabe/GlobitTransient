"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Calendar,
    Users,
    LogOut,
    Settings,
    DollarSign,
    Menu,
    X,
    BookOpen,
    ShieldAlert,
    BrainCircuit,
    Star,
    ClipboardList,
    Home,
    HandCoins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { handleSignOut } from "@/server/actions/auth"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { useRole } from "./RoleContext"

export function DashboardSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { isAdmin, isAgent } = useRole()

    // Shared links
    const sharedLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/operations", label: "Daily Ops", icon: ClipboardList },
        { href: "/dashboard/bookings", label: "Bookings", icon: BookOpen },
        { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
        { href: "/dashboard/claims", label: isAdmin ? "Review Claims" : "My Claims", icon: HandCoins },
        { href: "/dashboard/reviews", label: "Guest Reviews", icon: Star },
        { href: "/dashboard/commissions", label: "Commissions", icon: DollarSign },
    ]

    // Admin-only links
    const adminLinks = [
        { href: "/dashboard/units", label: "Unit Management", icon: Home },
        { href: "/dashboard/agents", label: "Agent Portal", icon: Users },
        { href: "/dashboard/audit", label: "Audit Logs", icon: ShieldAlert },
        { href: "/dashboard/knowledge", label: "AI Brain", icon: BrainCircuit },
    ]

    const links = isAdmin ? [...sharedLinks, ...adminLinks] : sharedLinks

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl text-emerald-900">
                    <span>🌲</span>
                    <span>{isAdmin ? "Admin" : "Partner"}</span>
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
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                                isActive
                                    ? "bg-emerald-50 text-emerald-900 shadow-sm border border-emerald-200"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    )
                })}

                <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                        pathname === "/dashboard/settings"
                            ? "bg-emerald-50 text-emerald-900 shadow-sm border border-emerald-200"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <form action={handleSignOut}>
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
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
            <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2 font-bold text-lg text-emerald-900">
                    <span>🌲</span>
                    <span>{isAdmin ? "Admin" : "Partner"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-600"
                    >
                        {isOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Mobile Overlay Sidebar */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white flex flex-col pt-16 animate-in slide-in-from-left-full duration-200">
                    <SidebarContent />
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex bg-white border-r border-gray-200 w-64 flex-col h-screen sticky top-0 shrink-0">
                <SidebarContent />
            </aside>
        </>
    )
}
