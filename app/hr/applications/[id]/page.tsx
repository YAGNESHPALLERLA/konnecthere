import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ApplicationStatusUpdate } from "@/components/applications/ApplicationStatusUpdate"

export const dynamic = "force-dynamic"

export default async function HRApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole("HR")
  const { id } = await params

  // Get the application with all related data
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          company: {
            select: {
              id: true,
              name: true,
              hrId: true,
            },
          },
        },
      },
      resume: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          parsedSkills: true,
          parsedTitle: true,
          parsedExperience: true,
        },
      },
    },
  })

  if (!application) {
    notFound()
  }

  // Verify HR has access to this application
  if (application.job.company.hrId !== user.id) {
    notFound()
  }

  return (
    <PageShell
      title="Application Review"
      description={`Reviewing application for ${application.job.title}`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/hr/applications">
          <Button variant="outline">← Back to Applications</Button>
        </Link>

        {/* Application Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Candidate Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold">
                    {application.user.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg">{application.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied On</p>
                  <p className="text-lg">
                    {new Date(application.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Card>

            {/* Job Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <Link
                    href={`/jobs/${application.job.slug}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {application.job.title}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-lg">{application.job.company.name}</p>
                </div>
              </div>
            </Card>

            {/* Resume */}
            {application.resume && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Resume</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">File Name</p>
                    <p className="text-lg">{application.resume.fileName}</p>
                  </div>
                  {application.resume.fileUrl && (
                    <div>
                      <a
                        href={application.resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button variant="outline">Download Resume</Button>
                      </a>
                    </div>
                  )}
                  {application.resume.parsedTitle && (
                    <div>
                      <p className="text-sm text-gray-600">Current Title</p>
                      <p className="text-lg">{application.resume.parsedTitle}</p>
                    </div>
                  )}
                  {application.resume.parsedExperience && (
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-lg">{application.resume.parsedExperience}</p>
                    </div>
                  )}
                  {application.resume.parsedSkills && application.resume.parsedSkills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.resume.parsedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Cover Letter</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {application.coverLetter}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Application Status</h2>
              <ApplicationStatusUpdate
                applicationId={application.id}
                currentStatus={application.status}
                notes={application.notes || undefined}
              />
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Actions</h2>
              <div className="space-y-3">
                <Link href={`/jobs/${application.job.slug}`} className="block">
                  <Button className="w-full" variant="outline">
                    View Job Posting
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

