"use client"

import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useRef } from "react"

export default function UserSync() {
  const { user, isLoaded } = useUser()

  const upsertUser = useMutation(api.users.upsertUser)
  const setOffline = useMutation(api.users.setOffline)

  const synced = useRef(false)

  useEffect(() => {
    if (!isLoaded || !user || synced.current) return

    synced.current = true

    upsertUser({
      clerkId: user.id,
      name: user.fullName || "User",
      image: user.imageUrl,
    })

    const handleUnload = () => {
      setOffline({ userId: user.id as any })
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [isLoaded, user])

  return null
}