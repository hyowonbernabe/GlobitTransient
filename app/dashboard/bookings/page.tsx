"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/dashboard/DataTable"
import { Badge } from "@/components/ui/badge"
import { ManualBookingDialog } from "@/components/admin/ManualBookingDialog"
import { BookingStatus, PaymentStatus } from "@prisma/client"
import { useRole } from "@/components/dashboard/RoleContext"

interface Booking {
    id: string
    fullId: string
    paymongoRef: string
    guestName: string
    guestPhone: string
    unitName: string
    checkIn: Date
    checkOut: Date
    pax: number
    hasCar: boolean
    hasPet: boolean
    hasPWD: boolean
    totalPrice: number
    downpayment: number
    balance: number
    paymentStatus: PaymentStatus
    status: BookingStatus
    agentName: string
    createdAt: Date
}

export default function BookingsPage() {
    const { isAdmin } = useRole()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchBookings() {
            try {
                const res = await fetch("/api/dashboard/bookings")
                const data = await res.json()
                setBookings(data)
            } catch (error) {
                console.error("Failed to fetch bookings:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBookings()
    }, [])

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

    const statusBadge = (status: BookingStatus) => {
        const variants: Record<BookingStatus, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            CONFIRMED: "bg-emerald-100 text-emerald-800",
            CANCELLED: "bg-red-100 text-red-800",
            COMPLETED: "bg-blue-100 text-blue-800",
        }
        return <Badge className={variants[status]}>{status}</Badge>
    }

    const paymentBadge = (status: PaymentStatus) => {
        const variants: Record<PaymentStatus, string> = {
            UNPAID: "bg-gray-100 text-gray-800",
            PARTIAL: "bg-orange-100 text-orange-800",
            FULL: "bg-green-100 text-green-800",
        }
        return <Badge className={variants[status]}>{status}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500">
                        {isAdmin ? "Manage all bookings" : "Your referred bookings"}
                    </p>
                </div>
                {isAdmin && <ManualBookingDialog />}
            </div>

            <DataTable
                data={bookings}
                isLoading={isLoading}
                searchPlaceholder="Search by guest name or booking ID..."
                searchableKeys={["guestName", "id", "unitName"]}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { value: "PENDING", label: "Pending" },
                            { value: "CONFIRMED", label: "Confirmed" },
                            { value: "CANCELLED", label: "Cancelled" },
                            { value: "COMPLETED", label: "Completed" },
                        ],
                    },
                    {
                        key: "paymentStatus",
                        label: "Payment",
                        options: [
                            { value: "UNPAID", label: "Unpaid" },
                            { value: "PARTIAL", label: "Partial" },
                            { value: "FULL", label: "Full" },
                        ],
                    },
                ]}
                columns={[
                    {
                        key: "id",
                        label: "ID",
                        sortable: true,
                        render: (row) => (
                            <span className="font-mono text-xs" title={row.fullId}>
                                {row.id}
                            </span>
                        ),
                    },
                    {
                        key: "guestName",
                        label: "Guest",
                        sortable: true,
                        render: (row) => (
                            <div>
                                <div className="font-medium">{row.guestName}</div>
                                <div className="text-xs text-gray-500">{row.guestPhone}</div>
                            </div>
                        ),
                    },
                    {
                        key: "unitName",
                        label: "Unit",
                        sortable: true,
                    },
                    {
                        key: "checkIn",
                        label: "Check-in / Check-out",
                        sortable: true,
                        render: (row) => (
                            <div className="text-sm">
                                <div>{formatDate(row.checkIn)}</div>
                                <div className="text-gray-500">{formatDate(row.checkOut)}</div>
                            </div>
                        ),
                    },
                    {
                        key: "pax",
                        label: "Pax",
                        sortable: true,
                        render: (row) => (
                            <div className="flex items-center gap-1">
                                <span>{row.pax}</span>
                                {(row.hasCar || row.hasPet || row.hasPWD) && (
                                    <div className="flex gap-1 text-xs">
                                        {row.hasCar && <span title="Has car">🚗</span>}
                                        {row.hasPet && <span title="Has pet">🐾</span>}
                                        {row.hasPWD && <span title="PWD">♿</span>}
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "totalPrice",
                        label: "Total",
                        sortable: true,
                        render: (row) => (
                            <div className="text-sm">
                                <div className="font-medium">{formatMoney(row.totalPrice)}</div>
                                <div className="text-xs text-gray-500">
                                    Bal: {formatMoney(row.balance)}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "paymentStatus",
                        label: "Payment",
                        render: (row) => paymentBadge(row.paymentStatus),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => statusBadge(row.status),
                    },
                    {
                        key: "agentName",
                        label: "Agent",
                        render: (row) => (
                            <span className="text-sm text-gray-600">{row.agentName}</span>
                        ),
                    },
                    {
                        key: "createdAt",
                        label: "Created",
                        sortable: true,
                        render: (row) => (
                            <span className="text-xs text-gray-500">
                                {formatDate(row.createdAt)}
                            </span>
                        ),
                    },
                ]}
            />
        </div>
    )
}
