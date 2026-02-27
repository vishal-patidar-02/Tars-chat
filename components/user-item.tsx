"use client"

import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
  id: string
  name?: string
  image?: string
  unreadCount?: number
  online?: boolean
  lastMessage?: string
  isGroup?: boolean
  memberCount?: number
}

export default function UserItem({
  id,
  name,
  image,
  unreadCount,
  online,
  lastMessage,
  isGroup,
  memberCount,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  // For groups, id is "group/<conversationId>", for DMs it's just the userId
  const href = isGroup ? `/chat/${id}` : `/chat/${id}`
  const isActive = pathname.includes(id)

  return (
    <button
      onClick={() => router.push(href)}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isActive
          ? "bg-navy/10 dark:bg-cream/8 ring-1 ring-navy/20 dark:ring-cream/15"
          : "hover:bg-muted"
      }`}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        {isGroup ? (
          /* Group avatar — stacked icon */
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/15 dark:bg-cream/10 ring-1 ring-border">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-navy dark:text-cream">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        ) : (
          <Avatar className="h-10 w-10 ring-1 ring-border">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-navy text-parchment text-sm font-medium dark:bg-cream dark:text-navy">
              {name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        )}

        {!isGroup && online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-online-dot ring-2 ring-panel" />
        )}
      </div>

      {/* Name + subtitle */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={`truncate text-sm font-medium leading-tight ${
            isActive ? "text-navy dark:text-parchment" : "text-foreground"
          } ${unreadCount ? "font-semibold" : ""}`}
        >
          {name ?? (isGroup ? "Group Chat" : "Unknown")}
        </span>

        {isGroup && memberCount != null ? (
          <span className="mt-0.5 truncate text-xs text-muted-foreground">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        ) : lastMessage ? (
          <span className="mt-0.5 truncate text-xs text-muted-foreground">
            {lastMessage}
          </span>
        ) : null}
      </div>

      {/* Unread badge */}
      {unreadCount != null && unreadCount > 0 && (
        <span className="ml-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-navy px-1.5 text-[10px] font-semibold text-parchment dark:bg-cream dark:text-navy">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  )
}