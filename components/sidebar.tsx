"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UserItem from "./user-item";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Sidebar() {
  const { user } = useUser();

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);

  const users = useQuery(api.users.getUsers);

  const me = users?.find((u) => u.clerkId === user?.id);

  const results = useQuery(
    api.users.searchUsers,
    me
      ? {
          search: debounced,
          currentUserId: me._id,
        }
      : "skip",
  );

  if (!users) {
    return <aside className="w-72 p-4 border-r">Loading...</aside>;
  }

  return (
    <aside className="w-72 border-r bg-background flex flex-col">
      <div className="p-4 font-semibold">Chats</div>

      <div className="px-3 pb-3">
        <Input
          autoFocus
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {debounced && results?.length === 0 && (
          <div className="text-sm text-muted-foreground p-2">
            No users found
          </div>
        )}

        {(debounced ? results : users?.filter((u) => u._id !== me?._id))?.map(
          (user) => (
            <UserItem
              key={user._id}
              id={user._id}
              name={user.name}
              image={user.image}
            />
          ),
        )}
      </div>
    </aside>
  );
}
