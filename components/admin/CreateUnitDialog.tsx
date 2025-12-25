'use client'

import { useState } from 'react'
import { createUnit } from '@/server/actions/unit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react'

export function CreateUnitDialog() {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Image State
  const [imageList, setImageList] = useState<string[]>([''])

  const handleAddImage = () => setImageList([...imageList, ''])
  
  const handleRemoveImage = (index: number) => {
    const newList = [...imageList]
    newList.splice(index, 1)
    setImageList(newList)
  }

  const handleImageChange = (index: number, value: string) => {
    const newList = [...imageList]
    newList[index] = value
    setImageList(newList)
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    setError(null)
    
    // Append images
    imageList.forEach(img => {
        if (img.trim()) formData.append('images', img.trim())
    })

    const result = await createUnit(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsSaving(false)
    } else {
      setOpen(false)
      setIsSaving(false)
      // Reset images
      setImageList([''])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogDescription>
            Create a new room listing.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Family Room A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (PHP)</Label>
              <Input id="basePrice" name="basePrice" type="number" required placeholder="1500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              required 
              placeholder="Describe the room, view, and features..." 
              className="h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Images (URLs)</Label>
            {imageList.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                    <Input 
                        placeholder="https://..." 
                        value={url}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                    />
                    {imageList.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveImage(index)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    )}
                </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={handleAddImage} className="text-emerald-600">
                <Plus className="w-3 h-3 mr-2" /> Add another
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePax">Base Pax</Label>
              <Input id="basePax" name="basePax" type="number" required defaultValue="2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPax">Max Pax</Label>
              <Input id="maxPax" name="maxPax" type="number" required defaultValue="4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraPaxPrice">Extra Head (PHP)</Label>
              <Input id="extraPaxPrice" name="extraPaxPrice" type="number" required defaultValue="500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="hasOwnCR">Own CR</Label>
              <Switch id="hasOwnCR" name="hasOwnCR" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="hasTV">Television</Label>
              <Switch id="hasTV" name="hasTV" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="hasRef">Refrigerator</Label>
              <Switch id="hasRef" name="hasRef" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="hasHeater">Heater</Label>
              <Switch id="hasHeater" name="hasHeater" />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Unit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}