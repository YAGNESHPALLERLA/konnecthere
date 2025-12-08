"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"

type Resume = {
  id: string
  fileName: string
  fileUrl: string
  createdAt: string
  parsedTitle: string | null
  parsedSkills: string[] | null
}

export default function ResumesPage() {
  const { data: session } = useSession()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchResumes()
    }
  }, [session])

  const fetchResumes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/resumes", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setResumes(data.resumes || [])
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return

    setDeleting(resumeId)
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setResumes(resumes.filter((r) => r.id !== resumeId))
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      alert("Failed to delete resume")
    } finally {
      setDeleting(null)
    }
  }

  if (!session) {
    return (
      <PageShell title="My Resumes">
        <p>Please sign in to view your resumes.</p>
        <Link href="/auth/signin">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="My Resumes"
      description="Manage your uploaded resumes"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Uploaded Resumes</h2>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Loading resumes...</p>
          </Card>
        ) : resumes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">You haven't uploaded any resumes yet.</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload a resume when applying to a job, or visit a job posting to upload one.
            </p>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{resume.fileName}</h3>
                    {resume.parsedTitle && (
                      <p className="text-sm text-gray-600 mb-1">
                        Title: {resume.parsedTitle}
                      </p>
                    )}
                    {resume.parsedSkills && resume.parsedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {resume.parsedSkills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {resume.parsedSkills.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{resume.parsedSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deleting === resume.id}
                    >
                      {deleting === resume.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}

