import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { UserActions } from "@/components/admin/UserActions"

export const dynamic = "force-dynamic"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      applications: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              company: { select: { name: true } },
            },
          },
        },
      },
      resumes: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      companies: {
        take: 5,
        include: {
          _count: { select: { jobs: true } },
        },
      },
    },
  })

  if (!user) {
    redirect("/admin/users")
  }

  return (
    <PageShell
      title={`User: ${user.name || user.email}`}
      description="View and manage user details"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/users">
            <Button variant="outline">← Back to Users</Button>
          </Link>
        </div>

        {/* User Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{user.name || "Unnamed User"}</h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                  {user.role}
                </span>
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
              </div>
            </div>
            <UserActions user={user} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{user.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{user.location || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Title</p>
              <p className="font-medium">{user.currentTitle || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Years of Experience</p>
              <p className="font-medium">
                {user.yearsOfExperience !== null ? `${user.yearsOfExperience} years` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Bio</p>
              <p className="text-sm">{user.bio}</p>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Applications */}
        {user.applications.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Recent Applications ({user.applications.length})</h3>
            <div className="space-y-3">
              {user.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <Link
                      href={`/jobs/${app.job.slug}`}
                      className="font-medium hover:underline"
                    >
                      {app.job.title}
                    </Link>
                    <p className="text-sm text-gray-600">{app.job.company.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resumes */}
        {user.resumes.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Resumes ({user.resumes.length})</h3>
            <div className="space-y-3">
              {user.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{resume.fileName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

