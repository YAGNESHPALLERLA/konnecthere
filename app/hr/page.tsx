import { requireRole } from "@/lib/auth/roles"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HRDashboard() {
  const user = await requireRole("HR")
  const session = await auth()

  // Get companies managed by this HR user
  const companies = await prisma.company.findMany({
    where: {
      hrId: user.id,
    },
    include: {
      jobs: {
        include: {
          _count: {
            select: { applications: true },
          },
        },
      },
    },
  })

  // Get all jobs from managed companies
  const allJobs = companies.flatMap((c) => c.jobs)

  // Get recent applications for jobs in managed companies
  const recentApplications = await prisma.application.findMany({
    where: {
      job: {
        company: {
          hrId: user.id,
        },
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  const stats = {
    totalJobs: allJobs.length,
    publishedJobs: allJobs.filter((j) => j.status === "PUBLISHED").length,
    totalApplications: recentApplications.length,
    pendingApplications: recentApplications.filter(
      (a) => a.status === "PENDING"
    ).length,
  }

  return (
    <PageShell
      title="HR Dashboard"
      description="Manage jobs and applications for your companies"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Jobs</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalJobs}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Published</div>
            <div className="mt-2 text-3xl font-bold">{stats.publishedJobs}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Applications</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalApplications}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Pending</div>
            <div className="mt-2 text-3xl font-bold">
              {stats.pendingApplications}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Link href="/hr/jobs/new">
            <Button>Post New Job</Button>
          </Link>
          <Link href="/hr/jobs">
            <Button variant="outline">View All Jobs</Button>
          </Link>
        </div>

        {/* Recent Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/hr/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Candidate</Table.Header>
                <Table.Header>Job</Table.Header>
                <Table.Header>Company</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Applied</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {recentApplications.map((app) => (
                <Table.Row key={app.id}>
                  <Table.Cell>{app.user.name || app.user.email}</Table.Cell>
                  <Table.Cell>{app.job.title}</Table.Cell>
                  <Table.Cell>{app.job.company.name}</Table.Cell>
                  <Table.Cell>
                    <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      {app.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{new Date(app.createdAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Link href={`/hr/applications/${app.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>

        {/* My Companies */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Managed Companies</h2>
          </div>
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
              >
                <div>
                  <h3 className="font-bold">{company.name}</h3>
                  <p className="text-sm text-gray-600">
                    {company.jobs.length} job{company.jobs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Link href={`/hr/companies/${company.id}`}>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            ))}
            {companies.length === 0 && (
              <p className="text-gray-600">No companies assigned yet.</p>
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

