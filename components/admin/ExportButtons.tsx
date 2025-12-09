"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

export function ExportButtons() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (type: string) => {
    setLoading(type)
    try {
      const res = await fetch(`/api/admin/export/${type}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert("Failed to export data")
      }
    } catch (error) {
      console.error("Error exporting:", error)
      alert("Failed to export data")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleExport("users")}
        disabled={loading !== null}
        variant="outline"
        size="sm"
      >
        {loading === "users" ? "Exporting..." : "Export Users"}
      </Button>
      <Button
        onClick={() => handleExport("jobs")}
        disabled={loading !== null}
        variant="outline"
        size="sm"
      >
        {loading === "jobs" ? "Exporting..." : "Export Jobs"}
      </Button>
      <Button
        onClick={() => handleExport("applications")}
        disabled={loading !== null}
        variant="outline"
        size="sm"
      >
        {loading === "applications" ? "Exporting..." : "Export Applications"}
      </Button>
    </div>
  )
}

