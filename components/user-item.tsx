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
}

export default function UserItem({
  id,
  name,
  image,
  unreadCount,
  online,
  lastMessage,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = pathname.includes(id)

  return (
    <button
      onClick={() => router.push(`/chat/${id}`)}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isActive
          ? "bg-navy/10 dark:bg-cream/8 ring-1 ring-navy/20 dark:ring-cream/15"
          : "hover:bg-muted"
      }`}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 ring-1 ring-border">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-navy text-parchment text-sm font-medium dark:bg-cream dark:text-navy">
            {name?.charAt(0)?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>

        {online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-online-dot ring-2 ring-panel" />
        )}
      </div>

      {/* Name + last message */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={`truncate text-sm font-medium leading-tight ${
            isActive ? "text-navy dark:text-parchment" : "text-foreground"
          } ${unreadCount ? "font-semibold" : ""}`}
        >
          {name ?? "Unknown"}
        </span>

        {lastMessage && (
          <span className="mt-0.5 truncate text-xs text-muted-foreground">
            {lastMessage}
          </span>
        )}
      </div>

      {/* Unread badge */}
      {unreadCount != null && unreadCount > 0 && (
        <span className="ml-1 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy px-1.5 text-[10px] font-semibold text-parchment dark:bg-cream dark:text-navy">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  )
}