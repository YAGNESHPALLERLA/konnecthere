"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

type Application = {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
    company: {
      name: string
    }
  }
}

type Recommendation = {
  job: {
    id: string
    title: string
    slug: string
    location: string | null
    remote: boolean
    employmentType: string
    experienceLevel: string
    company: {
      id: string
      name: string
      slug: string
      logo: string | null
    }
  }
  score: number
}

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [autoFillLoading, setAutoFillLoading] = useState(false)
  const [autoFillMessage, setAutoFillMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return
    void fetchApplications()
    void fetchRecommendations()
  }, [session?.user])

  const fetchApplications = async () => {
    setApplicationsLoading(true)
    try {
      const res = await fetch("/api/applications/my", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load applications")
      const data = await res.json()
      setApplications(data?.applications ?? [])
    } catch (error) {
      console.error("Error fetching applications", error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true)
    try {
      const res = await fetch("/api/recommendations?limit=5", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load recommendations")
      const data = await res.json()
      setRecommendations(data?.recommendations ?? [])
    } catch (error) {
      console.error("Error fetching recommendations", error)
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const handleAutoFillProfile = async () => {
    setAutoFillLoading(true)
    setAutoFillMessage(null)
    try {
      const res = await fetch("/api/profile/auto-fill", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to auto-fill profile")
      }
      setAutoFillMessage("Profile updated successfully! Your name and other details have been filled from your resume.")
      // Refresh the page to show updated name
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      setAutoFillMessage(error.message || "Failed to auto-fill profile")
    } finally {
      setAutoFillLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="mb-4 text-lg">Please sign in to view your dashboard.</p>
        <Link href="/auth/signin" className="text-blue-600 font-semibold hover:underline">
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back{session.user?.name ? `, ${session.user.name}` : ""}!</h1>
            <p className="text-gray-600">Track your applications and discover new opportunities tailored to your profile.</p>
          </div>
          <button
            onClick={handleAutoFillProfile}
            disabled={autoFillLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {autoFillLoading ? "Filling..." : "Auto-fill Profile"}
          </button>
        </div>
        {autoFillMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            autoFillMessage.includes("successfully") 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {autoFillMessage}
          </div>
        )}
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow">
          <p className="text-sm text-gray-500">My applications</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{applications.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Saved jobs</p>
          <p className="mt-2 text-3xl font-semibold text-gray-600">0</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Job alerts</p>
          <p className="mt-2 text-3xl font-semibold text-gray-600">0</p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Recent applications</h2>
        </div>
        {applicationsLoading ? (
          <div className="p-6 text-center text-gray-500">Loading your applications…</div>
        ) : applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>You haven’t applied to any roles yet.</p>
            <Link href="/jobs" className="mt-3 inline-block text-blue-600 hover:underline">
              Browse open roles
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {applications.map((app) => (
              <li key={app.id} className="px-6 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href={`/jobs/${app.job.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    {app.job.title}
                  </Link>
                  <p className="text-sm text-gray-600">{app.job.company.name}</p>
                  <p className="text-xs text-gray-500">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    app.status === "SHORTLISTED"
                      ? "bg-green-100 text-green-800"
                      : app.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl shadow">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recommended for you</h2>
            <p className="text-sm text-gray-500">Personalized suggestions based on your profile & resumes.</p>
          </div>
          <Link href="/jobs" className="text-sm font-medium text-blue-600 hover:underline">
            View all jobs →
          </Link>
        </div>
        {recommendationsLoading ? (
          <div className="p-6 text-center text-gray-500">Analyzing your background…</div>
        ) : recommendations.length === 0 ? (
          <div className="p-6 text-gray-600">
            <p>No recommendations yet.</p>
            <p className="text-sm text-gray-500 mt-2">Upload a resume or update your profile to unlock tailored suggestions.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {recommendations.map((item) => (
              <li key={item.job.id} className="px-6 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href={`/jobs/${item.job.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    {item.job.title}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {item.job.company.name}
                    {item.job.location ? ` • ${item.job.location}` : ""}
                    {item.job.remote ? " • Remote" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.job.employmentType.replace("_", " ")} • {item.job.experienceLevel.replace("_", " ")}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Match score: {(item.score * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
