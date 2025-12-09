import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  try {
    await requireAdmin()

    // Get comprehensive metrics
  const [
    totalUsers,
    activeUsers,
    hrUsers,
    totalJobs,
    publishedJobs,
    totalApplications,
    pendingApplications,
    totalCompanies,
    approvedCompanies,
    recentUsers,
    recentJobs,
    recentApplications,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.user.count({ where: { role: "HR", deletedAt: null } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.company.count(),
    prisma.company.count({ where: { status: "APPROVED", deletedAt: null } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        job: { select: { title: true, slug: true } },
      },
    }),
  ])

  // Get registration trends (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const newRegistrations = await prisma.user.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      deletedAt: null,
    },
  })

  // Get most popular skills (from user profiles)
  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { skills: true },
  })
  
  const skillCounts: Record<string, number> = {}
  allUsers.forEach((user) => {
    user.skills.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1
    })
  })
  
  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }))

  return (
    <PageShell
      title="Admin Dashboard"
      description="Overview of platform metrics and activity"
    >
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="mt-2 text-3xl font-bold">{totalUsers}</p>
            <p className="mt-1 text-xs text-gray-500">
              {activeUsers} active, {hrUsers} HR
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Jobs</p>
            <p className="mt-2 text-3xl font-bold">{totalJobs}</p>
            <p className="mt-1 text-xs text-gray-500">
              {publishedJobs} published
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Applications</p>
            <p className="mt-2 text-3xl font-bold">{totalApplications}</p>
            <p className="mt-1 text-xs text-gray-500">
              {pendingApplications} pending
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Companies</p>
            <p className="mt-2 text-3xl font-bold">{totalCompanies}</p>
            <p className="mt-1 text-xs text-gray-500">
              {approvedCompanies} approved
            </p>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">New Registrations</p>
            <p className="mt-2 text-3xl font-bold">{newRegistrations}</p>
            <p className="mt-1 text-xs text-gray-500">Last 30 days</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Top Skills</p>
            <div className="mt-2 space-y-1">
              {topSkills.length > 0 ? (
                topSkills.map(({ skill, count }) => (
                  <div key={skill} className="flex justify-between text-sm">
                    <span>{skill}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No skills data</p>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Quick Actions</p>
            <div className="mt-3 space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  View Analytics
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {recentUsers.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Name</Table.Header>
                  <Table.Header>Email</Table.Header>
                  <Table.Header>Role</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Created</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {recentUsers.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{user.name || "—"}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {user.role}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : user.status === "SUSPENDED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No users found.</p>
          )}
        </Card>

        {/* Recent Jobs */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Jobs</h2>
            <Link href="/admin/jobs">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {recentJobs.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Title</Table.Header>
                  <Table.Header>Company</Table.Header>
                  <Table.Header>Applications</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Created</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {recentJobs.map((job) => (
                  <Table.Row key={job.id}>
                    <Table.Cell>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{job.company.name}</Table.Cell>
                    <Table.Cell>{job._count.applications}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {job.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/admin/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No jobs found.</p>
          )}
        </Card>

        {/* Recent Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/admin/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {recentApplications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Candidate</Table.Header>
                  <Table.Header>Job</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Applied</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {recentApplications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      {app.user.name || app.user.email}
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {app.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/admin/applications/${app.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No applications found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
  } catch (error: any) {
    console.error("Error in AdminDashboard:", error)
    return (
      <PageShell title="Error" description="An error occurred">
        <Card className="p-6">
          <p className="text-red-600">Error loading dashboard: {error.message || "Unknown error"}</p>
        </Card>
      </PageShell>
    )
  }
}

