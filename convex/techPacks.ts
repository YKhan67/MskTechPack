import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("techPacks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateAnalysis = internalMutation({
  args: {
    id: v.id("techPacks"),
    specs: v.any(),
    svg: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      specs: args.specs,
      svgContent: args.svg,
      status: args.status,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("techPacks").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const techPackId = await ctx.db.insert("techPacks", {
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      status: "pending",
      createdAt: Date.now(),
    });
    return techPackId;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
