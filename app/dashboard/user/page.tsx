import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UserDashboard() {
  // This will redirect to /auth/signin if not authenticated
  // Or redirect to user's own dashboard if wrong role
  const user = await requireRole("USER")

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
      phone: true,
      bio: true,
      location: true,
      currentTitle: true,
      website: true,
      linkedin: true,
      github: true,
      twitter: true,
      education: true,
      experience: true,
      skills: true,
      availability: true,
      salaryExpectation: true,
      preferredLocation: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const [applications, resumes, savedJobs, totalApplications, totalSavedJobs] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedJob.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.application.count({
      where: { userId: user.id },
    }),
    prisma.savedJob.count({
      where: { userId: user.id },
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

  // Get status counts
  const applicationStatusCounts = await Promise.all([
    prisma.application.count({ where: { userId: user.id, status: "PENDING" } }),
    prisma.application.count({ where: { userId: user.id, status: "REVIEWED" } }),
    prisma.application.count({ where: { userId: user.id, status: "SHORTLISTED" } }),
    prisma.application.count({ where: { userId: user.id, status: "REJECTED" } }),
    prisma.application.count({ where: { userId: user.id, status: "HIRED" } }),
  ])

  const [pendingCount, reviewedCount, shortlistedCount, rejectedCount, hiredCount] = applicationStatusCounts

  return (
    <PageShell
      title="My Dashboard"
      description="Your profile, applications, and saved jobs"
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
                  {(userDetails?.name || userDetails?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {userDetails?.name || "User"}
                </h2>
                <p className="text-gray-600">{userDetails?.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                    {userDetails?.role || "USER"}
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
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

            {/* Additional Profile Info */}
            {(userDetails?.phone || userDetails?.location || userDetails?.currentTitle) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-200">
                {userDetails.phone && (
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-semibold">{userDetails.phone}</p>
                  </div>
                )}
                {userDetails.location && (
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-semibold">{userDetails.location}</p>
                  </div>
                )}
                {userDetails.currentTitle && (
                  <div>
                    <p className="text-gray-600">Current Title</p>
                    <p className="font-semibold">{userDetails.currentTitle}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            {userDetails?.bio && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">About</p>
                <p className="text-gray-800">{userDetails.bio}</p>
              </div>
            )}

            {/* Social Links */}
            {(userDetails?.website || userDetails?.linkedin || userDetails?.github || userDetails?.twitter) && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Links</p>
                <div className="flex flex-wrap gap-3">
                  {userDetails.website && (
                    <a href={userDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      Website
                    </a>
                  )}
                  {userDetails.linkedin && (
                    <a href={userDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      LinkedIn
                    </a>
                  )}
                  {userDetails.github && (
                    <a href={userDetails.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      GitHub
                    </a>
                  )}
                  {userDetails.twitter && (
                    <a href={userDetails.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      Twitter
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {userDetails?.skills && userDetails.skills.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {userDetails.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education Summary */}
            {userDetails?.education && Array.isArray(userDetails.education) && userDetails.education.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Education</p>
                <div className="space-y-2">
                  {userDetails.education.slice(0, 2).map((edu: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <p className="font-semibold">{edu.school}</p>
                      {edu.degree && <p className="text-gray-600">{edu.degree}{edu.field && ` in ${edu.field}`}</p>}
                      {(edu.startDate || edu.endDate) && (
                        <p className="text-gray-500 text-xs">
                          {edu.startDate} - {edu.endDate || "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                  {userDetails.education.length > 2 && (
                    <Link href="/dashboard/profile" className="text-blue-600 hover:underline text-sm">
                      View all {userDetails.education.length} education entries →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Experience Summary */}
            {userDetails?.experience && Array.isArray(userDetails.experience) && userDetails.experience.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Experience</p>
                <div className="space-y-2">
                  {userDetails.experience.slice(0, 2).map((exp: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <p className="font-semibold">{exp.title} at {exp.company}</p>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-gray-500 text-xs">
                          {exp.startDate} - {exp.current ? "Present" : exp.endDate || "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                  {userDetails.experience.length > 2 && (
                    <Link href="/dashboard/profile" className="text-blue-600 hover:underline text-sm">
                      View all {userDetails.experience.length} experience entries →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold">{totalApplications}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Shortlisted</p>
            <p className="text-2xl font-bold text-green-600">{shortlistedCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Saved Jobs</p>
            <p className="text-2xl font-bold">{totalSavedJobs}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Resumes</p>
            <p className="text-2xl font-bold">{resumes.length}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline">
              Messages
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

        {/* Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Applications</h2>
            <Link href="/dashboard/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {applications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
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
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{app.job.company.name}</Table.Cell>
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
                    <Table.Cell>{new Date(app.createdAt).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${app.job.slug}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link
                          href={`/messages?jobId=${app.job.id}`}
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
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No applications yet.</p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Saved Jobs */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Saved Jobs</h2>
            <Link href="/dashboard/saved">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div>
                    <Link
                      href={`/jobs/${saved.job.slug}`}
                      className="font-bold hover:underline"
                    >
                      {saved.job.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {saved.job.company.name}
                    </p>
                  </div>
                  <Link href={`/jobs/${saved.job.slug}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No saved jobs yet.</p>
          )}
        </Card>

        {/* Resumes */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Resumes</h2>
            <Link href="/dashboard/resumes">
              <Button variant="outline">Manage</Button>
            </Link>
          </div>
          {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{resume.fileName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {resume.parsedTitle && (
                        <span className="text-xs text-gray-600">
                          Title: {resume.parsedTitle}
                        </span>
                      )}
                      {resume.parsedExperience && (
                        <span className="text-xs text-gray-600">
                          {resume.parsedExperience} years exp.
                        </span>
                      )}
                      {resume.parsedSkills && resume.parsedSkills.length > 0 && (
                        <span className="text-xs text-gray-600">
                          {resume.parsedSkills.length} skills
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No resumes uploaded yet.</p>
              <Link href="/dashboard/resumes">
                <Button>Upload Resume</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}



