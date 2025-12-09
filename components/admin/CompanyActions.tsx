"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

type Company = {
  id: string
  name: string
  status: string
}

export function CompanyActions({ company }: { company: Company }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this company?`)) {
      return
    }

    setLoading(true)
    setAction(`status-${newStatus}`)
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
        alert(`Company status updated to ${newStatus}`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update company status")
      }
    } catch (error) {
      console.error("Error updating company status:", error)
      alert("Failed to update company status")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {company.status === "PENDING" && (
        <>
          <Button
            onClick={() => handleStatusChange("APPROVED")}
            disabled={loading}
            size="sm"
          >
            {action === "status-APPROVED" ? "Approving..." : "Approve"}
          </Button>
          <Button
            onClick={() => handleStatusChange("REJECTED")}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {action === "status-REJECTED" ? "Rejecting..." : "Reject"}
          </Button>
        </>
      )}
      {company.status === "APPROVED" && (
        <Button
          onClick={() => handleStatusChange("SUSPENDED")}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {action === "status-SUSPENDED" ? "Suspending..." : "Suspend"}
        </Button>
      )}
      {company.status === "SUSPENDED" && (
        <Button
          onClick={() => handleStatusChange("APPROVED")}
          disabled={loading}
          size="sm"
        >
          {action === "status-APPROVED" ? "Re-approving..." : "Re-approve"}
        </Button>
      )}
    </div>
  )
}

