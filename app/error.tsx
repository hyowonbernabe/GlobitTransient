'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In a real app, log to Sentry or similar service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Something went wrong!</h2>
          <p className="text-sm text-gray-500">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <Button onClick={reset} variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}