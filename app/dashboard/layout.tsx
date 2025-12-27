import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { RoleProvider } from "@/components/dashboard/RoleContext"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/admin/login")
    }

    const role = session.user.role
    if (role !== "ADMIN" && role !== "AGENT") {
        redirect("/")
    }

    return (
        <RoleProvider role={role} user={session.user}>
            <div className="min-h-screen bg-gray-50 flex">
                <DashboardSidebar />
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </RoleProvider>
    )
}
