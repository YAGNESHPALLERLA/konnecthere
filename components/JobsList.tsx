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
            <div className="h-6 bg-muted rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-12 text-center">
        <p className="text-base text-muted-foreground">No jobs available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          {jobs.length} {jobs.length === 1 ? "role" : "roles"} available
        </p>
        <Link
          href="/jobs"
          className="text-sm font-medium text-primary hover:text-primary-700 transition-colors duration-200 flex items-center gap-1"
        >
          View all <span>→</span>
        </Link>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className="group block rounded-xl border border-border bg-white px-6 py-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/50"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {job.title}
                  </h2>
                  <Pill className="bg-primary-50 text-primary-700 border-primary-200">
                    {job.company.name}
                  </Pill>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {job.location && (
                    <span className="px-2.5 py-1 rounded-md bg-muted/50">{job.location}</span>
                  )}
                  {job.remote && (
                    <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700">Remote</span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-muted/50">
                    {job.employmentType.replace("_", " ")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-muted/50">
                    {job.experienceLevel.replace("_", " ")}
                  </span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || "USD")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description.substring(0, 220)}
                  {job.description.length > 220 ? "…" : ""}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground md:ml-4">
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

