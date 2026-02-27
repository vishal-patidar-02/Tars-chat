import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

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
      .withIndex("by_members", q => q.eq("members", members))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("conversations", {
      members,
      updatedAt: Date.now(),
    });
  },
});

/* Create Group Conversation */
export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.name.trim().length === 0) throw new Error("Group name cannot be empty");
    if (args.memberIds.length < 1) throw new Error("A group needs at least 1 other member");
    const members = [...new Set([args.createdBy, ...args.memberIds])].sort();
    return await ctx.db.insert("conversations", {
      members,
      updatedAt: Date.now(),
      isGroup: true,
      name: args.name.trim(),
      createdBy: args.createdBy,
    });
  },
});

/* Update Group Conversation — rename and/or change members */
export const updateGroupConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    requesterId: v.id("users"),
    name: v.optional(v.string()),
    memberIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) throw new Error("Conversation not found");
    if (!convo.isGroup) throw new Error("Not a group conversation");
    if (!convo.members.includes(args.requesterId)) throw new Error("Not a member");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      if (args.name.trim().length === 0) throw new Error("Group name cannot be empty");
      patch.name = args.name.trim();
    }
    if (args.memberIds !== undefined) {
      const members = [...new Set([args.requesterId, ...args.memberIds])].sort();
      if (members.length < 2) throw new Error("Group must have at least 2 members");
      patch.members = members;
    }

    await ctx.db.patch(args.conversationId, patch);
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
      seenBy: [args.senderId],
    });
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });
  },
});

/* Toggle Reaction — one emoji per user; clicking same emoji removes it */
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    if (!ALLOWED_EMOJIS.includes(args.emoji)) {
      throw new Error("Emoji not allowed");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.isDeleted) throw new Error("Cannot react to a deleted message");

    const reactions = message.reactions ?? [];

    // Check if user already has ANY reaction on this message
    const existingIdx = reactions.findIndex((r) => r.userId === args.userId);

    let updatedReactions;

    if (existingIdx !== -1) {
      const existing = reactions[existingIdx];
      if (existing.emoji === args.emoji) {
        // Same emoji → remove (toggle off)
        updatedReactions = reactions.filter((_, i) => i !== existingIdx);
      } else {
        // Different emoji → replace (one emoji per user rule)
        updatedReactions = reactions.map((r, i) =>
          i === existingIdx ? { emoji: args.emoji, userId: args.userId } : r
        );
      }
    } else {
      // No existing reaction → add new
      updatedReactions = [...reactions, { emoji: args.emoji, userId: args.userId }];
    }

    await ctx.db.patch(args.messageId, { reactions: updatedReactions });
  },
});

/* Get Messages */
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const getConversationBetweenUsers = query({
  args: { user1: v.id("users"), user2: v.id("users") },
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
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { typing: args.userId });
  },
});

/* Clear Typing */
export const clearTyping = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { typing: undefined });
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const markSeen = mutation({
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", q => q.eq("conversationId", args.conversationId))
      .collect();
    for (const msg of messages) {
      const seen = msg.seenBy ?? [];
      if (!seen.includes(args.userId)) {
        await ctx.db.patch(msg._id, { seenBy: [...seen, args.userId] });
      }
    }
  },
});

export const getConversationsWithUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .filter(q => q.eq(q.field("members"), q.field("members")))
      .collect();

    const userConversations = conversations.filter(c => c.members.includes(args.userId));
    const result = [];

    for (const convo of userConversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", q => q.eq("conversationId", convo._id))
        .collect();

      const unreadCount = messages.filter(
        msg => msg.senderId !== args.userId && !(msg.seenBy ?? []).includes(args.userId)
      ).length;

      result.push({
        _id: convo._id,
        members: convo.members,
        updatedAt: convo.updatedAt,
        unreadCount,
        isGroup: convo.isGroup ?? false,
        name: convo.name,
      });
    }

    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/* Soft Delete Message */
export const deleteMessage = mutation({
  args: { messageId: v.id("messages"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== args.userId) throw new Error("Not authorized to delete this message");
    await ctx.db.patch(args.messageId, { content: "", isDeleted: true });
  },
});