"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"

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
  _count: {
    applications: number
  }
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
                Applicants: <span className="font-medium">{job._count.applications}</span>
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

        {/* Actions */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Link href={`/hr/jobs/${jobId}/applicants`}>
              <Button>View All Applicants ({job._count.applications})</Button>
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

