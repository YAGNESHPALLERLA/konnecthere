"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { showToast } from "@/lib/toast"

const STATUS_OPTIONS = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"]

type Applicant = {
  id: string
  status: string
  coverLetter?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image?: string | null
  }
  resume?: {
    id: string
    fileName: string
    fileUrl: string
    parsedSkills?: string[] | null
    parsedTitle?: string | null
    parsedExperience?: number | null
  } | null
}

type JobResponse = {
  id: string
  title: string
  description: string
  requirements?: string | null
  location?: string | null
  remote: boolean
  status: string
  slug: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string | null
  company: {
    id: string
    name: string
    slug: string
    logo?: string | null
  }
  applications: Applicant[]
}

export default function EmployerJobDetailPage() {
  const params = useParams<{ id: string }>()
  const [job, setJob] = useState<JobResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareState, setShareState] = useState<string>("")
  const [messageAppId, setMessageAppId] = useState<string | null>(null)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageBody, setMessageBody] = useState("")

  useEffect(() => {
    if (params?.id) {
      loadJob()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  const loadJob = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/jobs/${params.id}`)
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Failed to load job")
      }
      const data = await res.json()
      setJob(data)
    } catch (err: any) {
      setError(err.message || "Failed to load job")
    } finally {
      setLoading(false)
    }
  }

  const shareOnLinkedIn = async () => {
    if (!job) return
    setShareState("Sharing to LinkedIn...")
    try {
      const res = await fetch(`/api/jobs/${job.id}/share/linkedin`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Share failed")
      }
      if (data.mode === "api") {
        setShareState("Shared to LinkedIn successfully")
      } else if (data.mode === "connect") {
        setShareState(data.message || "Connect your LinkedIn account to share.")
        if (data.connectUrl) {
          window.location.href = data.connectUrl
        }
      } else {
        setShareState(`Manual share payload ready. Copy & post on LinkedIn.\n${data.payload?.text || ''}`)
      }
    } catch (err: any) {
      setShareState(err.message)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Failed to update status")
      }
      await loadJob()
      showToast("Application status updated successfully", "success")
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error")
    }
  }

  const downloadResume = async (resumeId?: string) => {
    if (!resumeId) return
    try {
      const res = await fetch(`/api/resumes/${resumeId}/download`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to download resume")
      }
      window.open(data.url, "_blank")
    } catch (err: any) {
      showToast(err.message || "Failed to download resume", "error")
    }
  }

  const sendMessage = async () => {
    if (!messageAppId) return
    try {
      const res = await fetch(`/api/applications/${messageAppId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: messageSubject, message: messageBody }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message")
      }
      setMessageAppId(null)
      setMessageSubject("")
      setMessageBody("")
      showToast("Message sent successfully", "success")
    } catch (err: any) {
      showToast(err.message || "Failed to send message", "error")
    }
  }

  const totalApplicants = job?.applications.length || 0
  const shortlisted = useMemo(
    () => job?.applications.filter((app) => app.status === "SHORTLISTED").length || 0,
    [job]
  )

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-10">Loading job...</div>
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-red-600">{error || "Job not found"}</p>
        <Link href="/employer/dashboard" className="text-blue-600 underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{job.company.name}</p>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-gray-600">
            Status: <span className="font-medium">{job.status}</span> · Applicants: {totalApplicants} · Shortlisted: {shortlisted}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => window.open(`/jobs/${job.slug}`, "_blank")}
          >
            View public listing
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Share to LinkedIn
          </button>
        </div>
      </div>

      {shareState && <div className="p-4 border border-blue-200 text-sm text-blue-800 rounded-md bg-blue-50">{shareState}</div>}

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Applicants ({totalApplicants})</h2>
        {totalApplicants === 0 ? (
          <p className="text-gray-500">No applicants yet.</p>
        ) : (
          <div className="space-y-6">
            {job.applications.map((application) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {application.user.name || "Unnamed candidate"}
                    </p>
                    <p className="text-sm text-gray-500">{application.user.email}</p>
                    <p className="text-sm text-gray-500">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {application.resume && (
                      <button
                        onClick={() => downloadResume(application.resume?.id)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                      >
                        Download resume
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMessageAppId(application.id)
                        setMessageSubject(`Regarding ${job.title}`)
                        setMessageBody("")
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      Message
                    </button>
                  </div>
                </div>

                {application.resume?.parsedSkills && application.resume.parsedSkills.length > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-semibold">Skills:</span> {application.resume.parsedSkills.join(", ")}
                  </p>
                )}

                {messageAppId === application.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <textarea
                      placeholder="Message"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={sendMessage}
                        disabled={!messageSubject || !messageBody}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                      >
                        Send message
                      </button>
                      <button
                        onClick={() => {
                          setMessageAppId(null)
                          setMessageSubject("")
                          setMessageBody("")
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
