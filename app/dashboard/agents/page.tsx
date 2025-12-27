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
import { UserPlus, Edit, UserX } from "lucide-react"

interface Agent {
    id: string
    name: string | null
    email: string | null
    mobile: string | null
    agentCode: string | null
    commissionRate: number
    role: string
    createdAt: Date
    _count: { commissions: number }
    commissions: { amount: number }[]
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        commissionRate: "0.05",
    })

    useEffect(() => {
        loadAgents()
    }, [])

    const loadAgents = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/dashboard/agents")
            const data = await res.json()
            setAgents(data)
        } catch (error) {
            console.error("Failed to load agents:", error)
        }
        setIsLoading(false)
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        try {
            const res = await fetch("/api/dashboard/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    commissionRate: parseFloat(formData.commissionRate),
                }),
            })

            if (res.ok) {
                setShowAddDialog(false)
                setFormData({ name: "", email: "", mobile: "", commissionRate: "0.05" })
                loadAgents()
                alert("Agent added successfully!")
            } else {
                const error = await res.json()
                alert(error.error || "Failed to add agent")
            }
        } catch (error) {
            console.error("Failed to add agent:", error)
            alert("Failed to add agent")
        }

        setIsProcessing(false)
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAgent) return

        setIsProcessing(true)

        try {
            const res = await fetch(`/api/dashboard/agents/${editingAgent.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    commissionRate: parseFloat(formData.commissionRate),
                }),
            })

            if (res.ok) {
                setEditingAgent(null)
                setFormData({ name: "", email: "", mobile: "", commissionRate: "0.05" })
                loadAgents()
                alert("Agent updated successfully!")
            } else {
                alert("Failed to update agent")
            }
        } catch (error) {
            console.error("Failed to update agent:", error)
            alert("Failed to update agent")
        }

        setIsProcessing(false)
    }

    const handleDeactivate = async (agentId: string) => {
        if (!confirm("Deactivate this agent? They will lose dashboard access.")) return

        setIsProcessing(true)

        try {
            const res = await fetch(`/api/dashboard/agents/${agentId}/deactivate`, {
                method: "POST",
            })

            if (res.ok) {
                loadAgents()
                alert("Agent deactivated")
            } else {
                alert("Failed to deactivate agent")
            }
        } catch (error) {
            console.error("Failed to deactivate agent:", error)
            alert("Failed to deactivate agent")
        }

        setIsProcessing(false)
    }

    const openEditDialog = (agent: Agent) => {
        setEditingAgent(agent)
        setFormData({
            name: agent.name || "",
            email: agent.email || "",
            mobile: agent.mobile || "",
            commissionRate: agent.commissionRate.toString(),
        })
    }

    const formatMoney = (val: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(val / 100)

    const getTotalEarned = (agent: Agent) => {
        return agent.commissions.reduce((sum, c) => sum + c.amount, 0)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
                    <p className="text-gray-500">Manage agent accounts and commission rates</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Agent
                </Button>
            </div>

            <DataTable
                data={agents}
                isLoading={isLoading}
                searchPlaceholder="Search by name, email, or agent code..."
                searchableKeys={["name", "email", "agentCode"]}
                columns={[
                    {
                        key: "name",
                        label: "Name",
                        sortable: true,
                        render: (row: Agent) => (
                            <div>
                                <div className="font-medium">{row.name}</div>
                                <div className="text-xs text-gray-500">{row.email}</div>
                            </div>
                        ),
                    },
                    {
                        key: "mobile",
                        label: "Mobile",
                        render: (row: Agent) => row.mobile || "—",
                    },
                    {
                        key: "agentCode",
                        label: "Agent Code",
                        render: (row: Agent) => (
                            <Badge className="bg-blue-100 text-blue-800 font-mono">
                                {row.agentCode || "—"}
                            </Badge>
                        ),
                    },
                    {
                        key: "commissionRate",
                        label: "Commission Rate",
                        sortable: true,
                        render: (row: Agent) => (
                            <span className="font-medium">{(row.commissionRate * 100).toFixed(1)}%</span>
                        ),
                    },
                    {
                        key: "totalEarned",
                        label: "Total Earned",
                        sortable: true,
                        render: (row: Agent) => (
                            <div>
                                <div className="font-semibold text-emerald-700">
                                    {formatMoney(getTotalEarned(row))}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {row._count.commissions} commission{row._count.commissions !== 1 ? "s" : ""}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "role",
                        label: "Status",
                        render: (row: Agent) => (
                            <Badge className={row.role === "AGENT" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {row.role === "AGENT" ? "Active" : "Inactive"}
                            </Badge>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        render: (row: Agent) => (
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(row)}
                                    disabled={isProcessing}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                {row.role === "AGENT" && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeactivate(row.id)}
                                        disabled={isProcessing}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ),
                    },
                ]}
            />

            {/* Add Agent Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Agent</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="mobile">Mobile</Label>
                            <Input
                                id="mobile"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="commissionRate">Commission Rate (decimal)</Label>
                            <Input
                                id="commissionRate"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={formData.commissionRate}
                                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Example: 0.05 for 5%, 0.10 for 10%
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? "Adding..." : "Add Agent"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Agent Dialog */}
            <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Agent</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-mobile">Mobile</Label>
                            <Input
                                id="edit-mobile"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-commissionRate">Commission Rate (decimal)</Label>
                            <Input
                                id="edit-commissionRate"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={formData.commissionRate}
                                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Example: 0.05 for 5%, 0.10 for 10%
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingAgent(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? "Updating..." : "Update Agent"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
