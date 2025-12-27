"use client"

import { useState, useEffect } from "react"
import { useRole } from "@/components/dashboard/RoleContext"
import { AgentClaimsView } from "@/components/dashboard/claims/AgentClaimsView"
import { AdminClaimsView } from "@/components/dashboard/claims/AdminClaimsView"

export default function ClaimsPage() {
    const { isAdmin } = useRole()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isAdmin ? "Review Claims" : "My Claims"}
                </h1>
                <p className="text-gray-500">
                    {isAdmin
                        ? "Review and approve agent commission claims"
                        : "Submit and track your commission claims"}
                </p>
            </div>

            {isAdmin ? <AdminClaimsView /> : <AgentClaimsView />}
        </div>
    )
}
