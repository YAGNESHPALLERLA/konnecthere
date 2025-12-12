"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatRelativeTime, formatSalary } from "@/lib/utils"
import { Pill } from "@/components/ui/Pill"
import { Button } from "@/components/ui/Button"

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-12 text-center">
        <p className="text-base text-foreground-secondary">No jobs available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground-secondary">
          {jobs.length} {jobs.length === 1 ? "role" : "roles"} available
        </p>
        <Link
          href="/jobs"
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-150 flex items-center gap-1 group"
        >
          View all <span className="group-hover:translate-x-0.5 transition-transform duration-150">→</span>
        </Link>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className="card-hover group block rounded-xl border border-border bg-white px-6 py-6 shadow-card"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground-primary group-hover:text-primary transition-colors duration-150">
                    {job.title}
                  </h2>
                  <Pill className="bg-accent-muted text-primary">
                    {job.company.name}
                  </Pill>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-foreground-secondary">
                  {job.location && (
                    <span className="px-2.5 py-1 rounded-full bg-accent-muted text-foreground-primary">{job.location}</span>
                  )}
                  {job.remote && (
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700">Remote</span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-accent-muted text-foreground-primary">
                    {job.employmentType.replace("_", " ")}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-accent-muted text-foreground-primary">
                    {job.experienceLevel.replace("_", " ")}
                  </span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="px-2.5 py-1 rounded-full bg-accent-muted text-primary font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || "USD")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-secondary line-clamp-2 leading-relaxed">
                  {job.description.substring(0, 220)}
                  {job.description.length > 220 ? "…" : ""}
                </p>
              </div>
              <div className="text-right text-xs text-foreground-secondary md:ml-4">
                {formatRelativeTime(job.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {jobs.length >= 20 && (
        <div className="pt-6 text-center">
          <Button asChild>
            <Link href="/jobs">View All Jobs</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

