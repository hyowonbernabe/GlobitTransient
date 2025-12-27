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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Brain, Plus, Edit, Trash2 } from "lucide-react"

interface KnowledgeSnippet {
    id: string
    category: string
    title: string
    content: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const CATEGORIES = [
    { value: "FAQ", label: "FAQ" },
    { value: "POLICY", label: "Policy" },
    { value: "LOCATION", label: "Location" },
    { value: "UNIT_INFO", label: "Unit Info" },
    { value: "AMENITIES", label: "Amenities" },
    { value: "BOOKING", label: "Booking Process" },
]

export default function KnowledgePage() {
    const [snippets, setSnippets] = useState<KnowledgeSnippet[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingSnippet, setEditingSnippet] = useState<KnowledgeSnippet | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        category: "FAQ",
        title: "",
        content: "",
    })

    useEffect(() => {
        loadSnippets()
    }, [])

    const loadSnippets = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/dashboard/knowledge")
            const data = await res.json()
            setSnippets(data)
        } catch (error) {
            console.error("Failed to load knowledge snippets:", error)
        }
        setIsLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        try {
            const url = editingSnippet
                ? `/api/dashboard/knowledge/${editingSnippet.id}`
                : "/api/dashboard/knowledge"

            const res = await fetch(url, {
                method: editingSnippet ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                setShowDialog(false)
                setEditingSnippet(null)
                resetForm()
                loadSnippets()
                alert(editingSnippet ? "Snippet updated!" : "Snippet created!")
            } else {
                alert("Failed to save snippet")
            }
        } catch (error) {
            console.error("Failed to save snippet:", error)
            alert("Failed to save snippet")
        }

        setIsProcessing(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this knowledge snippet?")) return

        setIsProcessing(true)

        try {
            const res = await fetch(`/api/dashboard/knowledge/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                loadSnippets()
                alert("Snippet deleted")
            } else {
                alert("Failed to delete snippet")
            }
        } catch (error) {
            console.error("Failed to delete snippet:", error)
            alert("Failed to delete snippet")
        }

        setIsProcessing(false)
    }

    const openEditDialog = (snippet: KnowledgeSnippet) => {
        setEditingSnippet(snippet)
        setFormData({
            category: snippet.category,
            title: snippet.title,
            content: snippet.content,
        })
        setShowDialog(true)
    }

    const resetForm = () => {
        setFormData({
            category: "FAQ",
            title: "",
            content: "",
        })
    }

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(date))

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            FAQ: "bg-blue-100 text-blue-800",
            POLICY: "bg-purple-100 text-purple-800",
            LOCATION: "bg-green-100 text-green-800",
            UNIT_INFO: "bg-orange-100 text-orange-800",
            AMENITIES: "bg-pink-100 text-pink-800",
            BOOKING: "bg-indigo-100 text-indigo-800",
        }
        return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category.replace("_", " ")}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-emerald-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Knowledge Base</h1>
                        <p className="text-gray-500">Manage knowledge snippets for the chatbot</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        resetForm()
                        setEditingSnippet(null)
                        setShowDialog(true)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Snippet
                </Button>
            </div>

            <DataTable
                data={snippets}
                isLoading={isLoading}
                searchPlaceholder="Search by title or content..."
                searchableKeys={["title", "content"]}
                filters={[
                    {
                        key: "category",
                        label: "Category",
                        options: CATEGORIES.map(c => ({ value: c.value, label: c.label })),
                    },
                ]}
                columns={[
                    {
                        key: "category",
                        label: "Category",
                        render: (row: KnowledgeSnippet) => getCategoryBadge(row.category),
                    },
                    {
                        key: "title",
                        label: "Title",
                        sortable: true,
                        render: (row: KnowledgeSnippet) => (
                            <div className="font-medium">{row.title}</div>
                        ),
                    },
                    {
                        key: "content",
                        label: "Content",
                        render: (row: KnowledgeSnippet) => (
                            <div className="max-w-md">
                                <p className="text-sm text-gray-600 line-clamp-2">{row.content}</p>
                            </div>
                        ),
                    },
                    {
                        key: "updatedAt",
                        label: "Last Updated",
                        sortable: true,
                        render: (row: KnowledgeSnippet) => (
                            <span className="text-xs text-gray-500">{formatDate(row.updatedAt)}</span>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        render: (row: KnowledgeSnippet) => (
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
                                    onClick={() => handleDelete(row.id)}
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

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingSnippet ? "Edit Snippet" : "Add Knowledge Snippet"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., What are your check-in/out times?"
                            />
                        </div>

                        <div>
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows={6}
                                placeholder="Enter the detailed answer or information..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This content will be used by the AI chatbot to answer guest questions
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDialog(false)
                                    setEditingSnippet(null)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? "Saving..." : editingSnippet ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
