"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { formatSalary, formatDate } from "@/lib/utils"

type SavedJob = {
  id: string
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
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
      logo: string | null
    }
  }
}

export default function SavedJobsPage() {
  const { data: session } = useSession()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [unsaving, setUnsaving] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchSavedJobs()
    }
  }, [session])

  const fetchSavedJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/jobs/saved", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setSavedJobs(data.savedJobs || [])
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (jobId: string) => {
    setUnsaving(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, { method: "DELETE" })
      if (res.ok) {
        setSavedJobs(savedJobs.filter((sj) => sj.job.id !== jobId))
      }
    } catch (error) {
      console.error("Error unsaving job:", error)
    } finally {
      setUnsaving(null)
    }
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="mb-4 text-lg">Please sign in to view your saved jobs.</p>
        <Link href="/auth/signin" className="text-blue-600 font-semibold hover:underline">
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Your bookmarked job opportunities</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">You haven't saved any jobs yet.</p>
          <Link href="/jobs" className="text-blue-600 font-semibold hover:underline">
            Browse jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <div key={savedJob.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/jobs/${savedJob.job.slug}`}
                    className="text-xl font-semibold text-blue-600 hover:underline mb-2 block"
                  >
                    {savedJob.job.title}
                  </Link>
                  <p className="text-gray-600 mb-2">{savedJob.job.company.name}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {savedJob.job.location && <span>{savedJob.job.location}</span>}
                    {savedJob.job.remote && <span className="text-green-600 font-medium">Remote</span>}
                    <span>{savedJob.job.employmentType.replace("_", " ")}</span>
                    <span>{savedJob.job.experienceLevel.replace("_", " ")}</span>
                    {(savedJob.job.salaryMin || savedJob.job.salaryMax) && (
                      <span className="font-semibold">
                        {formatSalary(
                          savedJob.job.salaryMin,
                          savedJob.job.salaryMax,
                          savedJob.job.salaryCurrency || "USD"
                        )}
                      </span>
                    )}
                    <span>Saved {formatDate(savedJob.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${savedJob.job.slug}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Job
                  </Link>
                  <button
                    onClick={() => handleUnsave(savedJob.job.id)}
                    disabled={unsaving === savedJob.job.id}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    {unsaving === savedJob.job.id ? "Removing..." : "Unsave"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


