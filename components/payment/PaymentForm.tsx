'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitPaymentProof } from "@/server/actions/payment"
import { Loader2, AlertCircle } from "lucide-react"

interface PaymentFormProps {
  bookingId: string
}

export function PaymentForm({ bookingId }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    
    // We call the server action manually here to capture the result
    const result = await submitPaymentProof(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      // On success, the server action calls revalidatePath, which refreshes the parent page.
      // We keep isSubmitting true to prevent double clicks until the UI updates.
      setIsSubmitting(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      
      <div className="space-y-2">
        <Label htmlFor="ref">Reference Number / Payment Details</Label>
        <Input 
          id="ref" 
          name="referenceNumber" 
          placeholder="e.g. 1234 5678 9012" 
          required 
          className="font-mono"
        />
        <p className="text-xs text-gray-500">
          Please enter the GCash reference no. found in your receipt.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Payment Proof"
        )}
      </Button>
    </form>
  )
}