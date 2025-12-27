"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

export default function SettingsPage() {
    const [isChanging, setIsChanging] = useState(false)
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    })
    const [error, setError] = useState("")

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsChanging(true)
        setError("")

        // Basic validation
        if (passwords.new !== passwords.confirm) {
            setError("New passwords don't match")
            setIsChanging(false)
            return
        }

        if (passwords.new.length < 8) {
            setError("Password must be at least 8 characters")
            setIsChanging(false)
            return
        }

        // TODO: Implement password change server action
        alert("Password updated successfully")

        setPasswords({ current: "", new: "", confirm: "" })
        setIsChanging(false)
    }

    const handleExport = async (type: string) => {
        alert(`Exporting ${type}...`)
        // TODO: Implement CSV export
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account preferences</p>
            </div>

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Change Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="current">Current Password</Label>
                            <Input
                                id="current"
                                type="password"
                                value={passwords.current}
                                onChange={(e) =>
                                    setPasswords((p) => ({ ...p, current: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="new">New Password</Label>
                            <Input
                                id="new"
                                type="password"
                                value={passwords.new}
                                onChange={(e) =>
                                    setPasswords((p) => ({ ...p, new: e.target.value }))
                                }
                                required
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum 8 characters
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="confirm">Confirm New Password</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) =>
                                    setPasswords((p) => ({ ...p, confirm: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <Button type="submit" disabled={isChanging}>
                            {isChanging ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* CSV Exports */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Exports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500">
                        Export your data as CSV files for backup or analysis
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleExport("bookings")}
                        >
                            Export Bookings
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport("commissions")}
                        >
                            Export Commissions
                        </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                        Note: Exports are filtered based on your role and permissions
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
