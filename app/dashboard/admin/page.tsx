import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // This will redirect to /auth/signin if not authenticated
  // Or redirect to user's own dashboard if wrong role
  await requireRole("ADMIN")

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
        company: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.conversation.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ])

  return (
    <PageShell
      title="Admin Dashboard"
      description="Manage users, jobs, applications, and conversations"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users.length}+</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold">{jobs.length}+</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Applications</p>
            <p className="text-2xl font-bold">{applications.length}+</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Conversations</p>
            <p className="text-2xl font-bold">{conversations.length}+</p>
          </Card>
        </div>

        {/* Users */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {users.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Name</Table.Header>
                  <Table.Header>Email</Table.Header>
                  <Table.Header>Role</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Created</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{user.name || "N/A"}</Table.Cell>
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
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No users found.</p>
          )}
        </Card>

        {/* Jobs */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Jobs</h2>
            <Link href="/admin/jobs">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {jobs.length > 0 ? (
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
                    <Table.Cell>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{job.company.name}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {job.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No jobs found.</p>
          )}
        </Card>

        {/* Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/admin/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {applications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Job</Table.Header>
                  <Table.Header>Applicant</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Applied</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {applications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      {app.user.name || app.user.email}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {app.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(app.createdAt).toLocaleDateString()}
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
}

