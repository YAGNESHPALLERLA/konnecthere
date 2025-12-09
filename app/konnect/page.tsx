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
        throw new Error("Failed to create conversation")
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
      alert("Failed to start conversation. Please try again.")
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

                    {/* Message Button */}
                    <Button
                      onClick={() => handleMessage(user.id)}
                      disabled={messaging === user.id}
                      className="w-full mt-2"
                      size="sm"
                    >
                      {messaging === user.id ? "Connecting..." : "Message"}
                    </Button>
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

