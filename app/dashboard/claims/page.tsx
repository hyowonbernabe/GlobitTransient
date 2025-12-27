import { redirect } from "next/navigation"
import { auth } from "@/server/auth"

export const dynamic = "force-dynamic"

export default async function ClaimsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/admin/login")
    }

    const isAdmin = session.user.role === "ADMIN"

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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-blue-800 font-medium">
                    Claims system coming in next phase
                </p>
                <p className="text-sm text-blue-600 mt-1">
                    This will include claim submission for agents and approval workflow for admins
                </p>
            </div>
        </div>
    )
}
