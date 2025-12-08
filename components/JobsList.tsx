"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatRelativeTime, formatSalary } from "@/lib/utils"
import { Pill } from "@/components/ui/Pill"

type Job = {
  id: string
  title: string
  slug: string
  description: string
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
    logo: string | null
    slug: string
  }
}

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const response = await fetch("/api/jobs?limit=20")
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error("Error fetching jobs", error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-black/10 p-10 text-center text-sm text-black/60">
        Loading jobs...
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 p-10 text-center text-sm text-black/60">
        No jobs available at the moment.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.08em] text-black/60">
          {jobs.length} {jobs.length === 1 ? "role" : "roles"} available
        </p>
        <Link
          href="/jobs"
          className="text-sm font-semibold uppercase tracking-[0.08em] text-black hover:text-black/70"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className="block rounded-xl border border-black/10 px-5 py-6 transition hover:border-black"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-black">{job.title}</h2>
                  <Pill>{job.company.name}</Pill>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-black/60">
                  {job.location && <span>{job.location}</span>}
                  {job.remote && <span>Remote</span>}
                  <span>{job.employmentType.replace("_", " ")}</span>
                  <span>{job.experienceLevel.replace("_", " ")}</span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || "USD")}</span>
                  )}
                </div>
                <p className="text-sm text-black/70 line-clamp-2">
                  {job.description.substring(0, 220)}
                  {job.description.length > 220 ? "…" : ""}
                </p>
              </div>
              <div className="text-right text-sm text-black/50">{formatRelativeTime(job.createdAt)}</div>
            </div>
          </Link>
        ))}
      </div>
      {jobs.length >= 20 && (
        <div className="pt-4 text-center">
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-md border border-black px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] hover:bg-black hover:text-white transition"
          >
            View All Jobs
          </Link>
        </div>
      )}
    </div>
  )
}

