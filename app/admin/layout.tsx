import { requireAdmin } from "@/lib/auth/admin-rbac"
import { AdminNav } from "@/components/admin/AdminNav"
import { PageShell } from "@/components/layouts/PageShell"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect if not admin
  await requireAdmin()

  return (
    <div className="min-h-screen bg-white">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}

