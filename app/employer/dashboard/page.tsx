"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function EmployerDashboard() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [jobsRes, companiesRes] = await Promise.all([
        fetch("/api/jobs/my"),
        fetch("/api/companies"),
      ])

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(companiesData.companies || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p>Please sign in</p>
        <Link href="/auth/signin">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <div className="space-x-4">
          {companies.length === 0 ? (
            <Link
              href="/employer/companies/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Company
            </Link>
          ) : (
            <Link
              href="/employer/jobs/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Post a Job
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-1 hover:border-slate-300 border border-transparent">
          <h2 className="text-lg font-semibold mb-2">Active Jobs</h2>
          <p className="text-3xl font-bold text-blue-600">
            {jobs.filter((j) => j.status === "PUBLISHED").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-1 hover:border-slate-300 border border-transparent">
          <h2 className="text-lg font-semibold mb-2">Total Applications</h2>
          <p className="text-3xl font-bold text-gray-600">
            {jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-1 hover:border-slate-300 border border-transparent">
          <h2 className="text-lg font-semibold mb-2">Companies</h2>
          <p className="text-3xl font-bold text-gray-600">{companies.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">My Jobs</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No jobs posted yet</p>
            <Link href="/employer/jobs/new" className="text-blue-600 hover:underline mt-2 inline-block">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div key={job.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="text-gray-600">{job.company.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {job.applicationsCount || 0} applications • Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : job.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                    <Link
                      href={`/employer/jobs/${job.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Manage applicants
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

