"use client"

import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import ChatWindow from "@/components/chat-window"
import { PreparingChatSkeleton } from "@/components/skeletons"
import { Id } from "@/convex/_generated/dataModel"

export default function GroupChatRoom() {
  const params = useParams()
  const groupId = params.groupId as string

  const { user, isLoaded } = useUser()

  const users = useQuery(api.users.getUsers)
  const conversation = useQuery(
    api.messages.getConversation,
    groupId ? { conversationId: groupId as Id<"conversations"> } : "skip"
  )

  const me = users?.find((u) => u.clerkId === user?.id)

  const groupMembers = conversation?.members
    .map((memberId) => users?.find((u) => u._id === memberId))
    .filter(Boolean) as Array<{ _id: string; name: string; image?: string }> | undefined

  if (!isLoaded || !users || !me || !conversation || !groupMembers) {
    return <PreparingChatSkeleton />
  }

  // Make sure this is actually a group and the user is a member
  if (!conversation.isGroup || !conversation.members.includes(me._id)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Group not found.</p>
      </div>
    )
  }

  return (
    <ChatWindow
      conversationId={groupId as Id<"conversations">}
      meId={me._id}
      isGroup={true}
      groupName={conversation.name}
      groupMembers={groupMembers}
    />
  )
}