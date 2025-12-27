"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/dashboard/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Home, Upload, X } from "lucide-react"

interface Unit {
    id: string
    name: string
    description: string | null
    capacity: number
    pricePerNight: number
    images: string[]
    isActive: boolean
    _count: { bookings: number }
}

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        capacity: "4",
        pricePerNight: "5000",
        images: [] as string[],
    })

    useEffect(() => {
        loadUnits()
    }, [])

    const loadUnits = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/dashboard/units")
            const data = await res.json()
            setUnits(data)
        } catch (error) {
            console.error("Failed to load units:", error)
        }
        setIsLoading(false)
    }

    const handleImageUpload = async (files: FileList) => {
        if (!files.length) return
        if (formData.images.length + files.length > 10) {
            alert("Maximum 10 images allowed per unit")
            return
        }

        setUploadingImages(true)

        try {
            const uploadedUrls: string[] = []

            for (const file of Array.from(files)) {
                const formDataUpload = new FormData()
                formDataUpload.append("file", file)

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                })

                if (res.ok) {
                    const { url } = await res.json()
                    uploadedUrls.push(url)
                }
            }

            setFormData({
                ...formData,
                images: [...formData.images, ...uploadedUrls],
            })
        } catch (error) {
            console.error("Failed to upload images:", error)
            alert("Failed to upload images")
        }

        setUploadingImages(false)
    }

    const removeImage = (index: number) => {
        const newImages = [...formData.images]
        newImages.splice(index, 1)
        setFormData({ ...formData, images: newImages })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        const payload = {
            ...formData,
            capacity: parseInt(formData.capacity),
            pricePerNight: parseInt(formData.pricePerNight),
        }

        try {
            const url = editingUnit
                ? `/api/dashboard/units/${editingUnit.id}`
                : "/api/dashboard/units"

            const res = await fetch(url, {
                method: editingUnit ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setShowDialog(false)
                setEditingUnit(null)
                resetForm()
                loadUnits()
                alert(editingUnit ? "Unit updated!" : "Unit created!")
            } else {
                const error = await res.json()
                alert(error.error || "Failed to save unit")
            }
        } catch (error) {
            console.error("Failed to save unit:", error)
            alert("Failed to save unit")
        }

        setIsProcessing(false)
    }

    const handleDelete = async (unitId: string, bookingCount: number) => {
        if (bookingCount > 0) {
            alert(`Cannot delete this unit. It has ${bookingCount} booking(s) associated with it.`)
            return
        }

        if (!confirm("Delete this unit? This action cannot be undone.")) return

        setIsProcessing(true)

        try {
            const res = await fetch(`/api/dashboard/units/${unitId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                loadUnits()
                alert("Unit deleted")
            } else {
                const error = await res.json()
                alert(error.error || "Failed to delete unit")
            }
        } catch (error) {
            console.error("Failed to delete unit:", error)
            alert("Failed to delete unit")
        }

        setIsProcessing(false)
    }

    const openEditDialog = (unit: Unit) => {
        setEditingUnit(unit)
        setFormData({
            name: unit.name,
            description: unit.description || "",
            capacity: unit.capacity.toString(),
            pricePerNight: (unit.pricePerNight / 100).toString(),
            images: unit.images,
        })
        setShowDialog(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            capacity: "4",
            pricePerNight: "5000",
            images: [],
        })
    }

    const formatMoney = (val: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(val / 100)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Home className="w-8 h-8 text-emerald-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Unit Management</h1>
                        <p className="text-gray-500">Manage rental units and properties</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        resetForm()
                        setEditingUnit(null)
                        setShowDialog(true)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                </Button>
            </div>

            <DataTable
                data={units}
                isLoading={isLoading}
                searchPlaceholder="Search by unit name..."
                searchableKeys={["name", "description"]}
                filters={[
                    {
                        key: "isActive",
                        label: "Status",
                        options: [
                            { value: "true", label: "Active" },
                            { value: "false", label: "Inactive" },
                        ],
                    },
                ]}
                columns={[
                    {
                        key: "name",
                        label: "Unit Name",
                        sortable: true,
                        render: (row: Unit) => (
                            <div className="flex items-center gap-3">
                                {row.images[0] && (
                                    <img
                                        src={row.images[0]}
                                        alt={row.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                )}
                                <div>
                                    <div className="font-medium">{row.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {row.images.length} image{row.images.length !== 1 ? "s" : ""}
                                    </div>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "capacity",
                        label: "Capacity",
                        sortable: true,
                        render: (row: Unit) => <span>{row.capacity} pax</span>,
                    },
                    {
                        key: "pricePerNight",
                        label: "Price/Night",
                        sortable: true,
                        render: (row: Unit) => (
                            <span className="font-semibold text-emerald-700">
                                {formatMoney(row.pricePerNight)}
                            </span>
                        ),
                    },
                    {
                        key: "bookings",
                        label: "Bookings",
                        render: (row: Unit) => (
                            <span className="text-sm text-gray-600">
                                {row._count.bookings} total
                            </span>
                        ),
                    },
                    {
                        key: "isActive",
                        label: "Status",
                        render: (row: Unit) => (
                            <Badge className={row.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {row.isActive ? "Active" : "Inactive"}
                            </Badge>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        render: (row: Unit) => (
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(row)}
                                    disabled={isProcessing}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(row.id, row._count.bookings)}
                                    disabled={isProcessing}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ),
                    },
                ]}
            />

            {/* Add/Edit Unit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Unit Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., Villa Sunrise"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Brief description of the unit..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="capacity">Capacity (pax) *</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="pricePerNight">Price per Night (₱) *</Label>
                                <Input
                                    id="pricePerNight"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={formData.pricePerNight}
                                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Images ({formData.images.length}/10)</Label>
                            <div className="mt-2 space-y-3">
                                {/* Image Upload */}
                                <label className="flex flex-col items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-6 hover:bg-gray-50">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {uploadingImages ? "Uploading..." : "Click to upload images"}
                                    </span>
                                    <span className="text-xs text-gray-500">Max 10 images, 10MB each</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                        disabled={uploadingImages}
                                    />
                                </label>

                                {/* Image Preview Grid */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`Unit image ${idx + 1}`}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDialog(false)
                                    setEditingUnit(null)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing || uploadingImages}>
                                {isProcessing ? "Saving..." : editingUnit ? "Update Unit" : "Create Unit"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
