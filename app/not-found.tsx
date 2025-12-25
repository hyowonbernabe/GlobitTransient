import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-emerald-900/10 select-none">404</h1>
        
        <div className="-mt-16 space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}