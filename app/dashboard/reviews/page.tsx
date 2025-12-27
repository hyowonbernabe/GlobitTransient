"use client"

import { useState, useEffect } from "react"
import { useRole } from "@/components/dashboard/RoleContext"
import { DataTable } from "@/components/dashboard/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Trash2, Star, Image as ImageIcon } from "lucide-react"

interface Review {
    id: string
    rating: number
    comment: string | null
    images: string[]
    isVisible: boolean
    createdAt: Date
    user: { name: string | null }
    unit: { name: string }
}

export default function ReviewsPage() {
    const { isAdmin } = useRole()
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        loadReviews()
    }, [])

    const loadReviews = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/dashboard/reviews")
            const data = await res.json()
            setReviews(data)
        } catch (error) {
            console.error("Failed to load reviews:", error)
        }
        setIsLoading(false)
    }

    const handleToggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
        if (!isAdmin) return

        setIsProcessing(true)
        try {
            const res = await fetch("/api/dashboard/reviews/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, isVisible: !currentVisibility }),
            })

            if (res.ok) {
                loadReviews()
            }
        } catch (error) {
            console.error("Failed to toggle visibility:", error)
            alert("Failed to update visibility")
        }
        setIsProcessing(false)
    }

    const handleDelete = async (reviewId: string) => {
        if (!isAdmin) return
        if (!confirm("Delete this review? This action cannot be undone.")) return

        setIsProcessing(true)
        try {
            const res = await fetch(`/api/dashboard/reviews/${reviewId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                loadReviews()
            }
        } catch (error) {
            console.error("Failed to delete review:", error)
            alert("Failed to delete review")
        }
        setIsProcessing(false)
    }

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(date))

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Guest Reviews</h1>
                    <p className="text-gray-500">
                        {isAdmin ? "Moderate and manage guest reviews" : "View guest feedback"}
                    </p>
                </div>
            </div>

            <DataTable
                data={reviews}
                isLoading={isLoading}
                searchPlaceholder="Search by guest or unit name..."
                searchableKeys={["user.name", "unit.name", "comment"]}
                filters={[
                    ...(isAdmin
                        ? [
                            {
                                key: "isVisible",
                                label: "Visibility",
                                options: [
                                    { value: "true", label: "Visible" },
                                    { value: "false", label: "Hidden" },
                                ],
                            },
                        ]
                        : []),
                    {
                        key: "rating",
                        label: "Rating",
                        options: [
                            { value: "5", label: "5 Stars" },
                            { value: "4", label: "4 Stars" },
                            { value: "3", label: "3 Stars" },
                            { value: "2", label: "2 Stars" },
                            { value: "1", label: "1 Star" },
                        ],
                    },
                ]}
                columns={[
                    {
                        key: "unit.name",
                        label: "Unit",
                        sortable: true,
                        render: (row: Review) => row.unit.name,
                    },
                    {
                        key: "user.name",
                        label: "Guest",
                        sortable: true,
                        render: (row: Review) => row.user.name || "Anonymous",
                    },
                    {
                        key: "rating",
                        label: "Rating",
                        sortable: true,
                        render: (row: Review) => renderStars(row.rating),
                    },
                    {
                        key: "comment",
                        label: "Comment",
                        render: (row: Review) => (
                            <div className="max-w-md">
                                <p className="text-sm line-clamp-2">
                                    {row.comment || <span className="text-gray-400 italic">No comment</span>}
                                </p>
                                {row.images.length > 0 && (
                                    <button
                                        onClick={() => setSelectedReview(row)}
                                        className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                        {row.images.length} image{row.images.length > 1 ? "s" : ""}
                                    </button>
                                )}
                            </div>
                        ),
                    },
                    ...(isAdmin
                        ? [
                            {
                                key: "isVisible",
                                label: "Visibility",
                                render: (row: Review) => (
                                    <Badge className={row.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                        {row.isVisible ? "Visible" : "Hidden"}
                                    </Badge>
                                ),
                            },
                        ]
                        : []),
                    {
                        key: "createdAt",
                        label: "Date",
                        sortable: true,
                        render: (row: Review) => (
                            <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span>
                        ),
                    },
                    ...(isAdmin
                        ? [
                            {
                                key: "actions",
                                label: "Actions",
                                render: (row: Review) => (
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleToggleVisibility(row.id, row.isVisible)}
                                            disabled={isProcessing}
                                            title={row.isVisible ? "Hide review" : "Show review"}
                                        >
                                            {row.isVisible ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(row.id)}
                                            disabled={isProcessing}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ),
                            },
                        ]
                        : []),
                ]}
            />

            {/* Review Details Dialog */}
            <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Details</DialogTitle>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500">Unit</div>
                                <div className="font-medium">{selectedReview.unit.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Guest</div>
                                <div className="font-medium">{selectedReview.user.name || "Anonymous"}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Rating</div>
                                {renderStars(selectedReview.rating)}
                            </div>
                            {selectedReview.comment && (
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Comment</div>
                                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedReview.comment}</p>
                                </div>
                            )}
                            {selectedReview.images.length > 0 && (
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">Images ({selectedReview.images.length})</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedReview.images.map((img, idx) => (
                                            <a
                                                key={idx}
                                                href={img}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Review image ${idx + 1}`}
                                                    className="w-full h-40 object-cover rounded border hover:opacity-80 transition-opacity"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="text-xs text-gray-500">
                                Submitted on {formatDate(selectedReview.createdAt)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
