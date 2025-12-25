import { signOut } from '@/server/auth'
import Link from 'next/link'
import { LayoutDashboard, Calendar, Users, Home, LogOut, Settings, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar / Mobile Header */}
      <aside className="bg-emerald-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-emerald-800 flex items-center gap-2 font-bold text-xl">
          <span>🌲</span>
          <span>Globit Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors bg-emerald-800/50 text-emerald-50">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/admin/calendar" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-emerald-200 hover:text-white">
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </Link>

          <Link href="/admin/units" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-emerald-200 hover:text-white">
            <Home className="w-5 h-5" />
            <span>Unit Management</span>
          </Link>
          
          <Link href="/admin/agents" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-emerald-200 hover:text-white">
            <Users className="w-5 h-5" />
            <span>Agent Portal</span>
          </Link>

          <Link href="/admin/claims" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-emerald-200 hover:text-white">
            <DollarSign className="w-5 h-5" />
            <span>Commissions</span>
          </Link>

          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-emerald-200 hover:text-white">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-emerald-800">
           <form
             action={async () => {
               'use server';
               await signOut({ redirectTo: '/admin/login' });
             }}
           >
             <Button variant="ghost" className="w-full justify-start text-emerald-200 hover:text-white hover:bg-emerald-800">
               <LogOut className="w-5 h-5 mr-3" />
               Sign Out
             </Button>
           </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  )
}