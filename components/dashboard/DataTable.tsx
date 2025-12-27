"use client"

import { useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface Column<T> {
    key: string
    label: string
    render?: (row: T) => React.ReactNode
    sortable?: boolean
}

interface FilterConfig {
    key: string
    label: string
    options: { value: string; label: string }[]
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    searchPlaceholder?: string
    searchableKeys?: string[]
    filters?: FilterConfig[]
    pageSize?: number
    isLoading?: boolean
    onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchPlaceholder = "Search...",
    searchableKeys = [],
    filters = [],
    pageSize = 10,
    isLoading = false,
    onRowClick,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
    const [sortConfig, setSortConfig] = useState<{
        key: string
        direction: "asc" | "desc"
    } | null>(null)

    // Filter and search data
    const filteredData = useMemo(() => {
        let result = [...data]

        // Apply search
        if (search && searchableKeys.length > 0) {
            const searchLower = search.toLowerCase()
            result = result.filter((row) =>
                searchableKeys.some((key) => {
                    const value = row[key]
                    return value?.toString().toLowerCase().includes(searchLower)
                })
            )
        }

        // Apply filters
        Object.entries(selectedFilters).forEach(([key, value]) => {
            if (value && value !== "all") {
                result = result.filter((row) => row[key] === value)
            }
        })

        // Apply sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key]
                const bVal = b[sortConfig.key]

                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
                return 0
            })
        }

        return result
    }, [data, search, searchableKeys, selectedFilters, sortConfig])

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Handle sort
    const handleSort = (key: string) => {
        const column = columns.find((col) => col.key === key)
        if (!column?.sortable) return

        setSortConfig((prev) => {
            if (prev?.key === key) {
                return prev.direction === "asc"
                    ? { key, direction: "desc" }
                    : null
            }
            return { key, direction: "asc" }
        })
    }

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [search, selectedFilters])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-gray-100 animate-pulse rounded" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-50 animate-pulse rounded" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                {searchableKeys.length > 0 && (
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}

                {/* Filters */}
                {filters.map((filter) => (
                    <Select
                        key={filter.key}
                        value={selectedFilters[filter.key] || "all"}
                        onValueChange={(value) =>
                            setSelectedFilters((prev) => ({ ...prev, [filter.key]: value }))
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All {filter.label}</SelectItem>
                            {filter.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && sortConfig?.key === column.key && (
                                            <span className="text-emerald-600">
                                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center py-12 text-gray-500"
                                >
                                    No results found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.key}>
                                            {column.render ? column.render(row) : row[column.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                        {filteredData.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
