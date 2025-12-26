import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { I18nProvider } from '@/lib/i18n-context'
import { SmoothScroll } from '@/components/layout/SmoothScroll'

// Load Inter font
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Globit Transient House | Baguio City',
  description: 'Your affordable and cozy home in the City of Pines. Perfect for families, friends, and backpackers.',
  icons: {
    icon: '/favicon.ico', // Ensure you have a favicon in public/
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <I18nProvider>
          <SmoothScroll>
            {children}

            {/* Global Chat Widget - Appears on every page */}
            <ChatWidget />
          </SmoothScroll>
        </I18nProvider>
      </body>
    </html>
  )
}