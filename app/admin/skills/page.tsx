import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"
import { SkillManager } from "@/components/admin/SkillManager"

export const dynamic = "force-dynamic"

export default async function AdminSkillsPage() {
  await requireAdmin()

  const [skills, jobRoles, industries] = await Promise.all([
    prisma.skill.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.jobRole.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.industry.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <PageShell
      title="Skills & Categories"
      description="Manage skills, job roles, industries, and locations"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Skills */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Skills ({skills.length})</h2>
            <SkillManager type="skill" />
          </div>
          {skills.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Name</Table.Header>
                  <Table.Header>Category</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {skills.map((skill) => (
                  <Table.Row key={skill.id}>
                    <Table.Cell>{skill.name}</Table.Cell>
                    <Table.Cell>{skill.category || "—"}</Table.Cell>
                    <Table.Cell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No skills found.</p>
          )}
        </Card>

        {/* Job Roles */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Job Roles ({jobRoles.length})</h2>
            <SkillManager type="jobRole" />
          </div>
          {jobRoles.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Name</Table.Header>
                  <Table.Header>Category</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {jobRoles.map((role) => (
                  <Table.Row key={role.id}>
                    <Table.Cell>{role.name}</Table.Cell>
                    <Table.Cell>{role.category || "—"}</Table.Cell>
                    <Table.Cell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No job roles found.</p>
          )}
        </Card>

        {/* Industries */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Industries ({industries.length})</h2>
            <SkillManager type="industry" />
          </div>
          {industries.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Name</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {industries.map((industry) => (
                  <Table.Row key={industry.id}>
                    <Table.Cell>{industry.name}</Table.Cell>
                    <Table.Cell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No industries found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

