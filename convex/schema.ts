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

    typing: v.optional(v.id("users")),

    // Group chat fields
    isGroup: v.optional(v.boolean()),
    name: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  }).index("by_members", ["members"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),

    seenBy: v.optional(v.array(v.id("users"))),
    isDeleted: v.optional(v.boolean()),

    // Reactions: one entry per user, one emoji per user
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userId: v.id("users"),
        })
      )
    ),
  }).index("by_conversation", ["conversationId"]),
});