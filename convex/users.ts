import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q =>
        q.eq("clerkId", args.clerkId)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        image: args.image,
        online: true,
        lastSeen: Date.now(),
      })

      return existing._id
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      image: args.image,
      online: true,
      lastSeen: Date.now(),
    })
  },
})

export const getUsers = query({
  handler: async ctx => {
    return await ctx.db.query("users").collect()
  },
})

export const searchUsers = query({
  args: {
    search: v.string(),
    currentUserId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect()

    return users
      .filter(u => u._id !== args.currentUserId)
      .filter(u =>
        u.name.toLowerCase().includes(args.search.toLowerCase())
      )
  },
})

export const setOffline = mutation({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      online: false,
      lastSeen: Date.now(),
    })
  },
})

export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", q =>
        q.eq("clerkId", args.clerkId)
      )
      .first()
  },
})