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
    const [isConfirmed, setIsConfirmed] = useState(false)

    useEffect(() => {
        if (isConfirmed) return

        const interval = setInterval(async () => {
            try {
                const result = await checkPaymentStatus(bookingId)
                if (result.status === 'confirmed') {
                    setIsConfirmed(true)
                    clearInterval(interval)
                    router.refresh()
                }
            } catch (e) {
                console.error("Polling error:", e)
            }
            setRetryCount(c => c + 1)
        }, 2500) // Slightly faster polling

        return () => clearInterval(interval)
    }, [bookingId, router, isConfirmed])

    return (
        <Card className="w-full max-w-md text-center p-8 space-y-6 shadow-xl border-t-4 border-t-emerald-500">
            <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                {isConfirmed ? (
                    <Loader2 className="w-10 h-10 animate-spin" /> // Keep spinning while router refreshes
                ) : (
                    <Loader2 className="w-10 h-10 animate-spin" />
                )}
            </div>
            <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    {isConfirmed ? "Payment Verified!" : "Verifying Payment..."}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                    {isConfirmed
                        ? "Redirecting you to your confirmation details..."
                        : "We are confirming your transaction with the payment provider. This usually takes a few seconds."}
                </p>
            </div>

            {!isConfirmed && (
                <div className="bg-gray-50 text-gray-500 p-4 rounded-lg text-sm border border-gray-100 italic">
                    Waiting for confirmation... (Attempt {retryCount})
                </div>
            )}

            <Button onClick={() => router.refresh()} variant="outline" className="w-full gap-2 font-semibold">
                <RefreshCcw className="w-4 h-4" />
                Refresh Page
            </Button>
        </Card>
    )
}