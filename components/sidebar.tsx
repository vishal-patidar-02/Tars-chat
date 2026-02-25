"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import UserItem from "./user-item"

export default function Sidebar() {
  const { user } = useUser()
  const users = useQuery(api.users.getUsers)

  // Find me in DB
  const me = users?.find(u => u.clerkId === user?.id)

  // Remove myself from list
  const filteredUsers = users?.filter(
    u => u._id !== me?._id
  )

  return (
    <aside className="w-72 border-r border-white/10 bg-[#0d1324]">

      <div className="p-4 text-lg font-semibold text-white">
        💬 Chats
      </div>

      <div className="flex flex-col gap-1 px-2">

        {filteredUsers?.map(user => (
          <UserItem
            key={user._id}
            id={user._id}
            name={user.name}
            image={user.image}
          />
        ))}

        {filteredUsers?.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-400">
            No other users yet
          </div>
        )}

      </div>
    </aside>
  )
}