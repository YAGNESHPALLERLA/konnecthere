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
  // Conversations & chat state
  const [conversations, setConversations] = useState<any[]>([])
  const [filteredConversations, setFilteredConversations] = useState<any[]>([])
  const [conversationSearch, setConversationSearch] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageBody, setMessageBody] = useState("")
  const [sending, setSending] = useState(false)

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

  // Fetch conversations (for sidebar) when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations()
    }
  }, [status])

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
        const conversationId = data.conversation.id
        setSelectedConversation(conversationId)
        await fetchMessages(conversationId)
        await fetchConversations()
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

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (res.ok) {
        const data = await res.json()
        const convs = data.conversations || []
        setConversations(convs)
        setFilteredConversations(convs)
        if (convs.length > 0 && !selectedConversation) {
          setSelectedConversation(convs[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        const messagesArray = Array.isArray(data.messages)
          ? data.messages.filter((msg: any) => msg && msg.id && msg.body && msg.senderId && msg.sender)
          : []
        setMessages(messagesArray)
        await fetchConversations()
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("Failed to fetch messages:", res.status, res.statusText, errorData)
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    }
  }

  // Poll messages for selected conversation
  useEffect(() => {
    if (selectedConversation && status === "authenticated") {
      fetchMessages(selectedConversation)
      const interval = setInterval(() => {
        fetchMessages(selectedConversation)
      }, 3000)
      return () => clearInterval(interval)
    } else {
      setMessages([])
    }
  }, [selectedConversation, status])

  // Filter conversations based on sidebar search
  useEffect(() => {
    if (!conversationSearch.trim()) {
      setFilteredConversations(conversations)
      return
    }
    const query = conversationSearch.toLowerCase().trim()
    const filtered = conversations.filter((conv: any) => {
      const name = conv.participant?.name?.toLowerCase() || ""
      const email = conv.participant?.email?.toLowerCase() || ""
      return name.includes(query) || email.includes(query)
    })
    setFilteredConversations(filtered)
  }, [conversationSearch, conversations])

  const sendMessage = async () => {
    if (!messageBody.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation,
          body: messageBody,
        }),
      })

      if (res.ok) {
        setMessageBody("")
        await fetchMessages(selectedConversation)
        await fetchConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
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

        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4">
          {/* Conversations sidebar */}
          <Card className="p-0 h-[480px] flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h2 className="section-title mb-3">Chats</h2>
              <Input
                placeholder="Search by name or email..."
                value={conversationSearch}
                onChange={(e) => setConversationSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-slate-600 text-sm">
                  No conversations yet. Start by messaging someone.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                        selectedConversation === conv.id
                          ? "bg-slate-100 border-l-4 border-indigo-500 shadow-sm"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-slate-900">
                            {conv.participant?.name || conv.participant?.email || "Unknown"}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-slate-600 truncate mt-1">
                              {conv.lastMessage.body.substring(0, 40)}
                              {conv.lastMessage.body.length > 40 ? "..." : ""}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* User grid + chat panel */}
          <div className="space-y-4">
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

                      {/* User Info - Name & Email only */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {user.name || "Unnamed"}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {user.email}
                        </p>

                        {/* Message button (always available for other users) */}
                        <div className="flex flex-col gap-2 mt-3">
                          {session.user?.id === user.id ? null : (
                            <Button
                              onClick={() => handleMessage(user.id)}
                              disabled={messaging === user.id || !user.id}
                              className="w-full"
                              size="sm"
                            >
                              {messaging === user.id ? "Connecting..." : "Message"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Chat panel */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-slate-200 bg-white">
                    <h3 className="section-title">Conversation</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] bg-slate-50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg: any) => {
                        const currentUserId = (session.user as any)?.id
                        const isOwn = currentUserId && msg.senderId === currentUserId
                        const text = msg.body?.trim() || ""
                        if (!text) return null
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-3 py-2 text-sm shadow-sm transition-all duration-150 ${
                                isOwn
                                  ? "bg-indigo-500 text-white rounded-br-sm"
                                  : "bg-slate-100 text-slate-900 rounded-bl-sm"
                              }`}
                            >
                              {!isOwn && msg.sender && (
                                <p className="text-xs font-semibold mb-1 text-slate-600">
                                  {msg.sender.name || msg.sender.email || "Unknown"}
                                </p>
                              )}
                              <p
                                className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
                                  isOwn ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {text}
                              </p>
                              <p
                                className={`text-xs mt-1.5 ${
                                  isOwn ? "text-indigo-100" : "text-slate-500"
                                }`}
                              >
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                      <Input
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={sending || !messageBody.trim()}
                        className="px-6"
                      >
                        {sending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2 text-slate-900">Select a conversation</p>
                    <p className="text-sm text-slate-600">
                      Choose a chat from the left or message someone from the list above.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

