'use client'

import { useState } from 'react'
import { updatePassword } from '@/server/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, Lock } from 'lucide-react'

export function ChangePasswordForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    
    // Client-side match check (optional, schema handles it too but this is faster feedback)
    const newPass = formData.get('newPassword') as string
    const confirmPass = formData.get('confirmPassword') as string
    
    if (newPass !== confirmPass) {
        setMessage({ type: 'error', text: "New passwords do not match." })
        setIsSaving(false)
        return
    }

    const result = await updatePassword(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: "Password updated successfully." })
      // Reset form
      event.currentTarget.reset()
    }
    setIsSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Security
        </CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
            </div>

            {message && (
                <div className={`text-sm p-3 rounded-md flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t py-4">
            <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                    </>
                ) : (
                    'Update Password'
                )}
            </Button>
        </CardFooter>
      </form>
    </Card>
  )
}