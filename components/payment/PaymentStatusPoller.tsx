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
        }, 2000)

        return () => clearInterval(interval)
    }, [bookingId, router, isConfirmed])

    return (
        <Card className="w-full max-w-md text-center p-10 space-y-8 shadow-2xl border-0 ring-1 ring-emerald-100 bg-white/95 backdrop-blur-sm">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                {/* Pulsing Background */}
                {!isConfirmed && (
                    <>
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20 duration-1000" />
                        <div className="absolute inset-2 bg-emerald-50 rounded-full animate-pulse" />
                    </>
                )}

                <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isConfirmed ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
                    {isConfirmed ? (
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <Loader2 className="w-10 h-10 animate-spin" />
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
                    {isConfirmed ? "Payment Verified" : "Verifying & Securing Slot..."}
                </CardTitle>
                <div className="space-y-1">
                    <p className="text-gray-600 text-lg">
                        {isConfirmed
                            ? "Redirecting you to the confirmation page."
                            : "Please wait while we confirm your transaction."}
                    </p>
                    {!isConfirmed && (
                        <p className="text-xs text-emerald-600 font-medium animate-pulse">
                            Do not close this window.
                        </p>
                    )}
                </div>
            </div>

            {/* Slow Network Feedback */}
            {retryCount > 8 && !isConfirmed && (
                <div className="bg-amber-50 text-amber-900/80 p-4 rounded-xl text-sm border border-amber-100 flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Taking longer than usual... still checking.</span>
                </div>
            )}

            {!isConfirmed && (
                <Button onClick={() => router.refresh()} variant="ghost" className="text-xs text-gray-400 hover:text-gray-600">
                    <RefreshCcw className="w-3 h-3 mr-1" />
                    Stuck? Click to Refresh
                </Button>
            )}
        </Card>
    )
}