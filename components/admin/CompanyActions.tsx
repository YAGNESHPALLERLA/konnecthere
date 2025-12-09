"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

type Company = {
  id: string
  name: string
  status?: string
  verified: boolean
}

export function CompanyActions({ company }: { company: Company }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    const action = newStatus === "APPROVED" ? "verify" : "unverify"
    if (!confirm(`Are you sure you want to ${action} this company?`)) {
      return
    }

    setLoading(true)
    setAction(`status-${newStatus}`)
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: newStatus === "APPROVED" }),
      })

      if (res.ok) {
        router.refresh()
        alert(`Company ${action}ed successfully`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update company")
      }
    } catch (error) {
      console.error("Error updating company:", error)
      alert("Failed to update company")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!company.verified && (
        <Button
          onClick={() => handleStatusChange("APPROVED")}
          disabled={loading}
          size="sm"
        >
          {action === "status-APPROVED" ? "Verifying..." : "Verify"}
        </Button>
      )}
      {company.verified && (
        <Button
          onClick={() => handleStatusChange("REJECTED")}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {action === "status-REJECTED" ? "Unverifying..." : "Unverify"}
        </Button>
      )}
    </div>
  )
}

