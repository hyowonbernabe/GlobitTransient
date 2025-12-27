'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react"

interface PaymentFailedProps {
    bookingId: string
    reason?: 'cancelled' | 'failed' | 'expired'
}

export function PaymentFailed({ bookingId, reason = 'cancelled' }: PaymentFailedProps) {
    const content = {
        cancelled: {
            title: "Payment Cancelled",
            message: "You cancelled the payment process. No charges were made to your account.",
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100",
            primaryAction: "Try Again"
        },
        failed: {
            title: "Payment Failed",
            message: "We couldn't process your payment. Please check your details or try a different method.",
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100",
            primaryAction: "Retry Payment"
        },
        expired: {
            title: "Session Expired",
            message: "The payment session has timed out. Please start a new payment.",
            icon: HelpCircle,
            color: "text-orange-600",
            bg: "bg-orange-100",
            primaryAction: "Start Over"
        }
    }[reason]

    const Icon = content.icon

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
            <Card className="text-center p-8 space-y-6 shadow-xl border-red-100">
                <div className={`mx-auto w-20 h-20 ${content.bg} rounded-full flex items-center justify-center ${content.color} mb-4`}>
                    <Icon className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
                    <p className="text-gray-600 max-w-xs mx-auto">
                        {content.message}
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 border border-gray-100">
                    Booking Reference: <span className="font-mono font-bold text-gray-900 ml-1 select-all">{bookingId}</span>
                </div>

                <div className="space-y-3 pt-2">
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg shadow-md shadow-emerald-100">
                        <a href={`/payment/${bookingId}`}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {content.primaryAction}
                        </a>
                    </Button>

                    <Button asChild variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
                        <a href="/track">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Track Booking Status
                        </a>
                    </Button>
                </div>
            </Card>
        </div>
    )
}
