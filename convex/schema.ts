import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  techPacks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Original picture
    templateUrl: v.optional(v.string()), // Generated template PNG
    svgUrl: v.optional(v.string()), // Generated SVG storage ID or URL
    svgContent: v.optional(v.string()), // Raw SVG data
    specs: v.optional(v.any()), // Extracted technical specifications
    status: v.string(), // "pending", "processing", "completed", "failed"
    brandId: v.optional(v.id("brands")),
    createdAt: v.number(),
  }),
  brands: defineTable({
    name: v.string(),
    logoUrl: v.optional(v.string()),
    colors: v.array(v.string()),
    createdAt: v.number(),
  }),
});
