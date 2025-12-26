import { Navbar } from "@/components/layout/Navbar"

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  )
}