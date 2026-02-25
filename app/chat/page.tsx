"use client"

import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect } from "react"

export default function ChatPage() {
  const { user } = useUser()
  const upsertUser = useMutation(api.users.upsertUser)

  useEffect(() => {
    if (!user) return

    upsertUser({
      clerkId: user.id,
      name: user.fullName || "User",
      image: user.imageUrl,
    })
  }, [user])

  return (
    <div className="flex h-screen items-center justify-center">
      <h2 className="text-xl">Chat Dashboard</h2>
      <h3> love by Vishal</h3>
    </div>
  )
}