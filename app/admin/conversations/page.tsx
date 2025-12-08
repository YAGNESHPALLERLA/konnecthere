import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminConversationsPage() {
  await requireRole("ADMIN")

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  })

  return (
    <PageShell
      title="All Conversations"
      description="Manage all conversations in the system"
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Conversations ({conversations.length})</h2>
            <Link href="/dashboard/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
          {conversations.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Participants</Table.Header>
                  <Table.Header>Last Message</Table.Header>
                  <Table.Header>Messages</Table.Header>
                  <Table.Header>Updated</Table.Header>
                  <Table.Header>Actions</Table.Header>
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
                      <Table.Cell>{conv._count.messages}</Table.Cell>
                      <Table.Cell>
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <Link href={`/messages?id=${conv.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No conversations found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

