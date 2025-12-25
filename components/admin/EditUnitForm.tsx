'use client'

import { updateUnit } from '@/server/actions/unit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface UnitData {
  id: string
  name: string
  description: string
  basePrice: number
  basePax: number
  maxPax: number
  extraPaxPrice: number
  hasTV: boolean
  hasRef: boolean
  hasHeater: boolean
  hasOwnCR: boolean
}

export function EditUnitForm({ unit }: { unit: UnitData }) {
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Convert centavos back to main currency unit for the input field
  const priceInPeso = unit.basePrice / 100
  const extraPriceInPeso = unit.extraPaxPrice / 100

  async function clientAction(formData: FormData) {
    setIsSaving(true)
    setError(null)
    
    // Call server action
    const result = await updateUnit(unit.id, formData)
    
    if (result?.error) {
      setError(result.error)
      setIsSaving(false)
    }
    // On success, the server action redirects, so we don't need to manually reset saving state
  }

  return (
    <form action={clientAction}>
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name</Label>
              <Input id="name" name="name" defaultValue={unit.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (PHP)</Label>
              <Input 
                id="basePrice" 
                name="basePrice" 
                type="number" 
                defaultValue={priceInPeso} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={unit.description} 
              className="h-32"
              required 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Capacity & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="basePax">Base Pax (Inclusive)</Label>
            <Input 
              id="basePax" 
              name="basePax" 
              type="number" 
              defaultValue={unit.basePax} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPax">Max Capacity</Label>
            <Input 
              id="maxPax" 
              name="maxPax" 
              type="number" 
              defaultValue={unit.maxPax} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extraPaxPrice">Extra Head Charge (PHP)</Label>
            <Input 
              id="extraPaxPrice" 
              name="extraPaxPrice" 
              type="number" 
              defaultValue={extraPriceInPeso} 
              required 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="hasOwnCR">Own CR</Label>
              <p className="text-sm text-gray-500">Does this unit have a private bathroom?</p>
            </div>
            <Switch id="hasOwnCR" name="hasOwnCR" defaultChecked={unit.hasOwnCR} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="hasTV">Television</Label>
              <p className="text-sm text-gray-500">Is a TV included?</p>
            </div>
            <Switch id="hasTV" name="hasTV" defaultChecked={unit.hasTV} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="hasRef">Refrigerator</Label>
              <p className="text-sm text-gray-500">Is a personal ref included?</p>
            </div>
            <Switch id="hasRef" name="hasRef" defaultChecked={unit.hasRef} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="hasHeater">Water Heater</Label>
              <p className="text-sm text-gray-500">Is hot shower available?</p>
            </div>
            <Switch id="hasHeater" name="hasHeater" defaultChecked={unit.hasHeater} />
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t flex flex-col items-end py-4 gap-2">
          {error && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}