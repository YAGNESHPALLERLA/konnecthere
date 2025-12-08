"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

const STATUS_OPTIONS = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"]

type ApplicationStatusUpdateProps = {
  applicationId: string
  currentStatus: string
  notes?: string
}

export function ApplicationStatusUpdate({
  applicationId,
  currentStatus,
  notes: initialNotes,
}: ApplicationStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(initialNotes || "")
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleUpdate = async () => {
    setUpdating(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status !== currentStatus ? status : undefined,
          notes: notes !== initialNotes ? notes : undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Failed to update application")
      }

      setMessage("Application updated successfully!")
      router.refresh()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage(err.message || "Failed to update application")
    } finally {
      setUpdating(false)
    }
  }

  const hasChanges = status !== currentStatus || notes !== (initialNotes || "")

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Internal Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this application..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          These notes are only visible to you and your team.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <Button
        onClick={handleUpdate}
        disabled={!hasChanges || updating}
        className="w-full"
      >
        {updating ? "Updating..." : "Update Application"}
      </Button>
    </div>
  )
}

