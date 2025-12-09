import { requireAdmin } from "@/lib/auth/admin-rbac"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  await requireAdmin()

  return (
    <PageShell
      title="Settings & Configuration"
      description="Configure platform settings and templates"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Platform Settings</h2>
          <p className="text-gray-600">
            Settings management interface coming soon. This will allow configuration of:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>Employment types</li>
            <li>Salary ranges and currency formats</li>
            <li>Email/SMS templates</li>
            <li>Privacy policy and terms of service</li>
            <li>Default notification templates</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  )
}

