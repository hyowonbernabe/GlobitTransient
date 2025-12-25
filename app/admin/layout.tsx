import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}