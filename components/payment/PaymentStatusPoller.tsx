'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw } from 'lucide-react'
import { checkPaymentStatus } from '@/server/actions/gateway'
import { useRouter } from 'next/navigation'

export function PaymentStatusPoller({ bookingId }: { bookingId: string }) {
    const router = useRouter()
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        const interval = setInterval(async () => {
            const result = await checkPaymentStatus(bookingId)
            if (result.status === 'confirmed') {
                router.refresh()
            }
            setRetryCount(c => c + 1)
        }, 3000) // Check every 3 seconds

        return () => clearInterval(interval)
    }, [bookingId, router])

    return (
        <Card className="w-full max-w-md text-center p-8 space-y-6 shadow-md border-yellow-100">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
                <CardTitle className="text-xl font-bold text-gray-900">Verifying Payment...</CardTitle>
                <p className="text-gray-600 mt-2">
                    We are confirming your transaction with the payment provider.
                </p>
            </div>
            
            <div className="bg-gray-50 text-gray-600 p-4 rounded-lg text-sm">
                Please wait a moment... (Attempt {retryCount})
            </div>

            <Button onClick={() => router.refresh()} variant="outline" className="w-full gap-2">
                <RefreshCcw className="w-4 h-4" />
                Check Manually
            </Button>
        </Card>
    )
}