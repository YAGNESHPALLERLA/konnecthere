"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<any>(null)
  const [resumes, setResumes] = useState<any[]>([])
  const [selectedResume, setSelectedResume] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [uploading, setUploading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (session && params.slug) {
      fetchJob()
      fetchResumes()
    }
  }, [session, params.slug])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/by-slug/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setJob(data)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
    }
  }

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes")
      if (res.ok) {
        const data = await res.json()
        setResumes(data.resumes || [])
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "application/pdf") {
        alert("Please upload a PDF file")
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      // Get upload URL
      const urlRes = await fetch("/api/resume/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!urlRes.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { uploadUrl, fileUrl, key } = await urlRes.json()

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file")
      }

      // Save resume record
      const saveRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })

      if (saveRes.ok) {
        const newResume = await saveRes.json()
        setResumes([...resumes, newResume])
        setSelectedResume(newResume.id)
        setFile(null)
        alert("Resume uploaded successfully!")
      }
    } catch (error) {
      console.error("Error uploading resume:", error)
      alert("Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !selectedResume) {
      alert("Please select a resume")
      return
    }

    setApplying(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: selectedResume,
          coverLetter: coverLetter || undefined,
        }),
      })

      if (res.ok) {
        router.push(`/candidate/dashboard?applied=true`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("An error occurred")
    } finally {
      setApplying(false)
    }
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p>Please sign in to apply</p>
        <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(`/jobs/${params.slug}/apply`)}`}>
          Sign In
        </Link>
      </div>
    )
  }

  if (!job) {
    return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Apply for {job.title}</h1>
      <p className="text-gray-600 mb-8">{job.company.name}</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Resume *
          </label>
          {resumes.length > 0 ? (
            <select
              required
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a resume</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.fileName} {resume.createdAt && `(Uploaded ${new Date(resume.createdAt).toLocaleDateString()})`}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No resumes uploaded yet</p>
          )}

          <div className="mt-4 border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Resume (PDF, max 10MB)
            </label>
            <div className="flex gap-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter (Optional)
          </label>
          <textarea
            id="coverLetter"
            rows={8}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell the employer why you're a great fit for this role..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={applying || !selectedResume}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {applying ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  )
}


