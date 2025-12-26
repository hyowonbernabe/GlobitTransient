'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { initiateCheckout } from "@/server/actions/gateway"
import { Loader2, AlertCircle, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentCheckoutProps {
  bookingId: string
  amount: string
}

export function PaymentCheckout({ bookingId, amount }: PaymentCheckoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePay = async () => {
    setIsLoading(true)
    setError("")

    const result = await initiateCheckout(bookingId)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.url) {
      // Redirect to PayMongo
      router.push(result.url)
    }
  }

  return (
    <Card className="border-emerald-100 shadow-md">
      <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
        <CardTitle className="text-emerald-800 flex justify-between items-center">
          <span>Pay Securely</span>
          <CreditCard className="w-5 h-5 text-emerald-600" />
        </CardTitle>
        <CardDescription>You will be redirected to our secure payment partner.</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-center gap-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
           {/* You can add logos here later */}
           <div className="text-xs font-bold border px-2 py-1 rounded">GCash</div>
           <div className="text-xs font-bold border px-2 py-1 rounded">Maya</div>
           <div className="text-xs font-bold border px-2 py-1 rounded">Visa/MC</div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        <Button 
          className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
          onClick={handlePay}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Redirecting...
            </>
          ) : (
            `Pay ${amount}`
          )}
        </Button>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          Powered by PayMongo. Secure 256-bit SSL encrypted payment.
        </p>
      </CardContent>
    </Card>
  )
}