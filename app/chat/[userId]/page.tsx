"use client"

import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat-window"

export default function ChatRoom() {
  const params = useParams()
  const otherUserId = params.userId as string

  const { user } = useUser()

  const users = useQuery(api.users.getUsers)
  const createConv = useMutation(api.messages.getOrCreateConversation)

  const [conversationId, setConversationId] = useState<string>()

  const me = users?.find(u => u.clerkId === user?.id)
  const other = users?.find(u => u._id === otherUserId)

  useEffect(() => {
    if (!me || !other) return

    createConv({
      user1: me._id,
      user2: other._id,
    }).then(id => setConversationId(id))
  }, [me, other])

  if (!conversationId) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading chat...
      </div>
    )
  }

  return <ChatWindow conversationId={conversationId} meId={me!._id} />
}