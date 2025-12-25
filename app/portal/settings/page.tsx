import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm"

export default function AgentSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile and security.</p>
      </div>

      <ChangePasswordForm />
    </div>
  )
}