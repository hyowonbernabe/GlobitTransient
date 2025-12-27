"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Upload, HandCoins } from "lucide-react"
import { submitClaimRequest, searchUnclaimedBookings } from "@/server/actions/claim"

interface Booking {
    id: string
    checkIn: Date
    checkOut: Date
    totalPrice: number
    user: { name: string | null; mobile: string | null }
    unit: { name: string }
}

export function AgentClaimsView() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Booking[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    // Claim form
    const [description, setDescription] = useState("")
    const [proofImage, setProofImage] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setIsSearching(true)
        setError("")

        const result = await searchUnclaimedBookings(searchQuery)

        if (result.error) {
            setError(result.error)
        } else {
            setSearchResults(result.bookings || [])
        }

        setIsSearching(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBooking) return

        setIsSubmitting(true)
        setError("")
        setSuccess("")

        const formData = new FormData()
        formData.append("bookingId", selectedBooking.id)
        formData.append("description", description)
        if (proofImage) {
            formData.append("proofImage", proofImage)
        }

        const result = await submitClaimRequest(formData)

        if (result.error) {
            setError(result.error)
        } else {
            setSuccess("Claim submitted successfully! Admins will review it soon.")
            setSelectedBooking(null)
            setDescription("")
            setProofImage(null)
            setSearchQuery("")
            setSearchResults([])
        }

        setIsSubmitting(false)
    }

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(date))

    const formatMoney = (val: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(val / 100)

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search Unclaimed Bookings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by booking ID, guest name, or unit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? "Searching..." : "Search"}
                        </Button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">
                                {searchResults.length} unclaimed booking(s) found
                            </p>
                            <div className="space-y-2">
                                {searchResults.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBooking?.id === booking.id
                                                ? "bg-emerald-50 border-emerald-500"
                                                : "hover:bg-gray-50"
                                            }`}
                                        onClick={() => setSelectedBooking(booking)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">
                                                    {booking.user.name || "Walk-in"} • {booking.unit.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {booking.id.slice(0, 8)} | {formatDate(booking.checkIn)} →{" "}
                                                    {formatDate(booking.checkOut)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">{formatMoney(booking.totalPrice)}</div>
                                                <div className="text-xs text-gray-500">
                                                    Est. 5% = {formatMoney(booking.totalPrice * 0.05)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {searchResults.length === 0 && searchQuery && !isSearching && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No unclaimed bookings found
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Claim Submission Form */}
            {selectedBooking && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HandCoins className="w-5 h-5" />
                            Submit Claim
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                                    {success}
                                </div>
                            )}

                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm font-medium">Selected Booking:</div>
                                <div className="text-sm mt-1">
                                    {selectedBooking.user.name} • {selectedBooking.unit.name} •{" "}
                                    {formatMoney(selectedBooking.totalPrice)}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Explain why you should receive this commission (e.g., 'I assisted this guest with booking', 'I provided the referral', etc.)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="proofImage">
                                    Proof Image <span className="text-gray-500">(optional)</span>
                                </Label>
                                <div className="mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-4 hover:bg-gray-50">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {proofImage ? proofImage.name : "Click to upload image (max 10MB)"}
                                        </span>
                                        <input
                                            type="file"
                                            id="proofImage"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload chat screenshots, emails, or other proof of your involvement
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Claim"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedBooking(null)
                                        setDescription("")
                                        setProofImage(null)
                                        setError("")
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
