import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/* Create / Get Conversation */
export const getOrCreateConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },

  handler: async (ctx, args) => {
    
    const members = [args.user1, args.user2].sort();
    
    if (args.user1 === args.user2) {
      throw new Error("Cannot create conversation with yourself")
    }

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_members", q =>
        q.eq("members", members)
      )
      .first()

    if (existing) return existing._id

    return await ctx.db.insert("conversations", {
      members,
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

export const getConversationBetweenUsers = query({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },

  handler: async (ctx, args) => {
    const members = [args.user1, args.user2].sort()

    return await ctx.db
      .query("conversations")
      .withIndex("by_members", q =>
        q.eq("members", members)
      )
      .first()
  },
})