"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatRelativeTime, formatSalary } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PageShell } from "@/components/layouts/PageShell"
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

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]
const EXPERIENCE_LEVELS = ["ENTRY", "MID_LEVEL", "SENIOR", "EXECUTIVE"]

type Filters = {
  location: string
  remote: "any" | "true" | "false"
  employmentType: string
  experienceLevel: string
  salaryMin: string
  salaryMax: string
}
export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [source, setSource] = useState<"algolia" | "postgres">("postgres")
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState<Filters>({
    location: "",
    remote: "any",
    employmentType: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    void fetchJobs()
  }, [debouncedQuery, filters])

  async function fetchJobs() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.append("q", debouncedQuery)
      if (filters.location) params.append("location", filters.location)
      if (filters.remote !== "any") params.append("remote", String(filters.remote === "true"))
      if (filters.employmentType) params.append("employmentType", filters.employmentType)
      if (filters.experienceLevel) params.append("experienceLevel", filters.experienceLevel)
      if (filters.salaryMin) params.append("salaryMin", filters.salaryMin)
      if (filters.salaryMax) params.append("salaryMax", filters.salaryMax)

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      setJobs(data.jobs || [])
      setMeta(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
      setSource(data.source || "postgres")
    } catch (error) {
      console.error("Error fetching jobs", error)
    } finally {
      setLoading(false)
    }
  }

  const totalLabel = useMemo(() => {
    if (loading) return "Searching…"
    return `${jobs.length} of ${meta.total} roles`
  }, [loading, jobs.length, meta.total])

  const hasActiveFilters =
    filters.location ||
    filters.employmentType ||
    filters.experienceLevel ||
    filters.salaryMin ||
    filters.salaryMax ||
    filters.remote !== "any"

  const clearFilters = () =>
    setFilters({ location: "", remote: "any", employmentType: "", experienceLevel: "", salaryMin: "", salaryMax: "" })
  return (
    <div className="bg-white">
      <PageShell
        title="Open roles"
        description="Search, refine, and respond without the noise."
        actions={<Pill>Source · {source}</Pill>}
      >
        <div className="space-y-6 rounded-xl border border-black/10 p-6">
          <Input
            label="Search"
            placeholder="Principal engineer, Head of Growth, London…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Location"
              placeholder="City or region"
              value={filters.location}
              onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
            />
            <label className="text-sm font-medium text-black">
              Employment type
              <select
                value={filters.employmentType}
                onChange={(event) => setFilters((prev) => ({ ...prev, employmentType: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Any</option>
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-black">
              Experience level
              <select
                value={filters.experienceLevel}
                onChange={(event) => setFilters((prev) => ({ ...prev, experienceLevel: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Any</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[{ label: "On-site & remote", value: "any" }, { label: "Remote only", value: "true" }, { label: "On-site only", value: "false" }].map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-black">
                <input
                  type="radio"
                  name="remote"
                  value={option.value}
                  checked={filters.remote === option.value}
                  onChange={(event) => setFilters((prev) => ({ ...prev, remote: event.target.value as Filters["remote"] }))}
                />
                <span>{option.label}</span>
              </label>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min"
                type="number"
                value={filters.salaryMin}
                onChange={(event) => setFilters((prev) => ({ ...prev, salaryMin: event.target.value }))}
              />
              <Input
                label="Max"
                type="number"
                value={filters.salaryMax}
                onChange={(event) => setFilters((prev) => ({ ...prev, salaryMax: event.target.value }))}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-fit">
              Clear filters
            </Button>
          )}
        </div>
      </PageShell>
      <PageShell subdued>
        {loading ? (
          <div className="rounded-xl border border-black/10 p-10 text-center text-sm text-black/60">Searching…</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-black/10 p-10 text-center text-sm text-black/60">
            No roles match these filters.
            {hasActiveFilters && (
              <Button variant="ghost" className="mt-4" onClick={clearFilters}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.08em] text-black/60">{totalLabel}</p>
              <span className="text-xs uppercase tracking-[0.08em] text-black/40">{meta.totalPages} pages</span>
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
          </div>
        )}
      </PageShell>
    </div>
  )
}
