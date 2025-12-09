import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"
import { NotificationForm } from "@/components/admin/NotificationForm"

export const dynamic = "force-dynamic"

export default async function AdminNotificationsPage() {
  await requireAdmin()

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          recipients: true,
        },
      },
    },
  })

  return (
    <PageShell
      title="Notifications & Announcements"
      description="Send system-wide notifications to users"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Create Notification */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Create New Notification</h2>
          <NotificationForm />
        </Card>

        {/* Past Notifications */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Past Notifications ({notifications.length})</h2>
          {notifications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Title</Table.Header>
                  <Table.Header>Type</Table.Header>
                  <Table.Header>Target</Table.Header>
                  <Table.Header>Recipients</Table.Header>
                  <Table.Header>Sent</Table.Header>
                  <Table.Header>Created</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {notifications.map((notif) => (
                  <Table.Row key={notif.id}>
                    <Table.Cell>{notif.title}</Table.Cell>
                    <Table.Cell>{notif.type}</Table.Cell>
                    <Table.Cell>{notif.targetRole || "All Users"}</Table.Cell>
                    <Table.Cell>{notif._count.recipients}</Table.Cell>
                    <Table.Cell>
                      {notif.sentAt
                        ? new Date(notif.sentAt).toLocaleDateString()
                        : "Not sent"}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No notifications found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

