"use client"

import { createContext, useContext } from "react"
import { Role } from "@prisma/client"

interface RoleContextType {
    role: Role
    isAdmin: boolean
    isAgent: boolean
    user: {
        id: string
        name?: string | null
        email?: string | null
    }
}

const RoleContext = createContext<RoleContextType | null>(null)

export function RoleProvider({
    role,
    user,
    children,
}: {
    role: Role
    user: { id: string; name?: string | null; email?: string | null }
    children: React.ReactNode
}) {
    const value: RoleContextType = {
        role,
        isAdmin: role === "ADMIN",
        isAgent: role === "AGENT",
        user,
    }

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
    const context = useContext(RoleContext)
    if (!context) {
        throw new Error("useRole must be used within RoleProvider")
    }
    return context
}
