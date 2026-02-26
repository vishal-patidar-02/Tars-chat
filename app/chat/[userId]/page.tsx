"use client"

import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat-window"
import { PreparingChatSkeleton } from "@/components/skeletons"
import { Id } from "@/convex/_generated/dataModel"

export default function ChatRoom() {
  const params = useParams()
  const otherUserId = params.userId as string

  const { user, isLoaded } = useUser()

  const users = useQuery(api.users.getUsers)

  const me    = users?.find((u) => u.clerkId === user?.id)
  const other = users?.find((u) => u._id === otherUserId)

  /* Fetch existing conversation */
  const existingConversation = useQuery(
    api.messages.getConversationBetweenUsers,
    me && other
      ? { user1: me._id, user2: other._id }
      : "skip"
  )

  const createConv = useMutation(api.messages.getOrCreateConversation)

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null)

  /* Main fix: use existing or create new */
  useEffect(() => {
    if (!me || !other) return

    if (existingConversation?._id) {
      setConversationId(existingConversation._id)
      return
    }

    createConv({
      user1: me._id,
      user2: other._id,
    }).then((id) => setConversationId(id))
  }, [me, other, existingConversation])

  /* Show skeleton while data is loading */
  if (!isLoaded || !users || !me || !other || !conversationId) {
    return <PreparingChatSkeleton />
  }

  return (
    <ChatWindow
      conversationId={conversationId}
      meId={me._id}
      otherUser={other}
    />
  )
}