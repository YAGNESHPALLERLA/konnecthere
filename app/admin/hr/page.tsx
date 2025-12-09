import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminHRPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const params = await searchParams

  // Build where clause
  const where: any = {
    role: "HR",
    deletedAt: null,
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search as string, mode: "insensitive" } },
      { email: { contains: params.search as string, mode: "insensitive" } },
    ]
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status
  }

  // Get HR users with their companies
  const hrUsers = await prisma.user.findMany({
    where,
    include: {
      managedCompanies: {
        include: {
          _count: {
            select: {
              jobs: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Get company stats
  const companies = await prisma.company.findMany({
    where: {
      hrId: { in: hrUsers.map((u) => u.id) },
    },
    include: {
      hr: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  })

  return (
    <PageShell
      title="HR / Employer Management"
      description="Manage HR accounts and companies"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total HR Users</p>
            <p className="mt-2 text-3xl font-bold">{hrUsers.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Companies</p>
            <p className="mt-2 text-3xl font-bold">{companies.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Jobs</p>
            <p className="mt-2 text-3xl font-bold">
              {companies.reduce((sum, c) => sum + c._count.jobs, 0)}
            </p>
          </Card>
        </div>

        {/* HR Users */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">HR Users</h2>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
          {hrUsers.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Name</Table.Header>
                  <Table.Header>Email</Table.Header>
                  <Table.Header>Companies</Table.Header>
                  <Table.Header>Total Jobs</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {hrUsers.map((user) => {
                  const userCompanies = companies.filter((c) => c.hrId === user.id)
                  const totalJobs = userCompanies.reduce((sum, c) => sum + c._count.jobs, 0)

                  return (
                    <Table.Row key={user.id}>
                      <Table.Cell>{user.name || "—"}</Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{userCompanies.length}</Table.Cell>
                      <Table.Cell>{totalJobs}</Table.Cell>
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
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No HR users found.</p>
          )}
        </Card>

        {/* Companies */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Companies</h2>
          </div>
          {companies.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Company Name</Table.Header>
                  <Table.Header>HR Manager</Table.Header>
                  <Table.Header>Industry</Table.Header>
                  <Table.Header>Jobs</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {companies.map((company) => (
                  <Table.Row key={company.id}>
                    <Table.Cell>{company.name}</Table.Cell>
                    <Table.Cell>
                      {company.hr?.name || company.hr?.email || "—"}
                    </Table.Cell>
                    <Table.Cell>{company.industry || "—"}</Table.Cell>
                    <Table.Cell>{company._count.jobs}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          company.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : company.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : company.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {company.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/admin/hr/${company.id}`}>
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
            <p className="text-gray-600">No companies found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

