"use client"

import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useRef } from "react"

export default function UserSync() {
  const { user, isLoaded } = useUser()

  const upsertUser = useMutation(api.users.upsertUser)
  const setOffline = useMutation(api.users.setOffline)

  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkId: user.id } : "skip"
  )

  const synced = useRef(false)

  useEffect(() => {
    if (!isLoaded || !user) return
    if (!synced.current) {
      synced.current = true
      upsertUser({
        clerkId: user.id,
        name: user.fullName || "User",
        image: user.imageUrl,
      })
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (!convexUser?._id) return
    const handleUnload = () => {
      setOffline({ userId: convexUser._id })
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [convexUser])

  return null
}