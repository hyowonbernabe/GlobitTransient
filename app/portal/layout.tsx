import { AgentSidebar } from '@/components/portal/AgentSidebar'

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <AgentSidebar />

      {/* Main Content */}
      <main className="flex-1 w-full p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}