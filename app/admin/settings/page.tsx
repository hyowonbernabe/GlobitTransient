import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExportSection } from "@/components/admin/ExportSection"
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm"

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage system configurations and account preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Data Export Tools */}
        <ExportSection />

        {/* Password Management */}
        <ChangePasswordForm />

        {/* Global Config (Placeholder for now) */}
        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>Global settings for the booking system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Default Commission Rate (%)</Label>
                <Input type="number" defaultValue={5} disabled />
                <p className="text-xs text-gray-500">Global defaults. Override per agent in Agent Portal.</p>
            </div>
            <div className="space-y-2">
                <Label>Admin Contact Email</Label>
                <Input type="email" defaultValue="admin@globit.com" disabled />
            </div>
            <Button variant="outline" disabled>Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}