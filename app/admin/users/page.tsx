import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { UserFilters } from "@/components/admin/UserFilters"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  try {
    await requireAdmin()
    const params = await searchParams

    // Build where clause
    const where: any = {
      deletedAt: null, // Only show non-deleted users
    }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search as string, mode: "insensitive" } },
      { email: { contains: params.search as string, mode: "insensitive" } },
      { phone: { contains: params.search as string, mode: "insensitive" } },
    ]
  }

  if (params.role && params.role !== "ALL") {
    where.role = params.role
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status
  }

  if (params.location) {
    where.location = { contains: params.location as string, mode: "insensitive" }
  }

  // Pagination
  const page = parseInt((params.page as string) || "1")
  const limit = parseInt((params.limit as string) || "20")
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        location: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <PageShell
      title="User Management"
      description="Manage all users in the system"
    >
      <div className="space-y-6">
        {/* Filters */}
        <UserFilters />

        {/* Users Table */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Users ({total})
            </h2>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
          {users.length > 0 ? (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>Name</Table.Header>
                    <Table.Header>Email</Table.Header>
                    <Table.Header>Role</Table.Header>
                    <Table.Header>Status</Table.Header>
                    <Table.Header>Location</Table.Header>
                    <Table.Header>Created</Table.Header>
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
                              ? "bg-green-100 text-green-800"
                              : user.status === "SUSPENDED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{user.location || "—"}</Table.Cell>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link href={`/admin/users?page=${page - 1}`}>
                        <Button variant="outline" size="sm">
                          Previous
                        </Button>
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link href={`/admin/users?page=${page + 1}`}>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600">No users found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
  } catch (error: any) {
    console.error("Error in AdminUsersPage:", error)
    return (
      <PageShell title="Error" description="An error occurred">
        <Card className="p-6">
          <p className="text-red-600">Error loading users: {error.message || "Unknown error"}</p>
          <Link href="/admin">
            <Button variant="outline" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </PageShell>
    )
  }
}

