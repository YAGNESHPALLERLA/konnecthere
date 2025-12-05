"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { formatSalary, formatDate } from "@/lib/utils"

interface Job {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  employmentType: string
  experienceLevel: string
  createdAt: string
  company: {
    id: string
    name: string
    slug: string
    description: string | null
    website: string | null
    logo: string | null
    industry: string | null
    size: string | null
    location: string | null
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchJob()
    }
  }, [params.slug])

  useEffect(() => {
    if (job && session) {
      checkSavedStatus()
    }
  }, [job, session])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/by-slug/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setJob(data)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkSavedStatus = async () => {
    if (!job || !session) return
    try {
      const res = await fetch(`/api/jobs/${job.id}/save`)
      if (res.ok) {
        const data = await res.json()
        setIsSaved(data.saved || false)
      }
    } catch (error) {
      // Job not saved or error checking
      setIsSaved(false)
    }
  }

  const handleSave = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/jobs/${params.slug}`))
      return
    }
    if (!job) return

    setSaving(true)
    try {
      if (isSaved) {
        const res = await fetch(`/api/jobs/${job.id}/save`, { method: "DELETE" })
        if (res.ok) {
          setIsSaved(false)
        }
      } else {
        const res = await fetch(`/api/jobs/${job.id}/save`, { method: "POST" })
        if (res.ok) {
          setIsSaved(true)
        }
      }
    } catch (error) {
      console.error("Error saving job:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleApply = () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/jobs/${params.slug}`))
      return
    }
    router.push(`/jobs/${params.slug}/apply`)
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>
  }

  if (!job) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Job not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <Link
              href={`/companies/${job.company.slug}`}
              className="text-blue-600 font-medium text-lg mb-4 block"
            >
              {job.company.name}
            </Link>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
              {job.location && <span>{job.location}</span>}
              {job.remote && <span className="text-green-600 font-medium">Remote</span>}
              <span>{job.employmentType.replace("_", " ")}</span>
              <span>{job.experienceLevel.replace("_", " ")}</span>
              {(job.salaryMin || job.salaryMax) && (
                <span className="font-semibold">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || "USD")}
                </span>
              )}
            </div>

            <div className="prose max-w-none mb-6">
              <h2 className="text-xl font-semibold mb-2">Job Description</h2>
              <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                <p className="whitespace-pre-wrap text-gray-700">{job.requirements}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <button
              onClick={handleApply}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold mb-4 transition"
            >
              Apply Now
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full px-6 py-3 rounded-lg font-semibold mb-4 transition ${
                isSaved
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {saving ? "..." : isSaved ? "✓ Saved" : "Save Job"}
            </button>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-2">Job Details</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Posted</dt>
                  <dd>{formatDate(job.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Employment Type</dt>
                  <dd>{job.employmentType.replace("_", " ")}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Experience Level</dt>
                  <dd>{job.experienceLevel.replace("_", " ")}</dd>
                </div>
                {job.location && (
                  <div>
                    <dt className="text-gray-500">Location</dt>
                    <dd>{job.location}</dd>
                  </div>
                )}
              </dl>
            </div>

            {job.company.website && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Visit Company Website →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

