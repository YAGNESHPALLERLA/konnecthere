"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import { DeleteJobButton } from "./DeleteJobButton"
import Link from "next/link"

type Job = {
  id: string
  title: string
  slug: string
  location: string | null
  remote: boolean
  employmentType: string
  status: string
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

interface HRJobsClientProps {
  initialJobs: Job[]
}

export function HRJobsClient({ initialJobs }: HRJobsClientProps) {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    location: "",
    employmentType: "",
  })

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.location) params.append("location", filters.location)
      if (filters.employmentType) params.append("employmentType", filters.employmentType)

      const res = await fetch(`/api/hr/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Expose refresh function for DeleteJobButton to call
  useEffect(() => {
    // Store refresh function in window for DeleteJobButton to access
    if (typeof window !== "undefined") {
      (window as any).refreshHRJobs = fetchJobs
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).refreshHRJobs
      }
    }
  }, [fetchJobs])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-red-100 text-red-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="text-gray-600 mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/hr/jobs/new">
          <Button>Post New Job</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              value={filters.employmentType}
              onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
          </div>
        </div>
        {(filters.status || filters.location || filters.employmentType) && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ status: "", location: "", employmentType: "" })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Jobs Table */}
      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">
            {Object.values(filters).some((f) => f) ? "No jobs match your filters." : "No jobs posted yet."}
          </p>
          {!Object.values(filters).some((f) => f) && (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Start by creating your first job posting.
              </p>
              <Link href="/hr/jobs/new">
                <Button>Post Your First Job</Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Title</Table.Header>
                <Table.Header>Company</Table.Header>
                <Table.Header>Location</Table.Header>
                <Table.Header>Type</Table.Header>
                <Table.Header>Applications</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Created</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {jobs.map((job) => (
                <Table.Row key={job.id}>
                  <Table.Cell>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="font-medium hover:underline"
                    >
                      {job.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{job.company.name}</Table.Cell>
                  <Table.Cell>
                    {job.remote ? (
                      <span className="text-gray-600">Remote</span>
                    ) : (
                      <span>{job.location || "Not specified"}</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-600">
                      {job.employmentType.replace("_", "-")}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/hr/jobs/${job.id}/applicants`}
                      className="font-medium hover:underline"
                    >
                      {job._count.applications}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-600">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2 items-center">
                      <Link href={`/hr/jobs/${job.id}/applicants`}>
                        <Button variant="ghost" size="sm">
                          View Applicants
                        </Button>
                      </Link>
                      <Link href={`/hr/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}
    </div>
  )
}

