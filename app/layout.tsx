import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Globit Transient House',
  description: 'Your home in Baguio City',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          {children}
          <MobileBottomNav />
          <Toaster position="top-center" />
      </body>
    </html>
  )
}