"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"

type Candidate = {
  id: string
  name: string | null
  email: string
  phone: string | null
  bio: string | null
  location: string | null
  currentTitle: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  skills: string[]
  education: any
  experience: any
  resumes: Array<{
    id: string
    fileName: string
    fileUrl: string
    createdAt: string
  }>
}

type Application = {
  id: string
  status: string
  coverLetter: string | null
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
  }
}

export default function CandidateProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const candidateId = params.candidateId as string
  const applicationId = searchParams.get("applicationId")
  const jobId = searchParams.get("jobId")

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string>("")

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (sessionStatus === "authenticated") {
      const userRole = (session?.user as any)?.role
      if (userRole !== "HR" && userRole !== "ADMIN") {
        router.push("/dashboard")
        return
      }
      fetchData()
    }
  }, [session, sessionStatus, router, candidateId, applicationId])

  const fetchData = async () => {
    try {
      const [candidateRes, appRes] = await Promise.all([
        fetch(`/api/hr/candidates/${candidateId}`),
        applicationId ? fetch(`/api/applications/${applicationId}`) : Promise.resolve(null),
      ])

      if (candidateRes.ok) {
        const candidateData = await candidateRes.json()
        setCandidate(candidateData)
      }

      if (appRes && appRes.ok) {
        const appData = await appRes.json()
        setApplication(appData)
        setApplicationStatus(appData.status)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!applicationId) return

    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setApplicationStatus(newStatus)
        if (application) {
          setApplication({ ...application, status: newStatus })
        }
        alert("Application status updated successfully!")
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update application status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <PageShell title="Candidate Profile">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </PageShell>
    )
  }

  if (!candidate) {
    return (
      <PageShell title="Candidate Profile">
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">Candidate not found or you don't have access.</p>
          <Link href="/hr/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={`${candidate.name || "Candidate"} Profile`}
      description="View candidate details and application information"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{candidate.name || "Unnamed Candidate"}</h1>
            <p className="text-gray-600 mt-1">{candidate.email}</p>
          </div>
          <Link href={jobId ? `/hr/jobs/${jobId}/applicants` : "/hr/jobs"}>
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        {/* Application Details */}
        {application && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Job Applied For</p>
                <Link
                  href={`/jobs/${application.job.slug}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {application.job.title}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="flex items-center gap-4">
                  <select
                    value={applicationStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black disabled:opacity-50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="HIRED">Hired</option>
                  </select>
                  {updatingStatus && <span className="text-sm text-gray-500">Updating...</span>}
                </div>
              </div>
              {application.coverLetter && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cover Letter</p>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-wrap text-sm">{application.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidate.currentTitle && (
              <div>
                <p className="text-sm text-gray-600">Current Title</p>
                <p className="font-medium">{candidate.currentTitle}</p>
              </div>
            )}
            {candidate.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{candidate.location}</p>
              </div>
            )}
            {candidate.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{candidate.phone}</p>
              </div>
            )}
            {candidate.website && (
              <div>
                <p className="text-sm text-gray-600">Website</p>
                <a
                  href={candidate.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {candidate.website}
                </a>
              </div>
            )}
            {candidate.linkedin && (
              <div>
                <p className="text-sm text-gray-600">LinkedIn</p>
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  View Profile
                </a>
              </div>
            )}
            {candidate.github && (
              <div>
                <p className="text-sm text-gray-600">GitHub</p>
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>
          {candidate.bio && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Bio</p>
              <p className="text-sm">{candidate.bio}</p>
            </div>
          )}
        </Card>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Resumes */}
        {candidate.resumes && candidate.resumes.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Resumes</h2>
            <div className="space-y-3">
              {candidate.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                >
                  <div>
                    <p className="font-medium">{resume.fileName}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      View Resume
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Education */}
        {candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Education</h2>
            <div className="space-y-4">
              {candidate.education.map((edu: any, idx: number) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                  <p className="font-medium">{edu.school}</p>
                  {edu.degree && <p className="text-sm text-gray-600">{edu.degree}</p>}
                  {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-sm text-gray-500">
                      {edu.startDate && new Date(edu.startDate).getFullYear()} -{" "}
                      {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Experience */}
        {candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Work Experience</h2>
            <div className="space-y-4">
              {candidate.experience.map((exp: any, idx: number) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                  <p className="font-medium">{exp.title} at {exp.company}</p>
                  {(exp.startDate || exp.endDate || exp.current) && (
                    <p className="text-sm text-gray-500">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString()} -{" "}
                      {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ""}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        {application && (
          <Card className="p-6">
            <div className="flex gap-4">
              <Link href={`/messages?userId=${candidate.id}&jobId=${application.job.id}`}>
                <Button>Send Message</Button>
              </Link>
              {jobId && (
                <Link href={`/hr/jobs/${jobId}/applicants`}>
                  <Button variant="outline">Back to Applicants</Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

