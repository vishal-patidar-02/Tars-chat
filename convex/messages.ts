import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* Create / Get Conversation */
export const getOrCreateConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },

  handler: async (ctx, args) => {

    if (args.user1 === args.user2) {
      throw new Error("Cannot create conversation with yourself");
    }

    const members = [args.user1, args.user2].sort();

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_members", q =>
        q.eq("members", members)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      members,
      updatedAt: Date.now(),
    });
  },
});

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
      seenBy: [args.senderId], // sender has seen it
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });
  },
});

/* Get Messages */
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();
  },
});

export const getConversationBetweenUsers = query({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },

  handler: async (ctx, args) => {
    const members = [args.user1, args.user2].sort();

    return await ctx.db
      .query("conversations")
      .withIndex("by_members", (q) => q.eq("members", members))
      .first();
  },
});

/* Set Typing */
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      typing: args.userId,
    });
  },
});

/* Clear Typing */
export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      typing: undefined,
    });
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const markSeen = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", q =>
        q.eq("conversationId", args.conversationId)
      )
      .collect()

    for (const msg of messages) {
      const seen = msg.seenBy ?? []

      if (!seen.includes(args.userId)) {
        await ctx.db.patch(msg._id, {
          seenBy: [...seen, args.userId],
        })
      }
    }
  },
})

export const getConversationsWithUnread = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    // Get only conversations where user is member
    const conversations = await ctx.db
      .query("conversations")
      .filter(q =>
        q.eq(q.field("members"), q.field("members")) // required structure
      )
      .collect();

    const userConversations = conversations.filter(c =>
      c.members.includes(args.userId)
    );

    const result = [];

    for (const convo of userConversations) {

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", q =>
          q.eq("conversationId", convo._id)
        )
        .collect();

      const unreadCount = messages.filter(msg =>
        msg.senderId !== args.userId &&
        !(msg.seenBy ?? []).includes(args.userId)
      ).length;

      result.push({
        _id: convo._id,
        members: convo.members,
        updatedAt: convo.updatedAt,
        unreadCount,
      });
    }

    // Sort by latest message
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/* Soft Delete Message */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.userId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.patch(args.messageId, {
      content: "",
      isDeleted: true,
    });
  },
});