"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
  id: string
  name?: string
  image?: string
}

export default function UserItem({ id, name, image }: Props) {
  const router = useRouter()
 
  const active = typeof window !== "undefined" && window.location.pathname.includes(id);

  return (
    <button
      onClick={() => router.push(`/chat/${id}`)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition
        ${
          active
            ? "bg-indigo-600/30 border border-indigo-500/40"
            : "text-gray-200 hover:bg-white/10"
        }
      `}
    >
      <Avatar className="h-10 w-10 border border-white/20">
        <AvatarImage src={image} />
        <AvatarFallback className="bg-indigo-600 text-white">
          {name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <span className="text-sm font-medium truncate">
        {name || "Unknown"}
      </span>
    </button>
  )
}