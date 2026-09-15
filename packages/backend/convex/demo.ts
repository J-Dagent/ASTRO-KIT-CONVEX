import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const listNotes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("realtimeNotes"),
      _creationTime: v.number(),
      text: v.string(),
      authorId: v.optional(v.string()),
      authorName: v.optional(v.string()),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return await ctx.db
      .query("realtimeNotes")
      .withIndex("by_author_id_and_updated_at", (q) =>
        q.eq("authorId", user._id),
      )
      .order("desc")
      .take(10);
  },
});

export const addNote = mutation({
  args: {
    text: v.string(),
  },
  returns: v.id("realtimeNotes"),
  handler: async (ctx, { text }) => {
    const normalizedText = text.trim();
    if (normalizedText.length === 0 || normalizedText.length > 160) {
      throw new Error("A note must contain between 1 and 160 characters.");
    }

    const user = await authComponent.getAuthUser(ctx);
    return await ctx.db.insert("realtimeNotes", {
      text: normalizedText,
      authorId: user._id,
      authorName: user.name ?? undefined,
      updatedAt: Date.now(),
    });
  },
});
