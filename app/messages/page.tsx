"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PageShell } from "@/components/layouts/PageShell"

export const dynamic = "force-dynamic"

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

function MessagesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = searchParams.get("id")
  const targetUserId = searchParams.get("userId")
  const jobId = searchParams.get("jobId")
  const applicationId = searchParams.get("applicationId")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversationId || null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [messageBody, setMessageBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (session) {
      fetchConversations()
      if (targetUserId && !conversationId) {
        createOrGetConversation(targetUserId)
      } else if (jobId && !conversationId) {
        // Find job owner and create conversation
        findJobOwnerAndCreateConversation(jobId)
      } else if (applicationId && !conversationId) {
        // Find application user and create conversation
        findApplicationUserAndCreateConversation(applicationId)
      }
    }
  }, [session, targetUserId, conversationId, jobId, applicationId])

  useEffect(() => {
    if (selectedConversation && session) {
      fetchMessages(selectedConversation)
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation)
      }, 3000)
      return () => clearInterval(interval)
    } else {
      setMessages([])
    }
  }, [selectedConversation, session])

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const createOrGetConversation = async (userId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedConversation(data.conversation.id)
        router.push(`/messages?id=${data.conversation.id}`)
        fetchConversations()
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const findJobOwnerAndCreateConversation = async (jobId: string) => {
    try {
      // Fetch job to get owner
      const res = await fetch(`/api/jobs/${jobId}`)
      if (res.ok) {
        const job = await res.json()
        const ownerId = job.company?.ownerId
        if (ownerId) {
          await createOrGetConversation(ownerId)
        }
      }
    } catch (error) {
      console.error("Error finding job owner:", error)
    }
  }

  const findApplicationUserAndCreateConversation = async (applicationId: string) => {
    try {
      // Fetch application to get user
      const res = await fetch(`/api/applications/${applicationId}`)
      if (res.ok) {
        const application = await res.json()
        const userId = application.user?.id
        if (userId) {
          await createOrGetConversation(userId)
        }
      }
    } catch (error) {
      console.error("Error finding application user:", error)
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`)
      if (res.ok) {
        const data = await res.json()
        // Ensure messages is an array and has proper structure
        const messagesArray = Array.isArray(data.messages) 
          ? data.messages.filter((msg: any) => msg && msg.id && msg.body && msg.senderId && msg.sender)
          : []
        
        // Log for debugging (remove in production if needed)
        if (process.env.NODE_ENV === "development") {
          console.log("[MESSAGES] Fetched messages:", {
            count: messagesArray.length,
            sample: messagesArray[0],
          })
        }
        
        setMessages(messagesArray)
        fetchConversations() // Refresh to update unread counts
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
        fetchMessages(selectedConversation)
        fetchConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  )

  if (!session) {
    return (
      <PageShell title="Messages">
        <p>Please sign in to view messages.</p>
      </PageShell>
    )
  }

  return (
    <PageShell title="Messages" description="Chat with HR, admins, and other users" className="section">
      <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] gap-3">
        {/* Conversation List - Left Column */}
        <div className="w-full md:w-80 flex-shrink-0 border-r border-slate-200 md:border-r md:border-b-0 border-b">
          <Card className="h-full p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h2 className="section-title">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="p-4 text-center text-slate-600">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-600">No conversations yet.</div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv.id)
                        router.push(`/messages?id=${conv.id}`)
                      }}
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
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {conv.participant?.role || "USER"}
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
        </div>

        {/* Chat Window - Right Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden">
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
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages
                      .filter((msg) => msg && msg.id && msg.body && msg.body.trim())
                      .map((msg) => {
                        const currentUserId = session?.user?.id
                        const isOwn = currentUserId && msg.senderId === currentUserId
                        const messageBody = msg.body?.trim() || ""
                        
                        if (!messageBody) {
                          return null
                        }
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-3 py-2 text-sm shadow-sm ui-transition ${
                                isOwn
                                  ? "bg-indigo-500 text-white rounded-br-sm"
                                  : "bg-white text-slate-900 rounded-bl-sm border border-slate-200"
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
                                {messageBody}
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

                {/* Message Input Area */}
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
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2 text-slate-900">Select a conversation</p>
                  <p className="text-sm text-slate-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <PageShell title="Messages">
        <p>Loading...</p>
      </PageShell>
    }>
      <MessagesContent />
    </Suspense>
  )
}

