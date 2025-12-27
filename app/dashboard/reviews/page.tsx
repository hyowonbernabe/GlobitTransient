import { redirect } from "next/navigation"
import { auth } from "@/server/auth"

export const dynamic = "force-dynamic"

export default async function ReviewsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/admin/login")
    }

    const isAdmin = session.user.role === "ADMIN"

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Guest Reviews</h1>
                <p className="text-gray-500">
                    {isAdmin
                        ? "Moderate and manage guest reviews"
                        : "View guest feedback"}
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-blue-800 font-medium">
                    Reviews management coming in next phase
                </p>
            </div>
        </div>
    )
}
