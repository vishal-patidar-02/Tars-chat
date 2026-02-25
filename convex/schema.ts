import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    image: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_name", ["name"]),

  conversations: defineTable({
    members: v.array(v.id("users")),
    updatedAt: v.number(),

    typing: v.optional(v.id("users")), // 🔥 who is typing
  }).index("by_members", ["members"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),

    seenBy: v.optional(v.array(v.id("users"))), // 🔥 read status
  }).index("by_conversation", ["conversationId"]),
});
