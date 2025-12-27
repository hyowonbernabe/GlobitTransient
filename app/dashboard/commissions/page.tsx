"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/dashboard/DataTable"
import { Badge } from "@/components/ui/badge"
import { CommissionStatus } from "@prisma/client"
import { useRole } from "@/components/dashboard/RoleContext"

interface Commission {
    id: string
    agentName: string
    bookingId: string
    guestName: string
    unitName: string
    amount: number
    status: CommissionStatus
    paidAt: Date | null
    createdAt: Date
}

export default function CommissionsPage() {
    const { isAdmin } = useRole()
    const [commissions, setCommissions] = useState<Commission[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchCommissions() {
            try {
                const res = await fetch("/api/dashboard/commissions")
                const data = await res.json()
                setCommissions(data)
            } catch (error) {
                console.error("Failed to fetch commissions:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCommissions()
    }, [])

    const formatMoney = (val: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(val / 100)

    const formatDate = (date: Date | null) =>
        date
            ? new Intl.DateTimeFormat("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }).format(new Date(date))
            : "—"

    const statusBadge = (status: CommissionStatus) => {
        const variants: Record<CommissionStatus, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            PAID_OUT: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
        }
        return <Badge className={variants[status]}>{status.replace("_", " ")}</Badge>
    }

    // Calculate summary stats
    const totalEarned = commissions
        .filter((c) => c.status === "PAID_OUT")
        .reduce((sum, c) => sum + c.amount, 0)

    const pending = commissions.filter((c) => c.status === "PENDING").length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Commissions</h1>
                <p className="text-gray-500">
                    {isAdmin ? "Manage agent commissions" : "Your commission earnings"}
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="text-sm text-emerald-700 font-medium">Total Earned</div>
                    <div className="text-2xl font-bold text-emerald-900">
                        {formatMoney(totalEarned)}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-700 font-medium">Pending</div>
                    <div className="text-2xl font-bold text-yellow-900">{pending}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-700 font-medium">Total Records</div>
                    <div className="text-2xl font-bold text-blue-900">
                        {commissions.length}
                    </div>
                </div>
            </div>

            {/* Commissions Table */}
            <DataTable
                data={commissions}
                isLoading={isLoading}
                searchPlaceholder="Search by agent or guest name..."
                searchableKeys={["agentName", "guestName", "bookingId"]}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { value: "PENDING", label: "Pending" },
                            { value: "PAID_OUT", label: "Paid Out" },
                            { value: "REJECTED", label: "Rejected" },
                        ],
                    },
                ]}
                columns={[
                    ...(isAdmin
                        ? [
                            {
                                key: "agentName",
                                label: "Agent",
                                sortable: true,
                            },
                        ]
                        : []),
                    {
                        key: "bookingId",
                        label: "Booking",
                        render: (row: Commission) => (
                            <span className="font-mono text-xs">{row.bookingId}</span>
                        ),
                    },
                    {
                        key: "guestName",
                        label: "Guest",
                        sortable: true,
                    },
                    {
                        key: "unitName",
                        label: "Unit",
                    },
                    {
                        key: "amount",
                        label: "Amount",
                        sortable: true,
                        render: (row: Commission) => (
                            <span className="font-semibold">{formatMoney(row.amount)}</span>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row: Commission) => statusBadge(row.status),
                    },
                    {
                        key: "paidAt",
                        label: "Paid At",
                        sortable: true,
                        render: (row: Commission) => (
                            <span className="text-sm text-gray-600">{formatDate(row.paidAt)}</span>
                        ),
                    },
                    {
                        key: "createdAt",
                        label: "Created",
                        sortable: true,
                        render: (row: Commission) => (
                            <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span>
                        ),
                    },
                ]}
            />
        </div>
    )
}
