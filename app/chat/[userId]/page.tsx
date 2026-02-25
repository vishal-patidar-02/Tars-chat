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

  const { user } = useUser()

  const users = useQuery(api.users.getUsers)
  const createConv = useMutation(api.messages.getOrCreateConversation)

  const [conversationId, setConversationId] =
    useState<Id<"conversations">>()

  const me = users?.find(u => u.clerkId === user?.id)
  const other = users?.find(u => u._id === otherUserId)
  console.log("Clerk user:", user?.id)
console.log("Users from DB:", users)
console.log("Me:", me)
console.log("Other:", other)
console.log("Param otherUserId:", otherUserId)

  useEffect(() => {
    if (!me || !other) return

    createConv({
      user1: me._id,
      user2: other._id,
    }).then(id => setConversationId(id))
  }, [me, other])

  if (!conversationId || !me) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading chat...
      </div>
    )
  }

  return (
    <ChatWindow
      conversationId={conversationId}
      meId={me._id}
    />
  )
}