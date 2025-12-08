"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import Link from "next/link"

type Company = {
  id: string
  name: string
}

export default function CreateJobPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [fetchingCompanies, setFetchingCompanies] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    companyId: "",
    title: "",
    description: "",
    requirements: "",
    location: "",
    remote: false,
    employmentType: "FULL_TIME" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "TEMPORARY",
    experienceLevel: "MID_LEVEL" as "ENTRY" | "MID_LEVEL" | "SENIOR" | "EXECUTIVE",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/hr/jobs/new")
      return
    }

    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role
      if (userRole !== "HR" && userRole !== "ADMIN") {
        router.push("/dashboard")
        return
      }
      fetchCompanies()
    }
  }, [session, status, router])

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/hr/companies")
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies || [])
        if (data.companies && data.companies.length > 0) {
          setFormData((prev) => ({ ...prev, companyId: data.companies[0].id }))
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setFetchingCompanies(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyId || !formData.title || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      }

      const res = await fetch("/api/hr/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create job")
      }

      const job = await res.json()
      router.push(`/hr/jobs/${job.id}?created=true`)
    } catch (error: any) {
      console.error("Error creating job:", error)
      alert(error.message || "Failed to create job. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || fetchingCompanies) {
    return (
      <PageShell title="Create Job">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </PageShell>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const userRole = (session?.user as any)?.role
  if (userRole !== "HR" && userRole !== "ADMIN") {
    return null
  }

  return (
    <PageShell
      title="Post New Job"
      description="Create a new job posting for your company"
    >
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div>
              <Label htmlFor="companyId">
                Company <span className="text-red-500">*</span>
              </Label>
              {companies.length === 0 ? (
                <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 mb-2">
                    No companies found. You need to be assigned to a company to post jobs.
                  </p>
                  <Link href="/dashboard/hr">
                    <Button variant="outline" size="sm">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <select
                  id="companyId"
                  required
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, companyId: e.target.value }))
                  }
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Title */}
            <div>
              <Label htmlFor="title">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Senior Software Engineer"
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                required
                rows={8}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="mt-2"
              />
            </div>

            {/* Requirements */}
            <div>
              <Label htmlFor="requirements">Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                rows={6}
                value={formData.requirements}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, requirements: e.target.value }))
                }
                placeholder="List the required skills, qualifications, and experience..."
                className="mt-2"
              />
            </div>

            {/* Location and Remote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="e.g., San Francisco, CA"
                  className="mt-2"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remote}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, remote: e.target.checked }))
                    }
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium">Remote work available</span>
                </label>
              </div>
            </div>

            {/* Employment Type and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <select
                  id="employmentType"
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      employmentType: e.target.value as any,
                    }))
                  }
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>
              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <select
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: e.target.value as any,
                    }))
                  }
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="MID_LEVEL">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salaryMin">Min Salary (USD)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salaryMin: e.target.value }))
                  }
                  placeholder="e.g., 80000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">Max Salary (USD)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salaryMax: e.target.value }))
                  }
                  placeholder="e.g., 120000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="salaryCurrency">Currency</Label>
                <select
                  id="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salaryCurrency: e.target.value }))
                  }
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "DRAFT" | "PUBLISHED",
                  }))
                }
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="DRAFT">Draft (Save for later)</option>
                <option value="PUBLISHED">Publish immediately</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/hr/jobs">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || companies.length === 0}>
                {loading ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}

