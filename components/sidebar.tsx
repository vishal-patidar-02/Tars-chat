"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import UserItem from "./user-item"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Fuse from "fuse.js"
import { SidebarSkeleton } from "./skeletons"
import dynamic from "next/dynamic"

const CreateGroupModal = dynamic(() => import("./create-group-modal"), { ssr: false })

export default function Sidebar() {
  const { user } = useUser()
  const [search, setSearch] = useState("")
  const [showGroupModal, setShowGroupModal] = useState(false)

  const users = useQuery(api.users.getUsers)
  const me = users?.find((u) => u.clerkId === user?.id)

  const conversations = useQuery(
    api.messages.getConversationsWithUnread,
    me ? { userId: me._id } : "skip"
  )

  const isLoading = !users

  /* ── Search mode ── */
  const filteredUsers = search.trim()
    ? new Fuse(users?.filter((u) => u._id !== me?._id) ?? [], {
        keys: ["name"],
        threshold: 0.4,
      })
        .search(search)
        .map((r) => r.item)
    : []

  /* ── Conversation mode ── */
  const conversationItems = conversations?.map((convo) => {
    if (convo.isGroup) {
      return {
        conversationId: convo._id,
        id: convo._id,
        name: convo.name ?? "Group Chat",
        image: undefined,
        online: false,
        unreadCount: convo.unreadCount,
        isGroup: true,
        memberCount: convo.members.length,
      }
    }

    const otherId = convo.members.find((id) => id !== me?._id)
    const otherUser = users?.find((u) => u._id === otherId)
    return {
      conversationId: convo._id,
      id: otherId!,
      name: otherUser?.name,
      image: otherUser?.image,
      online: otherUser?.online,
      unreadCount: convo.unreadCount,
      isGroup: false,
      memberCount: undefined,
    }
  })

  return (
    <aside className="flex h-full w-full flex-col bg-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {search.trim() ? "Search Results" : "Messages"}
        </h2>
        <div className="flex items-center gap-2">
          {!search.trim() && conversationItems && conversationItems.length > 0 && (
            <span className="rounded-md bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {conversationItems.length}
            </span>
          )}
          {/* New Group button */}
          {me && (
            <button
              onClick={() => setShowGroupModal(true)}
              title="New Group Chat"
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <Input
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm bg-elevated border-border placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring"
          />

          {search.trim() && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">

        {/* Loading skeleton */}
        {isLoading && <SidebarSkeleton />}

        {/* ── Search results ── */}
        {!isLoading && search.trim() && filteredUsers.length === 0 && (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
            title="No results"
            subtitle={`Nobody matched "${search}"`}
          />
        )}

        {!isLoading &&
          search.trim() &&
          filteredUsers.map((u) => (
            <UserItem
              key={u._id}
              id={u._id}
              name={u.name}
              image={u.image}
              online={(u as any).online}
            />
          ))}

        {/* ── Conversations ── */}
        {!isLoading && !search.trim() && conversationItems?.length === 0 && (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            title="No conversations"
            subtitle="Search for someone to start chatting"
          />
        )}

        {!isLoading &&
          !search.trim() &&
          conversationItems?.map((item) => (
            <UserItem
              key={item.conversationId}
              id={item.isGroup ? `group/${item.id}` : item.id}
              name={item.name}
              image={item.image}
              online={item.online}
              unreadCount={item.unreadCount}
              isGroup={item.isGroup}
              memberCount={item.memberCount}
            />
          ))}
      </div>

      {/* Group creation modal */}
      {showGroupModal && me && (
        <CreateGroupModal meId={me._id} onClose={() => setShowGroupModal(false)} />
      )}
    </aside>
  )
}

/* ── Empty State ── */
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center animate-fade-in">
      <span className="text-muted-foreground/40">{icon}</span>
      <p className="text-sm font-medium text-foreground/70">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}