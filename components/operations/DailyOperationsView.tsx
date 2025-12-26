'use client'

import { useState, useEffect } from "react"
import { getOperationalBookings } from "@/server/actions/operations"
import { OperationalBookingCard } from "./OperationalBookingCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Calendar, ClipboardList, Info } from "lucide-react"

export function DailyOperationsView() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<{ checkingIn: any[], checkingOut: any[] }>({
        checkingIn: [],
        checkingOut: []
    })

    useEffect(() => {
        async function load() {
            setLoading(true)
            const res = await getOperationalBookings(date)
            if (res.data) {
                setData(res.data)
            }
            setLoading(false)
        }
        load()
    }, [date])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-emerald-600" />
                        Daily Operations
                    </h1>
                    <p className="text-gray-500 mt-1">Manage guest check-ins and room transitions.</p>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Operational Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-10 h-11 w-full md:w-[200px] border-gray-200 focus:ring-emerald-500 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                    <p className="text-gray-500 font-medium">Fetching scheduled activities...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Check-ins Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                Checking In
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                                    {data.checkingIn.length}
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {data.checkingIn.length === 0 ? (
                                <Card className="bg-gray-50 border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Info className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400">No check-ins scheduled for this day.</p>
                                </Card>
                            ) : (
                                data.checkingIn.map(b => (
                                    <OperationalBookingCard key={b.id} booking={b} type="IN" />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Check-outs Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                Checking Out
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                                    {data.checkingOut.length}
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {data.checkingOut.length === 0 ? (
                                <Card className="bg-gray-50 border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Info className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400">No check-outs scheduled for this day.</p>
                                </Card>
                            ) : (
                                data.checkingOut.map(b => (
                                    <OperationalBookingCard key={b.id} booking={b} type="OUT" />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
