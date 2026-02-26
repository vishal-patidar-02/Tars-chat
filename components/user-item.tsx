"use client";

import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  id: string;
  name?: string;
  image?: string;
  unreadCount?: number;
}

export default function UserItem({ id, name, image, unreadCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname.includes(id);

  return (
    <button
      onClick={() => router.push(`/chat/${id}`)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
        active
          ? "bg-indigo-600/30 border border-indigo-500/40"
          : "hover:bg-white/10"
      }`}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 border border-white/20">
          <AvatarImage src={image} />
          <AvatarFallback className="bg-indigo-600 text-white">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium truncate text-gray-200">
          {name || "Unknown"}
        </span>
      </div>

      {/* RIGHT SIDE BADGE */}
      {unreadCount && unreadCount > 0 && (
        <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-2 text-[11px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}