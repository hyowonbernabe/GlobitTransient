import { DailyOperationsView } from "@/components/operations/DailyOperationsView"

export const dynamic = 'force-dynamic'

export default function AdminOperationsPage() {
    return (
        <div className="p-6 md:p-8">
            <DailyOperationsView />
        </div>
    )
}
