"use client"

import { useEffect, useRef, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { usePathname } from "next/navigation"

export interface ToastNotification {
  id: string
  senderName: string
  senderImage?: string
  message: string
  conversationId: string
  isGroup: boolean
  groupName?: string
  href: string
}

interface UseNotificationsOptions {
  meId: Id<"users"> | undefined
  allUsers: Array<{ _id: string; name: string; image?: string }> | undefined
  onToast: (toast: ToastNotification) => void
}

export function useNotifications({ meId, allUsers, onToast }: UseNotificationsOptions) {
  const pathname = usePathname()

  // Track which message IDs we've already notified about (persists across renders)
  const seenMessageIds = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)

  const conversations = useQuery(
    api.messages.getConversationsWithUnread,
    meId ? { userId: meId } : "skip"
  )

  // Get all messages across all conversations the user is in
  // We do this by watching the latest message per conversation via unread data
  // The real trigger: watch conversations with unread counts changing
  const prevUnreadRef = useRef<Map<string, number>>(new Map())

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return "denied"
    if (!("Notification" in window)) return "denied"
    if (Notification.permission === "granted") return "granted"
    if (Notification.permission === "denied") return "denied"
    const result = await Notification.requestPermission()
    return result
  }, [])

  const fireBrowserNotification = useCallback((toast: ToastNotification) => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission !== "granted") return
    if (document.visibilityState === "visible") return // only when tab is hidden

    const body = toast.isGroup
      ? `${toast.senderName} in ${toast.groupName}: ${toast.message}`
      : toast.message

    const notifOptions: NotificationOptions & { renotify?: boolean } = {
      body: body.length > 100 ? body.slice(0, 97) + "…" : body,
      icon: toast.senderImage ?? "/favicon.ico",
      tag: toast.conversationId, // collapses multiple notifs per conversation
      renotify: true,
    }

    const notif = new Notification(toast.senderName, notifOptions)

    notif.onclick = () => {
      window.focus()
      window.location.href = toast.href
      notif.close()
    }
  }, [])

  useEffect(() => {
    if (!conversations || !meId || !allUsers) return

    // On the very first load, seed seenMessageIds so we don't spam old unreads
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      for (const convo of conversations) {
        prevUnreadRef.current.set(convo._id, convo.unreadCount)
      }
      return
    }

    for (const convo of conversations) {
      const prevUnread = prevUnreadRef.current.get(convo._id) ?? 0
      const currUnread = convo.unreadCount

      // A new message arrived if unread count increased
      if (currUnread > prevUnread) {
        // Figure out the conversation href
        const isGroup = convo.isGroup ?? false
        const href = isGroup
          ? `/chat/group/${convo._id}`
          : `/chat/${convo.members.find((id) => id !== meId) ?? ""}`

        // Don't notify if user is already in this exact conversation
        if (pathname === href) {
          prevUnreadRef.current.set(convo._id, currUnread)
          continue
        }

        // Find the other member for DMs (sender is whoever is not me with a new message)
        let senderName = "Someone"
        let senderImage: string | undefined
        let groupName: string | undefined

        if (isGroup) {
          groupName = convo.name ?? "Group Chat"
          // We can't easily know *which* group member sent it without fetching,
          // so we show the group name as sender
          senderName = groupName
          // Use the first non-me member's image as a proxy
          const firstOther = convo.members.find((id) => id !== meId)
          const firstOtherUser = allUsers.find((u) => u._id === firstOther)
          senderImage = firstOtherUser?.image
        } else {
          const otherId = convo.members.find((id) => id !== meId)
          const otherUser = allUsers.find((u) => u._id === otherId)
          senderName = otherUser?.name ?? "Someone"
          senderImage = otherUser?.image
        }

        const toast: ToastNotification = {
          id: `${convo._id}-${Date.now()}`,
          senderName,
          senderImage,
          message: `${currUnread - prevUnread} new message${currUnread - prevUnread > 1 ? "s" : ""}`,
          conversationId: convo._id,
          isGroup,
          groupName,
          href,
        }

        onToast(toast)
        fireBrowserNotification(toast)
      }

      prevUnreadRef.current.set(convo._id, currUnread)
    }
  }, [conversations, meId, allUsers, pathname, onToast, fireBrowserNotification])

  return { requestPermission }
}