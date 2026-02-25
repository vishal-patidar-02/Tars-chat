"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import UserItem from "./user-item"

export default function Sidebar() {
  const users = useQuery(api.users.getUsers)

  return (
    <aside className="w-72 border-r bg-background">
      <div className="p-4 font-semibold">Chats</div>

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