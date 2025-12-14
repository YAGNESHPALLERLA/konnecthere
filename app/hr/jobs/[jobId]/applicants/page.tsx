"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

type Job = {
  id: string
  title: string
  location: string | null
  remote: boolean
  company: {
    name: string
  }
}

type Application = {
  id: string
  status: string
  createdAt: string
  coverLetter: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  resume: {
    id: string
    fileName: string
    fileUrl: string
  } | null
}

export default function JobApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    experienceLevel: "",
    location: "",
    skills: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role
      if (userRole !== "HR" && userRole !== "ADMIN") {
        router.push("/dashboard")
        return
      }
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, jobId, filters.status, filters.experienceLevel, filters.location, filters.skills])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.experienceLevel) params.append("experienceLevel", filters.experienceLevel)
      if (filters.location) params.append("location", filters.location)
      if (filters.skills) params.append("skills", filters.skills)

      const [jobRes, appsRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/hr/jobs/${jobId}/applicants?${params.toString()}`),
      ])

      if (jobRes.ok) {
        const jobData = await jobRes.json()
        setJob(jobData)
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json()
        setApplications(appsData.applications || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [filters, status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-700"
      case "HIRED":
        return "bg-blue-100 text-blue-800"
      case "REVIEWED":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Applications are already filtered by backend, no need for client-side filtering
  const filteredApplications = applications

  if (status === "loading" || loading) {
    return (
      <PageShell title="Applicants">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </PageShell>
    )
  }

  if (!job) {
    return (
      <PageShell title="Applicants">
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">Job not found or you don't have access.</p>
          <Link href="/hr/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={`Applicants - ${job.title}`}
      description={`View and manage applicants for this position`}
    >
      <div className="space-y-6">
        {/* Job Info */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-gray-600 mt-1">{job.company.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {job.remote ? "Remote" : job.location || "Location not specified"}
              </p>
            </div>
            <Link href="/hr/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="">All Levels</option>
                <option value="ENTRY">Entry</option>
                <option value="MID_LEVEL">Mid Level</option>
                <option value="SENIOR">Senior</option>
                <option value="EXECUTIVE">Executive</option>
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
                Skills
              </label>
              <input
                type="text"
                placeholder="Filter by skills (comma-separated)..."
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
          </div>
          {(filters.status || filters.experienceLevel || filters.location || filters.skills) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ status: "", experienceLevel: "", location: "", skills: "" })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>

        {/* Applications Table */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {filteredApplications.length} Applicant{filteredApplications.length !== 1 ? "s" : ""}
            </h3>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {applications.length === 0
                  ? "No applicants yet for this job."
                  : "No applicants match your filters."}
              </p>
            </div>
          ) : (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Candidate</Table.Header>
                  <Table.Header>Email</Table.Header>
                  <Table.Header>Resume</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Applied</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {filteredApplications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      <span className="font-medium">
                        {app.user.name || "Unnamed"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600">{app.user.email}</span>
                    </Table.Cell>
                    <Table.Cell>
                      {app.resume ? (
                        <a
                          href={app.resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {app.resume.fileName}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No resume</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/hr/candidates/${app.user.id}?applicationId=${app.id}&jobId=${jobId}`}>
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/messages?userId=${app.user.id}&jobId=${jobId}`}>
                          <Button variant="ghost" size="sm">
                            Message
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

