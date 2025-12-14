"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { showToast } from "@/lib/toast"

type PendingRequest = {
  id: string
  requester: {
    id: string
    name: string | null
    email: string
    image: string | null
    currentTitle: string | null
    location: string | null
  }
  createdAt: string
}

export function ConnectionNotifications() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [responding, setResponding] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch pending requests
  const fetchRequests = async () => {
    if (!session?.user) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/connections/notifications")
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      } else {
        console.error("Failed to fetch connection requests")
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    if (open && session?.user) {
      fetchRequests()
    }
  }, [open, session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

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
        // Show message from API response, not hardcoded
        const message = data?.message || (action === "accept" ? "Connection accepted" : "Connection rejected")
        showToast(message, action === "accept" ? "success" : "info")
        // Remove from list
        setRequests((prev) => prev.filter((r) => r.id !== connectionId))
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

  if (!session?.user) return null

  const badgeCount = requests.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors duration-150"
        aria-label="Connection notifications"
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
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Connection Requests</h3>
            <p className="text-sm text-slate-600 mt-1">
              {badgeCount === 0 ? "No pending requests" : `${badgeCount} pending request${badgeCount > 1 ? "s" : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              <p>No pending connection requests</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {requests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {request.requester.image ? (
                      <img
                        src={request.requester.image}
                        alt={request.requester.name || request.requester.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {(request.requester.name || request.requester.email)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {request.requester.name || request.requester.email}
                      </p>
                      {request.requester.currentTitle && (
                        <p className="text-sm text-slate-600 truncate">
                          {request.requester.currentTitle}
                        </p>
                      )}
                      {request.requester.location && (
                        <p className="text-xs text-slate-500 truncate">
                          {request.requester.location}
                        </p>
                      )}
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
                      Reject
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

