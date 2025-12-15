import { requireAuth } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ApplicationsPage() {
  const user = await requireAuth()

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
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
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-700"
      case "HIRED":
        return "bg-blue-100 text-blue-800"
      case "REVIEWED":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <PageShell
      title="My Applications"
      description="View and track all your job applications"
    >
      <div className="space-y-6">
        {applications.length > 0 ? (
          <Card className="p-6">
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
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${app.job.slug}`}>
                          <Button variant="ghost" size="sm">
                            View Job
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">You haven't applied to any jobs yet.</p>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

