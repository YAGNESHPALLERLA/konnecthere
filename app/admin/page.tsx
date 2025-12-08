import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  await requireRole("ADMIN")
  
  // Redirect to /dashboard/admin for consistency
  const { redirect } = await import("next/navigation")
  redirect("/dashboard/admin")

  const [users, jobs, applications, conversations] = await Promise.all([
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
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
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
      },
    }),
    prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    }),
    prisma.conversation.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: {
            user: { select: { name: true, email: true, role: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ])

  const stats = {
    totalUsers: await prisma.user.count(),
    activeUsers: await prisma.user.count({ where: { status: "ACTIVE" } }),
    totalJobs: await prisma.job.count(),
    totalApplications: await prisma.application.count(),
  }

  return (
    <PageShell
      title="Admin Dashboard"
      description="Manage users, jobs, applications, and conversations"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Users</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalUsers}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Active Users</div>
            <div className="mt-2 text-3xl font-bold">{stats.activeUsers}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Jobs</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalJobs}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Applications</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalApplications}</div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Name</Table.Header>
                <Table.Header>Email</Table.Header>
                <Table.Header>Role</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {users.map((user) => (
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
                          ? "bg-gray-100 text-black"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {user.status}
                    </span>
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
        </Card>

        {/* Jobs Table */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Jobs</h2>
            <Link href="/admin/jobs">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Title</Table.Header>
                <Table.Header>Company</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Created</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {jobs.map((job) => (
                <Table.Row key={job.id}>
                  <Table.Cell>{job.title}</Table.Cell>
                  <Table.Cell>{job.company.name}</Table.Cell>
                  <Table.Cell>
                    <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      {job.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{new Date(job.createdAt).toLocaleDateString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>

        {/* Applications Table */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/admin/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Candidate</Table.Header>
                <Table.Header>Job</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Applied</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {applications.map((app) => (
                <Table.Row key={app.id}>
                  <Table.Cell>{app.user.name || app.user.email}</Table.Cell>
                  <Table.Cell>{app.job.title}</Table.Cell>
                  <Table.Cell>
                    <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      {app.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{new Date(app.createdAt).toLocaleDateString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>

        {/* Conversations Table */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Conversations</h2>
            <Link href="/admin/conversations">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Participants</Table.Header>
                <Table.Header>Last Message</Table.Header>
                <Table.Header>Updated</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {conversations.map((conv) => {
                const lastMessage = conv.messages[0]
                const participants = conv.participants
                  .map((p) => p.user.name || p.user.email)
                  .join(", ")

                return (
                  <Table.Row key={conv.id}>
                    <Table.Cell>{participants}</Table.Cell>
                    <Table.Cell>
                      {lastMessage
                        ? lastMessage.body.substring(0, 50) + "..."
                        : "No messages"}
                    </Table.Cell>
                    <Table.Cell>{new Date(conv.updatedAt).toLocaleDateString()}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </Card>
      </div>
    </PageShell>
  )
}

