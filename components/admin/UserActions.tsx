"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string | null
  email: string
  role: string
  status: string
}

export function UserActions({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this user?`)) {
      return
    }

    setLoading(true)
    setAction(`status-${newStatus}`)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
        alert(`User status updated to ${newStatus}`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    setLoading(true)
    setAction(`role-${newRole}`)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        router.refresh()
        alert(`User role updated to ${newRole}`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update user role")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    setAction("delete")
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        alert("User deleted successfully")
        window.location.href = "/admin/users"
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Status Actions */}
      {user.status === "ACTIVE" ? (
        <Button
          onClick={() => handleStatusChange("SUSPENDED")}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {action === "status-SUSPENDED" ? "Suspending..." : "Suspend"}
        </Button>
      ) : (
        <Button
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {action === "status-ACTIVE" ? "Activating..." : "Activate"}
        </Button>
      )}

      {/* Role Change (only for non-SUPER_ADMIN users) */}
      {user.role !== "SUPER_ADMIN" && (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={loading}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-black focus:border-black disabled:opacity-50"
        >
          <option value="USER">USER</option>
          <option value="HR">HR</option>
          <option value="ADMIN">ADMIN</option>
          <option value="MODERATOR">MODERATOR</option>
        </select>
      )}

      {/* Delete */}
      <Button
        onClick={handleDelete}
        disabled={loading}
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700"
      >
        {action === "delete" ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}

