import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CompanyActions } from "@/components/admin/CompanyActions"

export const dynamic = "force-dynamic"

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      hr: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      jobs: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      },
    },
  })

  if (!company) {
    redirect("/admin/hr")
  }

  return (
    <PageShell
      title={`Company: ${company.name}`}
      description="View and manage company details"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/hr">
            <Button variant="outline">← Back to HR Management</Button>
          </Link>
        </div>

        {/* Company Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <p className="text-gray-600 mt-1">{company.description || "No description"}</p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    company.verified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {company.verified ? "VERIFIED" : "PENDING"}
                </span>
                {company.verified && (
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    Verified
                  </span>
                )}
              </div>
            </div>
            <CompanyActions company={company} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Industry</p>
              <p className="font-medium">{company.industry || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="font-medium">{company.size || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{company.location || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Website</p>
              <p className="font-medium">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner</p>
              <p className="font-medium">
                {company.owner.name || company.owner.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">HR Manager</p>
              <p className="font-medium">
                {company.hr ? company.hr.name || company.hr.email : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Jobs */}
        {company.jobs.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">
              Jobs ({company.jobs.length})
            </h3>
            <div className="space-y-3">
              {company.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="font-medium hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {job.location || "Remote"} • {job.employmentType}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {job._count.applications} applications
                    </span>
                    <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      {job.status}
                    </span>
                    <Link href={`/admin/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

