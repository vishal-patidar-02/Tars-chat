"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UserItem from "./user-item";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Fuse from "fuse.js";

export default function Sidebar() {
  const { user } = useUser();
  const [search, setSearch] = useState("");

  const users = useQuery(api.users.getUsers);
  const me = users?.find((u) => u.clerkId === user?.id);

  const conversations = useQuery(
    api.messages.getConversationsWithUnread,
    me ? { userId: me._id } : "skip"
  );

  if (!users) {
    return <aside className="w-72 p-4 border-r">Loading...</aside>;
  }

  /* SEARCH MODE */
  const filteredUsers = search
    ? new Fuse(
        users.filter((u) => u._id !== me?._id),
        { keys: ["name"], threshold: 0.4 }
      )
        .search(search)
        .map((r) => r.item)
    : [];

  /* NORMAL MODE */
  const conversationItems = conversations?.map((convo) => {
    const otherId = convo.members.find(
      (id) => id !== me?._id
    );

    const otherUser = users.find(
      (u) => u._id === otherId
    );

    return {
      conversationId: convo._id,
      id: otherId!,
      name: otherUser?.name,
      image: otherUser?.image,
      unreadCount: convo.unreadCount,
    };
  });

  return (
    <aside className="w-72 border-r bg-background flex flex-col">
      <div className="p-4 font-semibold text-gray-200">Chats</div>

      <div className="px-3 pb-3">
        <Input
          autoFocus
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">

        {/* SEARCH */}
        {search && filteredUsers.length === 0 && (
          <div className="text-sm text-muted-foreground p-2">
            No users found
          </div>
        )}

        {search &&
          filteredUsers.map((user) => (
            <UserItem
              key={user._id}
              id={user._id}
              name={user.name}
              image={user.image}
            />
          ))}

        {/* CONVERSATIONS */}
        {!search && conversationItems?.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 text-center">
            No conversations yet
          </div>
        )}

        {!search &&
          conversationItems?.map((item) => (
            <UserItem
              key={item.conversationId}
              id={item.id}
              name={item.name}
              image={item.image}
              unreadCount={item.unreadCount}
            />
          ))}
      </div>
    </aside>
  );
}