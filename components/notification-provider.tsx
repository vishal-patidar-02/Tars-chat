"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useNotifications, ToastNotification } from "./use-notifications"
import { NotificationToast } from "./notification-toast"

const MAX_TOASTS = 4

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default")

  const users = useQuery(api.users.getUsers)
  const me = users?.find((u) => u.clerkId === user?.id)

  // Check and sync permission state
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    setPermissionState(Notification.permission)
  }, [])

  const handleToast = useCallback((toast: ToastNotification) => {
    setToasts((prev) => {
      // Deduplicate: if same conversation already has a toast, replace it
      const filtered = prev.filter((t) => t.conversationId !== toast.conversationId)
      const next = [toast, ...filtered]
      return next.slice(0, MAX_TOASTS)
    })
  }, [])

  const { requestPermission } = useNotifications({
    meId: me?._id,
    allUsers: users,
    onToast: handleToast,
  })

  // Request permission once after user is confirmed signed in
  // We delay slightly to not interrupt the initial page load
  useEffect(() => {
    if (!isLoaded || !user) return
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "default") return

    const t = setTimeout(async () => {
      const result = await requestPermission()
      setPermissionState(result)
    }, 3000)

    return () => clearTimeout(t)
  }, [isLoaded, user, requestPermission])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <>
      {children}

      {/* Toast stack — bottom-right on desktop, top-center on mobile */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-100 flex flex-col-reverse gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </>
  )
}