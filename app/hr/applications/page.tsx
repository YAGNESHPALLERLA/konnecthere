import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HRApplicationsPage() {
  const user = await requireRole("HR")

  // Get companies managed by this HR user
  const companies = await prisma.company.findMany({
    where: {
      hrId: user.id,
    },
    select: {
      id: true,
    },
  })

  const companyIds = companies.map((c) => c.id)

  // Get all applications for jobs in managed companies
  const applications = await prisma.application.findMany({
    where: {
      job: {
        companyId: {
          in: companyIds,
        },
      },
    },
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
          slug: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  })

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    reviewed: applications.filter((a) => a.status === "REVIEWED").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
    hired: applications.filter((a) => a.status === "HIRED").length,
  }

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
      title="All Applications"
      description="Review and manage all job applications for your companies"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-600">Total</div>
            <div className="mt-2 text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-600">Pending</div>
            <div className="mt-2 text-2xl font-bold">{stats.pending}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-600">Reviewed</div>
            <div className="mt-2 text-2xl font-bold">{stats.reviewed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-600">Shortlisted</div>
            <div className="mt-2 text-2xl font-bold">{stats.shortlisted}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-600">Rejected</div>
            <div className="mt-2 text-2xl font-bold">{stats.rejected}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-600">Hired</div>
            <div className="mt-2 text-2xl font-bold">{stats.hired}</div>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="p-6">
          {applications.length > 0 ? (
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
                {applications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      <div>
                        <p className="font-medium">{app.user.name || "Unnamed"}</p>
                        <p className="text-xs text-gray-500">{app.user.email}</p>
                      </div>
                    </Table.Cell>
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
                        <Link href={`/hr/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">
                            Review
                          </Button>
                        </Link>
                        <Link
                          href={`/messages?applicationId=${app.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            Message
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No applications found.</p>
              <Link href="/hr/jobs">
                <Button variant="outline">View Jobs</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

