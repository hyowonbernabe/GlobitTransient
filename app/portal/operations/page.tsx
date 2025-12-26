import { DailyOperationsView } from "@/components/operations/DailyOperationsView"

export const dynamic = 'force-dynamic'

export default function AgentOperationsPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <DailyOperationsView />
        </div>
    )
}
