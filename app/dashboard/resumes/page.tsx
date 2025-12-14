"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { showToast } from "@/lib/toast"

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
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Allowed file types
      const allowedTypes = [
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        showToast("Please upload a PDF, DOC, or DOCX file", "error")
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast("File size must be less than 10MB", "error")
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      // Upload file directly to server-side route
      // The server handles S3 upload and database save
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser sets it automatically with boundary for multipart/form-data
      })

      if (!uploadRes.ok) {
        let errorData: any
        try {
          errorData = await uploadRes.json()
        } catch {
          errorData = { error: `Server error: ${uploadRes.status} ${uploadRes.statusText}` }
        }
        
        console.error("Upload error:", errorData)
        
        // Provide user-friendly error messages
        if (errorData.code === "AWS_NOT_CONFIGURED" || errorData.code === "AWS_CREDENTIALS_ERROR") {
          throw new Error("AWS S3 is not configured. Please configure AWS credentials in Vercel environment variables.")
        }
        
        if (errorData.code === "BUCKET_NOT_FOUND") {
          throw new Error(`S3 bucket not found. Please check AWS_S3_BUCKET_NAME environment variable.`)
        }
        
        throw new Error(errorData.error || `Failed to upload resume (${uploadRes.status})`)
      }

      const resume = await uploadRes.json()
      console.log("Resume uploaded successfully:", resume)

      showToast("Resume uploaded successfully!", "success")
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById("resume-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
      await fetchResumes()
    } catch (error: any) {
      console.error("Error uploading resume:", error)
      const errorMessage = error.message || "Failed to upload resume. Please try again."
      showToast(errorMessage, "error")
    } finally {
      setUploading(false)
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
        showToast("Resume deleted successfully", "success")
      } else {
        showToast("Failed to delete resume", "error")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      showToast("Failed to delete resume", "error")
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
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload New Resume</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume File (PDF, DOC, or DOCX - max 10MB)
              </label>
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </Button>
              {file && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    const fileInput = document.getElementById("resume-upload") as HTMLInputElement
                    if (fileInput) fileInput.value = ""
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload your resume in PDF, DOC, or DOCX format. It will be automatically parsed to extract your skills and experience.
            </p>
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Loading resumes...</p>
          </Card>
        ) : resumes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">You haven't uploaded any resumes yet.</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload your resume above to get started. You can use it when applying to jobs.
            </p>
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

