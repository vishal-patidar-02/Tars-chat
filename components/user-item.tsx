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

  return (
    <button
      onClick={() => router.push(`/chat/${id}`)}
      className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-muted"
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={image} />
        <AvatarFallback>
          {name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <span className="text-sm font-medium">
        {name || "Unknown User"}
      </span>
    </button>
  )
}