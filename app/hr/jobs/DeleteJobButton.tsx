"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

interface DeleteJobButtonProps {
  jobId: string
  jobTitle: string
}

export function DeleteJobButton({ jobId, jobTitle }: DeleteJobButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    if (deleting) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        // Show success message
        if (typeof window !== "undefined") {
          const { showToast } = await import("@/lib/toast")
          showToast("Job deleted successfully", "success")
          // Trigger refresh of jobs list if function exists
          if ((window as any).refreshHRJobs) {
            (window as any).refreshHRJobs()
          } else {
            // Fallback to router refresh
            router.refresh()
          }
        }
        setShowConfirm(false)
        setDeleting(false)
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to delete job" }))
        const errorMessage = errorData?.error || `Failed to delete job (${res.status})`
        console.error("Failed to delete job:", errorMessage)
        if (typeof window !== "undefined") {
          const { showToast } = await import("@/lib/toast")
          showToast(errorMessage, "error")
        }
        setDeleting(false)
        setShowConfirm(false)
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      if (typeof window !== "undefined") {
        const { showToast } = await import("@/lib/toast")
        showToast("Failed to delete job. Please try again.", "error")
      }
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(false)
    setDeleting(false)
  }

  if (showConfirm) {
    return (
      <div className="flex gap-1 items-center">
        <Button
          onClick={handleDelete}
          disabled={deleting}
          variant="outline"
          size="sm"
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs"
        >
          {deleting ? "Deleting..." : "Confirm"}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={deleting}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={deleting}
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
    >
      Delete
    </Button>
  )
}

