"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import UserItem from "./user-item"

export default function Sidebar() {
  const users = useQuery(api.users.getUsers)

  return (
    <aside className="w-72 border-r border-white/10 bg-[#0d1324]">

      <div className="p-4 text-lg font-semibold text-white">
        💬 Chats
      </div>

      <div className="flex flex-col gap-1 px-2">

        {users?.map(user => (
          <UserItem
            key={user._id}
            id={user._id}
            name={user.name}
            image={user.image}
          />
        ))}

      </div>
    </aside>
  )
}