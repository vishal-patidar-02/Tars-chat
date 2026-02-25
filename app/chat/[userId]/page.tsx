"use client"

import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat-window"
import { Id } from "@/convex/_generated/dataModel"

export default function ChatRoom() {
  const params = useParams()
  const otherUserId = params.userId as string

  const { user, isLoaded } = useUser()

  const users = useQuery(api.users.getUsers)

  const me = users?.find(u => u.clerkId === user?.id)
  const other = users?.find(u => u._id === otherUserId)

  // 🔥 NEW: fetch existing conversation
  const existingConversation = useQuery(
    api.messages.getConversationBetweenUsers,
    me && other
      ? {
          user1: me._id,
          user2: other._id,
        }
      : "skip"
  )

  const createConv = useMutation(api.messages.getOrCreateConversation)

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null)

  // 🔥 MAIN FIX
  useEffect(() => {
    if (!me || !other) return

    // If exists → use it
    if (existingConversation?._id) {
      setConversationId(existingConversation._id)
      return
    }

    // Else → create
    createConv({
      user1: me._id,
      user2: other._id,
    }).then(id => setConversationId(id))

  }, [me, other, existingConversation])

  // Loading states
  if (!isLoaded || !users) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  if (!me || !other || !conversationId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Preparing chat...
      </div>
    )
  }

  return (
    <ChatWindow
      conversationId={conversationId}
      meId={me._id}
      otherUser={other}
    />
  )
}
