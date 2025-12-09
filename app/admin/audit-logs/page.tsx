import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const params = await searchParams

  const page = parseInt((params.page as string) || "1")
  const limit = 50
  const skip = (page - 1) * limit

  const where: any = {}
  if (params.actionType) {
    where.actionType = params.actionType
  }
  if (params.entityType) {
    where.entityType = params.entityType
  }

  const [logs, total] = await Promise.all([
    prisma.adminActionLog.findMany({
      where,
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.adminActionLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <PageShell
      title="Audit Logs"
      description="Track all admin actions and changes"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Audit Logs ({total})</h2>
          </div>
          {logs.length > 0 ? (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>Admin</Table.Header>
                    <Table.Header>Action</Table.Header>
                    <Table.Header>Entity</Table.Header>
                    <Table.Header>Entity ID</Table.Header>
                    <Table.Header>Timestamp</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {logs.map((log) => (
                    <Table.Row key={log.id}>
                      <Table.Cell>
                        {log.admin.name || log.admin.email}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                          {log.actionType}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{log.entityType}</Table.Cell>
                      <Table.Cell className="font-mono text-xs">
                        {log.entityId.substring(0, 8)}...
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(log.createdAt).toLocaleString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link href={`/admin/audit-logs?page=${page - 1}`}>
                        <Button variant="outline" size="sm">
                          Previous
                        </Button>
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link href={`/admin/audit-logs?page=${page + 1}`}>
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
            <p className="text-gray-600">No audit logs found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

