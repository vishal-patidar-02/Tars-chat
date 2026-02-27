"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ToastNotification } from "./use-notifications"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
  toast: ToastNotification
  onDismiss: (id: string) => void
}

const TOAST_DURATION = 5000 // ms

export function NotificationToast({ toast, onDismiss }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Slide in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => dismiss(), TOAST_DURATION)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setLeaving(true)
    setTimeout(() => onDismiss(toast.id), 350)
  }

  function handleClick() {
    router.push(toast.href)
    dismiss()
  }

  return (
    <div
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border border-border bg-popover p-3.5 shadow-xl ring-1 ring-black/5 transition-all duration-350 ease-out dark:ring-white/5 ${
        visible && !leaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      {/* Avatar */}
      <div className="relative mt-0.5 shrink-0">
        <Avatar className="h-9 w-9 ring-1 ring-border">
          <AvatarImage src={toast.senderImage} alt={toast.senderName} />
          <AvatarFallback className="bg-navy text-parchment text-sm font-medium dark:bg-cream dark:text-navy">
            {toast.isGroup ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ) : (
              toast.senderName.charAt(0).toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>
        {/* Blue dot indicator */}
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-navy ring-2 ring-popover dark:bg-cream" />
      </div>

      {/* Content — clickable */}
      <button
        onClick={handleClick}
        className="flex min-w-0 flex-1 flex-col text-left"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {toast.isGroup ? toast.groupName : toast.senderName}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">now</span>
        </div>
        {toast.isGroup && (
          <span className="text-[11px] text-muted-foreground -mt-0.5 mb-0.5">
            {toast.senderName}
          </span>
        )}
        <span className="truncate text-xs text-muted-foreground mt-0.5">
          {toast.message}
        </span>
      </button>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}