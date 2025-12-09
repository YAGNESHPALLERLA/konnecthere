import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { ExportButtons } from "@/components/admin/ExportButtons"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  // Get trends (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    newUsers,
    newJobs,
    newApplications,
    activeHRCompanies,
    topJobRoles,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        deletedAt: null,
      },
    }),
    prisma.job.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.application.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.company.findMany({
      where: {
        status: "APPROVED",
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        jobs: {
          _count: "desc",
        },
      },
      take: 10,
    }),
    prisma.job.groupBy({
      by: ["title"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    }),
  ])

  return (
    <PageShell
      title="Analytics & Reports"
      description="Platform metrics and data exports"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <ExportButtons />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">New Users (30 days)</p>
            <p className="mt-2 text-3xl font-bold">{newUsers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">New Jobs (30 days)</p>
            <p className="mt-2 text-3xl font-bold">{newJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">New Applications (30 days)</p>
            <p className="mt-2 text-3xl font-bold">{newApplications}</p>
          </Card>
        </div>

        {/* Top Companies */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Most Active HR Companies</h2>
          {activeHRCompanies.length > 0 ? (
            <div className="space-y-3">
              {activeHRCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-gray-600">{company.industry || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{company._count.jobs}</p>
                    <p className="text-xs text-gray-600">jobs posted</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No data available</p>
          )}
        </Card>

        {/* Top Job Roles */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Most Posted Job Roles</h2>
          {topJobRoles.length > 0 ? (
            <div className="space-y-3">
              {topJobRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <p className="font-medium">{role.title}</p>
                  <p className="font-bold">{role._count.id} postings</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No data available</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

