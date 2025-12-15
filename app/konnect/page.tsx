"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { showToast } from "@/lib/toast"

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Conversation {
  id: string
  updatedAt: string
  lastMessage: {
    body: string
    sender: {
      id: string
      name: string | null
      email: string
    }
    createdAt: string
  } | null
  unreadCount: number
  participant: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  } | null
}

interface Message {
  id: string
  body: string
  senderId: string
  sender: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  createdAt: string
  readAt: string | null
}

export default function KonnectPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
  // Conversations & chat state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [conversationSearch, setConversationSearch] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  
  // Message cache: store messages per conversation to prevent refetch
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [initialLoad, setInitialLoad] = useState<Record<string, boolean>>({})
  
  const [messageBody, setMessageBody] = useState("")
  const [sending, setSending] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasFetchedRef = useRef<Record<string, boolean>>({})

  // Get messages for selected conversation from cache
  const messages = selectedConversation ? (messagesCache[selectedConversation] || []) : []

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch users (only in discovery mode)
  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status, debouncedSearch])

  // Fetch conversations once on mount and when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations()
    }
  }, [status])

  // Auto-scroll to bottom when new messages arrive (scroll only inside the chat panel)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages.length])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append("search", debouncedSearch)

      const res = await fetch(`/api/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("[KONNECT] Failed to fetch users:", {
          status: res.status,
          error: errorData,
        })
        showToast("Failed to load users. Please try again.", "error")
      }
    } catch (error: any) {
      console.error("[KONNECT] Error fetching users:", {
        message: error?.message,
        stack: error?.stack,
      })
      showToast("Network error. Please check your connection.", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (res.ok) {
        const data = await res.json()
        // Only keep conversations that have at least one message
        const convs = (data.conversations || []).filter(
          (conv: Conversation) => !!conv.lastMessage
        )
        setConversations(convs)
        setFilteredConversations(convs)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("[KONNECT] Failed to fetch conversations:", {
          status: res.status,
          error: errorData,
        })
        showToast("Failed to load conversations. Please try again.", "error")
      }
    } catch (error: any) {
      console.error("[KONNECT] Error fetching conversations:", {
        message: error?.message,
        stack: error?.stack,
      })
      showToast("Network error. Please check your connection.", "error")
    }
  }

  // Fetch messages for a conversation (only if not cached or needs refresh)
  const fetchMessages = useCallback(async (conversationId: string, showLoading = false) => {
    if (!conversationId) return

    // Show loading only on first load
    if (showLoading && !hasFetchedRef.current[conversationId]) {
      setLoadingMessages(true)
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        const messagesArray = Array.isArray(data.messages)
          ? data.messages
              .filter((msg: any) => msg && msg.id && msg.body && msg.senderId && msg.sender)
              .sort((a: any, b: any) => {
                // Sort by createdAt ascending (oldest first)
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              })
          : []

        // Update cache for this conversation
        setMessagesCache((prev) => ({
          ...prev,
          [conversationId]: messagesArray,
        }))

        // Mark as fetched
        hasFetchedRef.current[conversationId] = true
        setInitialLoad((prev) => ({ ...prev, [conversationId]: true }))

        // Refresh conversations to update unread counts (silently, no loading state)
        fetchConversations()
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("[KONNECT] Failed to fetch messages:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        })
        // Only show error on first load
        if (showLoading) {
          showToast("Failed to load messages. Please try again.", "error")
        }
      }
    } catch (error: any) {
      console.error("[KONNECT] Error fetching messages:", {
        message: error?.message,
        stack: error?.stack,
      })
      // Only show error on first load
      if (showLoading) {
        showToast("Network error. Please check your connection.", "error")
      }
    } finally {
      if (showLoading) {
        setLoadingMessages(false)
      }
    }
  }, [])

  // Handle conversation selection - fetch messages only if not cached
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId)
    
    // Only fetch if not already cached
    if (!hasFetchedRef.current[conversationId]) {
      fetchMessages(conversationId, true)
    }
  }, [fetchMessages])

  // Poll messages for selected conversation (silent updates, no loading state)
  useEffect(() => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    if (selectedConversation && status === "authenticated") {
      // Initial fetch if not cached
      if (!hasFetchedRef.current[selectedConversation]) {
        fetchMessages(selectedConversation, true)
      }

      // Set up polling for silent updates (no loading state)
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(selectedConversation, false)
      }, 3000) // Poll every 3 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    }
  }, [selectedConversation, status, isMessagingMode, fetchMessages])

  // Filter conversations based on sidebar search
  useEffect(() => {
    if (!conversationSearch.trim()) {
      setFilteredConversations(conversations)
      return
    }
    const query = conversationSearch.toLowerCase().trim()
    const filtered = conversations.filter((conv) => {
      const name = conv.participant?.name?.toLowerCase() || ""
      const email = conv.participant?.email?.toLowerCase() || ""
      return name.includes(query) || email.includes(query)
    })
    setFilteredConversations(filtered)
  }, [conversationSearch, conversations])

  const handleStartConversation = async (userId: string) => {
    if (!session?.user) return

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        const data = await res.json()
        const conversationId = data.conversation.id
        
        // Switch to messaging mode and select the conversation
        setIsMessagingMode(true)
        setSelectedConversation(conversationId)
        
        // Fetch messages for the new conversation
        await fetchMessages(conversationId, true)
        await fetchConversations()
        showToast("Conversation started", "success")
      } else {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData?.error || `Failed to start conversation (${res.status})`
        console.error("[KONNECT] Failed to create conversation:", {
          status: res.status,
          error: errorData,
        })
        showToast(errorMessage, "error")
      }
    } catch (error: any) {
      console.error("[KONNECT] Error creating conversation:", {
        message: error?.message,
        stack: error?.stack,
      })
      showToast("Network error. Please check your connection.", "error")
    }
  }

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
        const newMessage = await res.json()
        setMessageBody("")
        
        // Optimistically add message to cache
        if (newMessage.message) {
          setMessagesCache((prev) => {
            const currentMessages = prev[selectedConversation] || []
            return {
              ...prev,
              [selectedConversation]: [...currentMessages, newMessage.message],
            }
          })
        }
        
        // Refresh to get updated conversation list and ensure message is saved
        await fetchMessages(selectedConversation, false)
        await fetchConversations()
      } else {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData?.error || `Failed to send message (${res.status})`
        console.error("[KONNECT] Failed to send message:", {
          status: res.status,
          error: errorData,
        })
        showToast(errorMessage, "error")
      }
    } catch (error: any) {
      console.error("[KONNECT] Error sending message:", {
        message: error?.message,
        stack: error?.stack,
      })
      showToast("Network error. Please check your connection.", "error")
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

  const currentConversation = filteredConversations.find(
    (c) => c.id === selectedConversation
  )

  // Check if messages are loading for the first time
  const isLoadingFirstTime = selectedConversation 
    ? loadingMessages && !initialLoad[selectedConversation]
    : false

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
        {/* Discover Users - Search */}
        <Card className="p-6">
          <Input
            label="Search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {/* Discover Users - Minimal cards with Message button */}
        <div>
          {users.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600">
                {debouncedSearch ? "No users match your search." : "No users found."}
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

                      {/* Single Message button */}
                      {session.user?.id !== user.id && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleStartConversation(user.id)}
                          >
                            Message
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Chats Panel: list + active conversation */}
        <div className="flex flex-col md:flex-row h-[calc(100vh-320px)] gap-4">
            {/* Left Panel: Conversation List - Shows ONLY users with existing conversations */}
            <Card className="w-full md:w-80 flex-shrink-0 h-full flex flex-col p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="section-title mb-3">Chats</h2>
                <Input
                  placeholder="Search by name or email..."
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 max-h-[70vh] overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-600 text-sm">
                    No conversations yet. Click on a user card to start messaging.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
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
                            {conv.updatedAt && (
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(conv.updatedAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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

            {/* Right Panel: Active Chat Window */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 bg-white">
                    <h3 className="section-title">
                      {currentConversation?.participant?.name ||
                        currentConversation?.participant?.email ||
                        "Conversation"}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {currentConversation?.participant?.role || "USER"}
                    </p>
                  </div>

                  {/* Messages Area - Scrollable */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-50"
                  >
                    {isLoadingFirstTime ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => {
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
                        })}
                      </>
                    )}
                  </div>

                  {/* Message Input Area - Fixed at Bottom */}
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
                        disabled={sending}
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
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2 text-slate-900">Select a conversation</p>
                    <p className="text-sm text-slate-600">
                      Choose a chat from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  )
}
