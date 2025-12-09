"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"

export function NotificationForm() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [targetRole, setTargetRole] = useState("ALL")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          type: "SYSTEM",
          targetRole: targetRole === "ALL" ? null : targetRole,
        }),
      })

      if (res.ok) {
        alert("Notification created successfully")
        setTitle("")
        setBody("")
        setTargetRole("ALL")
        window.location.reload()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create notification")
      }
    } catch (error) {
      console.error("Error creating notification:", error)
      alert("Failed to create notification")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div>
        <label className="text-sm font-medium text-black mb-2 block">Message</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={5}
        />
      </div>
      <label className="text-sm font-medium text-black">
        Target Audience
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
        >
          <option value="ALL">All Users</option>
          <option value="USER">Job Seekers (USER)</option>
          <option value="HR">HR / Employers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Notification"}
      </Button>
    </form>
  )
}

