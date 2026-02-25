"use client"

import UserItem from "./user-item"

export default function Sidebar() {
  return (
    <aside className="w-72 border-r bg-background">
      <div className="p-4 font-semibold">Chats</div>

      <div className="flex flex-col gap-1 px-2">
        {/* Temporary Dummy Users */}
        <UserItem name="John Doe" />
        <UserItem name="Sarah Smith" />
        <UserItem name="Alex Kumar" />
      </div>
    </aside>
  )
}