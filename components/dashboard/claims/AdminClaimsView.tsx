"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/dashboard/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getClaimRequests, approveClaimRequest, rejectClaimRequest } from "@/server/actions/claim"
import { CheckCircle, XCircle, Image as ImageIcon } from "lucide-react"

interface Claim {
    id: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    description: string | null
    proofImage: string | null
    createdAt: Date
    agent: { name: string | null; email: string | null }
    booking: {
        id: string
        checkIn: Date
        checkOut: Date
        totalPrice: number
        user: { name: string | null }
        unit: { name: string }
    }
}

export function AdminClaimsView() {
    const [claims, setClaims] = useState<Claim[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        loadClaims()
    }, [])

    const loadClaims = async () => {
        setIsLoading(true)
        const result = await getClaimRequests()
        if (result.claims) {
            setClaims(result.claims)
        }
        setIsLoading(false)
    }

    const handleApprove = async (claimId: string) => {
        if (!confirm("Approve this claim and create a commission record?")) return

        setIsProcessing(true)
        const result = await approveClaimRequest(claimId)

        if (result.error) {
            alert(result.error)
        } else {
            alert("Claim approved successfully!")
            loadClaims()
        }

        setIsProcessing(false)
    }

    const handleReject = async () => {
        if (!selectedClaim) return

        setIsProcessing(true)
        const result = await rejectClaimRequest(selectedClaim.id, rejectReason)

        if (result.error) {
            alert(result.error)
        } else {
            alert("Claim rejected")
            setShowRejectDialog(false)
            setRejectReason("")
            setSelectedClaim(null)
            loadClaims()
        }

        setIsProcessing(false)
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

    const statusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
        const variants = {
            PENDING: "bg-yellow-100 text-yellow-800",
            APPROVED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
        }
        return <Badge className={variants[status]}>{status}</Badge>
    }

    // Calculate pending count
    const pendingCount = claims.filter((c) => c.status === "PENDING").length

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-700 font-medium">Pending Claims</div>
                    <div className="text-2xl font-bold text-yellow-900">{pendingCount}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 font-medium">Approved</div>
                    <div className="text-2xl font-bold text-green-900">
                        {claims.filter((c) => c.status === "APPROVED").length}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-red-700 font-medium">Rejected</div>
                    <div className="text-2xl font-bold text-red-900">
                        {claims.filter((c) => c.status === "REJECTED").length}
                    </div>
                </div>
            </div>

            {/* Claims Table */}
            <DataTable
                data={claims}
                isLoading={isLoading}
                searchPlaceholder="Search by agent or guest name..."
                searchableKeys={["agent.name", "booking.user.name", "booking.id"]}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { value: "PENDING", label: "Pending" },
                            { value: "APPROVED", label: "Approved" },
                            { value: "REJECTED", label: "Rejected" },
                        ],
                    },
                ]}
                columns={[
                    {
                        key: "agent.name",
                        label: "Agent",
                        sortable: true,
                        render: (row: Claim) => row.agent.name || "Unknown",
                    },
                    {
                        key: "booking.id",
                        label: "Booking",
                        render: (row: Claim) => (
                            <div>
                                <div className="font-mono text-xs">{row.booking.id.slice(0, 8)}</div>
                                <div className="text-xs text-gray-500">{row.booking.unit.name}</div>
                            </div>
                        ),
                    },
                    {
                        key: "booking.user.name",
                        label: "Guest",
                        render: (row: Claim) => row.booking.user.name || "Walk-in",
                    },
                    {
                        key: "booking.totalPrice",
                        label: "Amount",
                        sortable: true,
                        render: (row: Claim) => (
                            <div>
                                <div className="text-sm">{formatMoney(row.booking.totalPrice)}</div>
                                <div className="text-xs text-gray-500">
                                    5% = {formatMoney(row.booking.totalPrice * 0.05)}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "description",
                        label: "Description",
                        render: (row: Claim) => (
                            <div className="max-w-xs truncate text-sm">
                                {row.description || "—"}
                            </div>
                        ),
                    },
                    {
                        key: "proofImage",
                        label: "Proof",
                        render: (row: Claim) =>
                            row.proofImage ? (
                                <a
                                    href={row.proofImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    View
                                </a>
                            ) : (
                                <span className="text-xs text-gray-400">None</span>
                            ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row: Claim) => statusBadge(row.status),
                    },
                    {
                        key: "createdAt",
                        label: "Submitted",
                        sortable: true,
                        render: (row: Claim) => (
                            <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        render: (row: Claim) =>
                            row.status === "PENDING" ? (
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(row.id)}
                                        disabled={isProcessing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedClaim(row)
                                            setShowRejectDialog(true)
                                        }}
                                        disabled={isProcessing}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400">—</span>
                            ),
                    },
                ]}
            />

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Claim</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reason">Rejection Reason (optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why this claim is being rejected..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessing ? "Rejecting..." : "Reject Claim"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
