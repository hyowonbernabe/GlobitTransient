"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/dashboard/DataTable"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

interface AuditLog {
    id: string
    userId: string
    action: string
    entityType: string
    entityId: string | null
    details: string | null
    createdAt: Date
    user: { name: string | null; email: string | null }
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadLogs() {
            setIsLoading(true)
            try {
                const res = await fetch("/api/dashboard/audit")
                const data = await res.json()
                setLogs(data)
            } catch (error) {
                console.error("Failed to load audit logs:", error)
            }
            setIsLoading(false)
        }
        loadLogs()
    }, [])

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date))

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            CREATE: "bg-green-100 text-green-800",
            UPDATE: "bg-blue-100 text-blue-800",
            DELETE: "bg-red-100 text-red-800",
            APPROVE: "bg-emerald-100 text-emerald-800",
            REJECT: "bg-orange-100 text-orange-800",
            LOGIN: "bg-purple-100 text-purple-800",
        }

        const color = colors[action.toUpperCase()] || "bg-gray-100 text-gray-800"
        return <Badge className={color}>{action}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track all administrative actions and system events</p>
                </div>
            </div>

            <DataTable
                data={logs}
                isLoading={isLoading}
                searchPlaceholder="Search by user, action, or entity..."
                searchableKeys={["user.name", "user.email", "action", "entityType", "details"]}
                filters={[
                    {
                        key: "action",
                        label: "Action",
                        options: [
                            { value: "CREATE", label: "Create" },
                            { value: "UPDATE", label: "Update" },
                            { value: "DELETE", label: "Delete" },
                            { value: "APPROVE", label: "Approve" },
                            { value: "REJECT", label: "Reject" },
                        ],
                    },
                    {
                        key: "entityType",
                        label: "Entity Type",
                        options: [
                            { value: "Booking", label: "Booking" },
                            { value: "User", label: "User" },
                            { value: "Unit", label: "Unit" },
                            { value: "Commission", label: "Commission" },
                            { value: "ClaimRequest", label: "Claim Request" },
                            { value: "Review", label: "Review" },
                        ],
                    },
                ]}
                columns={[
                    {
                        key: "createdAt",
                        label: "Timestamp",
                        sortable: true,
                        render: (row: AuditLog) => (
                            <span className="text-xs text-gray-600 font-mono">
                                {formatDate(row.createdAt)}
                            </span>
                        ),
                    },
                    {
                        key: "user.name",
                        label: "Actor",
                        sortable: true,
                        render: (row: AuditLog) => (
                            <div>
                                <div className="font-medium text-sm">{row.user.name || "System"}</div>
                                <div className="text-xs text-gray-500">{row.user.email}</div>
                            </div>
                        ),
                    },
                    {
                        key: "action",
                        label: "Action",
                        render: (row: AuditLog) => getActionBadge(row.action),
                    },
                    {
                        key: "entityType",
                        label: "Entity",
                        render: (row: AuditLog) => (
                            <div>
                                <div className="text-sm font-medium">{row.entityType}</div>
                                {row.entityId && (
                                    <div className="text-xs text-gray-500 font-mono">
                                        ID: {row.entityId.slice(0, 8)}
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "details",
                        label: "Details",
                        render: (row: AuditLog) => (
                            <div className="max-w-md">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {row.details || <span className="text-gray-400 italic">—</span>}
                                </p>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    )
}
