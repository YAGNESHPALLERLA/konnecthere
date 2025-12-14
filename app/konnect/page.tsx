"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Pill } from "@/components/ui/Pill"
import Link from "next/link"
import { showToast } from "@/lib/toast"

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  currentTitle: string | null
  location: string | null
  bio: string | null
  skills: string[]
  yearsOfExperience: number | null
  createdAt: string
}

export default function KonnectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [messaging, setMessaging] = useState<string | null>(null)
  const [connections, setConnections] = useState<Record<string, { status: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED" | "REQUESTED" | "RECEIVED" | "SELF"; isRequester: boolean; connectionId: string | null }>>({})
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/konnect")
      return
    }
  }, [status, router])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch users
  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status, debouncedSearch, roleFilter])

  // Fetch connection statuses for all users
  useEffect(() => {
    if (status === "authenticated" && users.length > 0) {
      fetchConnectionStatuses()
    }
  }, [status, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append("search", debouncedSearch)
      if (roleFilter !== "ALL") params.append("role", roleFilter)

      const res = await fetch(`/api/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConnectionStatuses = async () => {
    if (!session?.user || users.length === 0) return
    
    const statuses: Record<string, { status: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED" | "REQUESTED" | "RECEIVED" | "SELF"; isRequester: boolean; connectionId: string | null }> = {}
    let hasErrors = false
    
    // Fetch statuses with better error handling
    // Use Promise.allSettled to prevent one failure from stopping all requests
    const results = await Promise.allSettled(
      users.map(async (user) => {
        if (!user?.id) {
          return { userId: user?.id, success: false }
        }
        try {
          const res = await fetch(`/api/connections/status/${user.id}`, {
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })
          
          if (res.ok) {
            const data = await res.json()
            const currentUserId = (session.user as any)?.id
            if (!currentUserId) {
              statuses[user.id] = {
                status: "NONE",
                isRequester: false,
                connectionId: null,
              }
              return { userId: user.id, success: true }
            }
            
            if (data.status === "SELF") {
              statuses[user.id] = {
                status: "SELF",
                isRequester: false,
                connectionId: null,
              }
            } else if (data.connection) {
              const connStatus = data.connection.status
              const isRequester = data.connection.requesterId === currentUserId
              // Map PENDING to REQUESTED/RECEIVED for UI
              let uiStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED" | "REQUESTED" | "RECEIVED" | "SELF" = connStatus
              if (connStatus === "PENDING") {
                uiStatus = isRequester ? "REQUESTED" : "RECEIVED"
              }
              statuses[user.id] = {
                status: uiStatus,
                isRequester,
                connectionId: data.connection.id,
              }
            } else {
              statuses[user.id] = {
                status: data.status || "NONE",
                isRequester: false,
                connectionId: null,
              }
            }
            return { userId: user.id, success: true }
          } else {
            // If API returns error, default to NONE status (silently)
            // Don't log or show error for individual status fetches
            statuses[user.id] = {
              status: "NONE",
              isRequester: false,
              connectionId: null,
            }
            return { userId: user.id, success: false }
          }
        } catch (error: any) {
          // Silently handle errors - don't show toast for individual status fetches
          // This prevents spam when many users are on the page
          if (error.name !== "AbortError") {
            // Only log non-timeout errors
            console.warn(`Error fetching connection status for user ${user.id}:`, error.message)
          }
          statuses[user.id] = {
            status: "NONE",
            isRequester: false,
            connectionId: null,
          }
          hasErrors = true
          return { userId: user.id, success: false }
        }
      })
    )
    
    // Only show error toast if ALL requests failed (likely a network/server issue)
    const failedCount = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length
    if (failedCount === users.length && users.length > 0) {
      // All requests failed - show a single error message
      console.error("All connection status requests failed")
      // Don't show toast here - let individual operations show errors
    }
    
    setConnections(statuses)
  }

  const handleKonnect = async (userId: string) => {
    if (connecting || !userId) return
    setConnecting(userId)
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Only show success if we actually got a connection back
        if (data.connection) {
          // Update local state
          setConnections((prev) => ({
            ...prev,
            [userId]: {
              status: "REQUESTED",
              isRequester: true,
              connectionId: data.connection.id,
            },
          }))
          // Show success message only from API response
          const message = data.message || "Connection request sent successfully"
          showToast(message, res.status === 201 ? "success" : "info")
        } else {
          // If no connection but status is OK, refresh to get current state
          await fetchConnectionStatuses()
        }
        // Refresh connection statuses to ensure consistency
        await fetchConnectionStatuses()
      } else {
        let errorData
        try {
          errorData = await res.json()
        } catch {
          errorData = { error: `Failed to send connection request (${res.status})` }
        }
        
        const errorMessage = errorData?.error || `Failed to send connection request (${res.status})`
        
        // Handle specific error cases
        if (res.status === 200 && errorMessage.toLowerCase().includes("already pending")) {
          // Already pending - treat as success (idempotent)
          showToast("Connection request already pending", "info")
          await fetchConnectionStatuses()
          return
        }
        if (res.status === 409) {
          // Already exists or connected - show appropriate message
          if (errorMessage.toLowerCase().includes("already connected")) {
            showToast("Already connected to this user", "info")
          } else {
            showToast(errorMessage, "info")
          }
          await fetchConnectionStatuses()
          return
        } else if (res.status === 400) {
          // Bad request - show specific error only if it's not a duplicate
          if (!errorMessage.toLowerCase().includes("already") && 
              !errorMessage.toLowerCase().includes("pending") &&
              !errorMessage.toLowerCase().includes("connected")) {
            showToast(errorMessage, "error")
          } else {
            // Silently refresh for "already" type errors
            await fetchConnectionStatuses()
          }
        } else if (res.status === 404) {
          // User not found
          showToast("User not found. Please refresh the page.", "error")
        } else if (res.status === 503) {
          // Service unavailable (database connection error)
          showToast("Database connection error. Please try again in a moment.", "error")
        } else if (res.status >= 500) {
          // Server errors
          console.error("Connection request error:", errorData)
          // Check if it's a database error message
          if (errorMessage.toLowerCase().includes("database")) {
            showToast("Database error. Please try again in a moment.", "error")
          } else {
            showToast(errorMessage || "Server error. Please try again later.", "error")
          }
        } else {
          // Other client errors
          console.error("Connection request error:", errorData)
          showToast(errorMessage || "Failed to send connection request. Please try again.", "error")
        }
      }
    } catch (error) {
      console.error("Error sending connection request:", error)
      showToast("Network error. Please check your connection and try again.", "error")
    } finally {
      setConnecting(null)
    }
  }

  const handleAcceptReject = async (userId: string, status: "ACCEPTED" | "REJECTED") => {
    if (connecting || !userId) return
    setConnecting(userId)
    try {
      // Find the connection ID for this user
      let connectionId = connections[userId]?.connectionId
      
      // If not found in local state, fetch from API
      if (!connectionId) {
        const res = await fetch("/api/connections")
        if (res.ok) {
          const data = await res.json()
          const currentUserId = (session?.user as any)?.id
          const foundConn = data.connections?.find(
            (c: any) => 
              c.receiverId === currentUserId && 
              c.requesterId === userId && 
              c.status === "PENDING"
          )
          connectionId = foundConn?.id
        }
      }
      
      if (!connectionId) {
        showToast("Connection request not found. Please refresh the page.", "error")
        setConnecting(null)
        return
      }

      // Use the new respond endpoint
      const action = status === "ACCEPTED" ? "accept" : "reject"
      const updateRes = await fetch("/api/connections/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action }),
      })
      
      if (updateRes.ok) {
        const responseData = await updateRes.json()
        // Update local state immediately
        setConnections((prev) => ({
          ...prev,
          [userId]: {
            status: status,
            isRequester: false,
            connectionId: connectionId,
          },
        }))
        // Show message from API response, not hardcoded
        const message = responseData?.message || (status === "ACCEPTED" ? "Connection accepted" : "Connection rejected")
        if (status === "ACCEPTED") {
          showToast(`${message}! You can now message this user.`, "success")
        } else {
          showToast(message, "info")
        }
        // Refresh to ensure consistency
        await fetchConnectionStatuses()
      } else {
        const errorData = await updateRes.json().catch(() => ({ error: `Failed to ${action} connection` }))
        showToast(errorData?.error || `Failed to ${action} connection`, "error")
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()} connection:`, error)
      showToast(`Failed to ${status.toLowerCase()} connection. Please try again.`, "error")
    } finally {
      setConnecting(null)
    }
  }

  const handleMessage = async (userId: string) => {
    setMessaging(userId)
    try {
      // Create or get conversation
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        const data = await res.json()
        // Redirect to messages page with conversation ID
        router.push(`/messages?id=${data.conversation.id}`)
      } else {
        const error = await res.json()
        throw new Error(error.error || "Failed to create conversation")
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error)
      showToast(error.message || "Failed to start conversation. Please try again.", "error")
    } finally {
      setMessaging(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
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

  if (status === "loading" || loading) {
    return (
      <PageShell title="Konnect" description="Connect with members">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </PageShell>
    )
  }

  if (!session) {
    return null
  }

  return (
    <PageShell
      title="Konnect"
      description="Browse and connect with members of the KonnectHere community"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <Input
              label="Search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-4 items-center">
              <label className="text-sm font-medium text-black">
                Filter by Role:
              </label>
              <div className="flex gap-2">
                {["ALL", "USER", "HR", "ADMIN"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      roleFilter === role
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {role === "ALL" ? "All" : getRoleLabel(role)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Users Grid */}
        {users.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">
              {debouncedSearch || roleFilter !== "ALL"
                ? "No users match your filters."
                : "No users found."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
                      {getInitials(user.name, user.email)}
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {user.name || "Unnamed"}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Pill>{getRoleLabel(user.role)}</Pill>
                    </div>

                    {user.currentTitle && (
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {user.currentTitle}
                      </p>
                    )}

                    {user.location && (
                      <p className="text-xs text-gray-500 mb-2">
                        📍 {user.location}
                      </p>
                    )}

                    {user.yearsOfExperience !== null && (
                      <p className="text-xs text-gray-500 mb-2">
                        {user.yearsOfExperience} years of experience
                      </p>
                    )}

                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {user.bio}
                      </p>
                    )}

                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="text-xs px-2 py-1 text-gray-500">
                            +{user.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Konnect and Message Buttons */}
                    <div className="flex flex-col gap-2 mt-2">
                      {!connections[user.id] || connections[user.id].status === "NONE" ? (
                        <Button
                          onClick={() => handleKonnect(user.id)}
                          disabled={connecting === user.id}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          {connecting === user.id ? "Connecting..." : "Konnect"}
                        </Button>
                      ) : connections[user.id].status === "REQUESTED" || (connections[user.id].status === "PENDING" && connections[user.id].isRequester) ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          Requested
                        </Button>
                      ) : connections[user.id].status === "RECEIVED" || (connections[user.id].status === "PENDING" && !connections[user.id].isRequester) ? (
                        <>
                          <Button
                            onClick={() => handleAcceptReject(user.id, "ACCEPTED")}
                            disabled={connecting === user.id}
                            className="w-full"
                            size="sm"
                          >
                            {connecting === user.id ? "Processing..." : "Accept"}
                          </Button>
                          <Button
                            onClick={() => handleAcceptReject(user.id, "REJECTED")}
                            disabled={connecting === user.id}
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </>
                      ) : connections[user.id].status === "ACCEPTED" ? (
                        <Button
                          onClick={() => handleMessage(user.id)}
                          disabled={messaging === user.id}
                          className="w-full"
                          size="sm"
                        >
                          {messaging === user.id ? "Connecting..." : "Message"}
                        </Button>
                      ) : connections[user.id].status === "REJECTED" ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full bg-red-50 text-red-700"
                          size="sm"
                        >
                          Rejected
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {users.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            Showing {users.length} member{users.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </PageShell>
  )
}

