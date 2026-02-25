"use client"

import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect } from "react"

export default function UserSync() {
  const { user, isLoaded } = useUser()

  const upsertUser = useMutation(api.users.upsertUser)

  useEffect(() => {
    if (!isLoaded || !user) return

    upsertUser({
      clerkId: user.id,
      name: user.fullName || "User",
      image: user.imageUrl,
    })
  }, [isLoaded, user])

  return null
}