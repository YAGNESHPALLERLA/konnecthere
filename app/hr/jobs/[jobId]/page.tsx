"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { showToast } from "@/lib/toast"

type Job = {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  remote: boolean
  status: string
  slug: string
  employmentType: string
  experienceLevel: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  createdAt: string
  company: {
    id: string
    name: string
    slug: string
  }
  _count?: {
    applications: number
  }
  applications?: Array<{
    id: string
  }>
}

export default function HRJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const jobId = params.jobId as string
  const created = searchParams.get("created") === "true"

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      fetchJob()
    }
  }, [session, sessionStatus, router, jobId])

  const fetchJob = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/jobs/${jobId}`)
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

  const handleUpdateStatus = async (newStatus: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED") => {
    if (!job || updating) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setJob(updated)
        showToast("Job status updated successfully", "success")
      } else {
        const error = await res.json()
        showToast(error.error || "Failed to update job status", "error")
      }
    } catch (error) {
      console.error("Error updating job:", error)
      showToast("Failed to update job status", "error")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!job || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        showToast("Job deleted successfully", "success")
        router.push("/hr/jobs")
      } else {
        const error = await res.json()
        showToast(error.error || "Failed to delete job", "error")
        setDeleting(false)
        setShowDeleteConfirm(false)
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      showToast("Failed to delete job", "error")
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <PageShell title="Job Details">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </PageShell>
    )
  }

  if (error || !job) {
    return (
      <PageShell title="Job Details">
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{error || "Job not found"}</p>
          <Link href="/hr/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={job.title}
      description={`Manage job posting for ${job.company.name}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Message */}
        {created && (
          <Card className="p-4 bg-green-50 border border-green-200">
            <p className="text-green-800 font-medium">
              ✅ Job created successfully!
            </p>
          </Card>
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-600 mt-1">{job.company.name}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                Status: <span className="font-medium">{job.status}</span>
              </span>
              <span>•</span>
              <span>
                Applicants: <span className="font-medium">{job._count?.applications ?? job.applications?.length ?? 0}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/hr/jobs/${jobId}/applicants`}>
              <Button>View Applicants</Button>
            </Link>
            <Link href="/hr/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
          </div>
        </div>

        {/* Job Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">
                {job.remote ? "Remote" : job.location || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="font-medium">
                {job.employmentType.replace("_", "-")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience Level</p>
              <p className="font-medium">
                {job.experienceLevel.replace("_", "-")}
              </p>
            </div>
            {(job.salaryMin || job.salaryMax) && (
              <div>
                <p className="text-sm text-gray-600">Salary Range</p>
                <p className="font-medium">
                  {job.salaryMin && job.salaryMax
                    ? `${job.salaryCurrency || "USD"} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                    : job.salaryMin
                    ? `${job.salaryCurrency || "USD"} ${job.salaryMin.toLocaleString()}+`
                    : `Up to ${job.salaryCurrency || "USD"} ${job.salaryMax?.toLocaleString()}`}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
          </div>
        </Card>

        {/* Requirements */}
        {job.requirements && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Requirements</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{job.requirements}</p>
            </div>
          </Card>
        )}

        {/* Job Management Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Job Management</h2>
          <div className="space-y-4">
            {/* Status Management */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Change Status</p>
              <div className="flex flex-wrap gap-2">
                {job.status !== "PUBLISHED" && (
                  <Button
                    onClick={() => handleUpdateStatus("PUBLISHED")}
                    disabled={updating}
                    variant="outline"
                    size="sm"
                  >
                    {updating ? "Publishing..." : "Publish"}
                  </Button>
                )}
                {job.status !== "CLOSED" && (
                  <Button
                    onClick={() => handleUpdateStatus("CLOSED")}
                    disabled={updating}
                    variant="outline"
                    size="sm"
                  >
                    {updating ? "Closing..." : "Close Job"}
                  </Button>
                )}
                {job.status !== "DRAFT" && (
                  <Button
                    onClick={() => handleUpdateStatus("DRAFT")}
                    disabled={updating}
                    variant="outline"
                    size="sm"
                  >
                    {updating ? "Saving..." : "Save as Draft"}
                  </Button>
                )}
                {job.status !== "ARCHIVED" && (
                  <Button
                    onClick={() => handleUpdateStatus("ARCHIVED")}
                    disabled={updating}
                    variant="outline"
                    size="sm"
                  >
                    {updating ? "Archiving..." : "Archive"}
                  </Button>
                )}
              </div>
            </div>

            {/* Delete Job */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Danger Zone</p>
              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                >
                  Delete Job
                </Button>
              ) : (
                <div className="flex gap-2 items-center">
                  <p className="text-sm text-red-600">Are you sure? This action cannot be undone.</p>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                    size="sm"
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleting(false)
                    }}
                    disabled={deleting}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Link href={`/hr/jobs/${jobId}/applicants`}>
              <Button>View All Applicants ({job._count?.applications ?? job.applications?.length ?? 0})</Button>
            </Link>
            <Link href={`/jobs/${job.slug}`} target="_blank">
              <Button variant="outline">View Public Listing</Button>
            </Link>
            <Link href="/hr/jobs">
              <Button variant="outline">Back to Jobs List</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

