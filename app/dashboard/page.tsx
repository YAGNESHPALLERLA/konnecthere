import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UserDashboard() {
  // requireRole will redirect to /auth/signin if not authenticated or wrong role
  const user = await requireRole(["USER", "HR", "ADMIN"])

  const [applications, resumes, savedJobs] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedJob.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ])

  // Get unread message count
  const unreadCount = await prisma.message.count({
    where: {
      conversation: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      readAt: null,
      senderId: {
        not: user.id,
      },
    },
  })

  return (
    <PageShell
      title="Dashboard"
      description="Your profile, applications, and saved jobs"
    >
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline">
              Messages
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-black px-2 py-1 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>

        {/* Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Applications</h2>
            <Link href="/dashboard/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {applications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Job</Table.Header>
                  <Table.Header>Company</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Applied</Table.Header>
                  <Table.Header>Actions</Table.Header>
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
                    <Table.Cell>{app.job.company.name}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {app.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{new Date(app.createdAt).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${app.job.slug}`}>
                          <Button variant="ghost" size="sm">
                            View Job
                          </Button>
                        </Link>
                        <Link
                          href={`/messages?jobId=${app.job.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            Message HR
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No applications yet.</p>
          )}
        </Card>

        {/* Saved Jobs */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Saved Jobs</h2>
            <Link href="/dashboard/saved">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div>
                    <Link
                      href={`/jobs/${saved.job.slug}`}
                      className="font-bold hover:underline"
                    >
                      {saved.job.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {saved.job.company.name}
                    </p>
                  </div>
                  <Link href={`/jobs/${saved.job.slug}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No saved jobs yet.</p>
          )}
        </Card>

        {/* Resumes */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Resumes</h2>
            <Link href="/dashboard/resumes">
              <Button variant="outline">Manage</Button>
            </Link>
          </div>
          {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{resume.fileName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No resumes uploaded yet.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

