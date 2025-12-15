"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { showToast } from "@/lib/toast"

interface PendingRequest {
  id: string
  requesterId: string
  requester: {
    id: string
    name: string | null
    email: string
    image: string | null
    currentTitle: string | null
    location: string | null
    role: string
  }
  createdAt: string
}

export function ConnectionBell() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responding, setResponding] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    if (!session?.user) return

    try {
      const res = await fetch("/api/connections/pending")
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      } else {
        console.error("Failed to fetch pending requests:", res.status)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    if (session?.user) {
      fetchPendingRequests()

      // Poll every 10 seconds for new requests
      pollIntervalRef.current = setInterval(() => {
        fetchPendingRequests()
      }, 10000)

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleRespond = async (connectionId: string, action: "accept" | "reject") => {
    if (responding) return

    setResponding(connectionId)
    try {
      const res = await fetch("/api/connections/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action }),
      })

      if (res.ok) {
        const data = await res.json()
        const message = data?.message || (action === "accept" ? "Connection accepted" : "Connection rejected")
        
        if (action === "accept") {
          showToast("Connection accepted! You can now message this user.", "success")
        } else {
          showToast("Connection request rejected", "info")
        }

        // Remove from list
        setRequests((prev) => prev.filter((r) => r.id !== connectionId))
        
        // Refresh to get updated count
        await fetchPendingRequests()
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to respond" }))
        showToast(errorData?.error || "Failed to respond to connection request", "error")
      }
    } catch (error) {
      console.error("Error responding to connection request:", error)
      showToast("Network error. Please try again.", "error")
    } finally {
      setResponding(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin"
      case "HR":
        return "HR"
      case "USER":
        return "User"
      default:
        return role
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!session?.user) return null

  const badgeCount = requests.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Connection requests"
      >
        <svg
          className="w-6 h-6 text-slate-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {badgeCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Connection Requests</h3>
            {badgeCount === 0 && (
              <p className="text-sm text-slate-600 mt-1">No pending requests</p>
            )}
          </div>

          {requests.length > 0 && (
            <div className="divide-y divide-slate-200">
              {requests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-3">
                    {request.requester.image ? (
                      <img
                        src={request.requester.image}
                        alt={request.requester.name || request.requester.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {(request.requester.name || request.requester.email).charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {request.requester.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {request.requester.email}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {getRoleLabel(request.requester.role)}
                      </p>
                      {request.requester.currentTitle && (
                        <p className="text-xs text-slate-500 truncate">
                          {request.requester.currentTitle}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTimestamp(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleRespond(request.id, "accept")}
                      disabled={responding === request.id}
                      size="sm"
                      className="flex-1"
                    >
                      {responding === request.id ? "Processing..." : "Accept"}
                    </Button>
                    <Button
                      onClick={() => handleRespond(request.id, "reject")}
                      disabled={responding === request.id}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

