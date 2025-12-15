import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HRDashboard() {
  // This will redirect to /auth/signin if not authenticated
  // Or redirect to user's own dashboard if wrong role
  const user = await requireRole("HR")

  // Get full user details
  const userDetails = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // Get companies managed by this HR user
  const companies = await prisma.company.findMany({
    where: {
      hrId: user.id,
    },
    include: {
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  })

  // Get jobs for these companies
  const jobs = await prisma.job.findMany({
    where: {
      companyId: {
        in: companies.map((c) => c.id),
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  })

  // Get recent applications for these jobs
  const applications = await prisma.application.findMany({
    where: {
      jobId: {
        in: jobs.map((j) => j.id),
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
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
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  // Get total counts
  const [totalJobs, totalApplications, publishedJobs, pendingApplications] = await Promise.all([
    prisma.job.count({
      where: {
        companyId: { in: companies.map((c) => c.id) },
      },
    }),
    prisma.application.count({
      where: {
        job: {
          companyId: { in: companies.map((c) => c.id) },
        },
      },
    }),
    prisma.job.count({
      where: {
        companyId: { in: companies.map((c) => c.id) },
        status: "PUBLISHED",
      },
    }),
    prisma.application.count({
      where: {
        job: {
          companyId: { in: companies.map((c) => c.id) },
        },
        status: "PENDING",
      },
    }),
  ])

  // Get unread message count
  const unreadCount = await prisma.message.count({
    where: {
      conversation: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      readAt: null,
      senderId: {
        not: user.id,
      },
    },
  })

  return (
    <PageShell
      title="HR Dashboard"
      description="Manage your company's jobs and applicants"
    >
      <div className="space-y-8">
        {/* Profile Summary */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              {userDetails?.image ? (
                <img
                  src={userDetails.image}
                  alt={userDetails.name || "Profile"}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                  {(userDetails?.name || userDetails?.email || "H").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {userDetails?.name || "HR User"}
                </h2>
                <p className="text-gray-600">{userDetails?.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                    {userDetails?.role || "HR"}
                  </span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    userDetails?.status === "ACTIVE" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {userDetails?.status || "ACTIVE"}
                  </span>
                  {userDetails?.emailVerified && (
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              {/* When a user is promoted to HR, they can define their own company name
                  by creating a company record. This keeps the company name fully
                  user-defined instead of auto-generated. */}
              <Link href={companies.length === 0 ? "/employer/companies/new" : "/hr/jobs/new"}>
                <Button>
                  {companies.length === 0 ? "Create Company" : "Post New Job"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="font-semibold">
                {userDetails?.createdAt 
                  ? new Date(userDetails.createdAt).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "long" 
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-semibold">
                {userDetails?.updatedAt 
                  ? new Date(userDetails.updatedAt).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "long" 
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Account Status</p>
              <p className="font-semibold capitalize">
                {userDetails?.status?.toLowerCase() || "Active"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Email Status</p>
              <p className="font-semibold">
                {userDetails?.emailVerified ? "Verified" : "Unverified"}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Companies</p>
            <p className="text-2xl font-bold">{companies.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold">{totalJobs}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold text-green-600">{publishedJobs}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold">{totalApplications}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingApplications}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/hr/jobs/new">
            <Button>Post New Job</Button>
          </Link>
          <Link href="/hr/applications">
            <Button variant="outline">View All Applications</Button>
          </Link>
          <Link href="/konnect">
            <Button variant="outline">
              Konnect
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-black px-2 py-1 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>

        {/* Jobs */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Jobs</h2>
            <Link href="/hr/jobs">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {jobs.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Title</Table.Header>
                  <Table.Header>Company</Table.Header>
                  <Table.Header>Applications</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {jobs.map((job) => (
                  <Table.Row key={job.id}>
                    <Table.Cell>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{job.company.name}</Table.Cell>
                    <Table.Cell>{job._count.applications}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {job.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/hr/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </Link>
                        <Link href={`/jobs/${job.slug}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No jobs posted yet.</p>
              <Link href="/hr/jobs/new">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/hr/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {applications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Job</Table.Header>
                  <Table.Header>Applicant</Table.Header>
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
                    <Table.Cell>
                      <div>
                        <p className="font-medium">{app.user.name || "Unnamed"}</p>
                        <p className="text-xs text-gray-500">{app.user.email}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        app.status === "SHORTLISTED"
                          ? "bg-green-100 text-green-800"
                          : app.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : app.status === "HIRED"
                          ? "bg-blue-100 text-blue-800"
                          : app.status === "REVIEWED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
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
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No applications yet.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

