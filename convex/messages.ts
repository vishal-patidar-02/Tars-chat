import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/* Create / Get Conversation */
export const getOrCreateConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .filter(q =>
        q.or(
          q.and(
            q.eq(q.field("members")[0], args.user1),
            q.eq(q.field("members")[1], args.user2)
          ),
          q.and(
            q.eq(q.field("members")[0], args.user2),
            q.eq(q.field("members")[1], args.user1)
          )
        )
      )
      .first()

    if (existing) return existing._id

    return await ctx.db.insert("conversations", {
      members: [args.user1, args.user2],
      updatedAt: Date.now(),
    })
  },
})

/* Send Message */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      createdAt: Date.now(),
    })

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    })
  },
})

/* Get Messages */
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", q =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect()
  },
})