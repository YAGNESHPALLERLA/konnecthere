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
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

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
  }, [session, status, router, jobId])

  const fetchData = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/hr/jobs/${jobId}/applicants`),
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

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      app.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>
          </div>
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

